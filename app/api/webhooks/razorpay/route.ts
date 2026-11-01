import { NextRequest, NextResponse } from "next/server";
import { 
  recordWebhookEvent, 
  updateWebhookEventStatus, 
  capturePayment, 
  markPaymentFailed 
} from "@/lib/db";
import { verifyWebhookSignature } from "@/lib/razorpay";

export async function POST(req: NextRequest) {
  try {
    const signature = req.headers.get("x-razorpay-signature");
    if (!signature) {
      return NextResponse.json(
        { error: "Missing x-razorpay-signature header." },
        { status: 400 }
      );
    }

    const rawBody = await req.text();

    // Verify webhook signature
    const isValid = verifyWebhookSignature({
      rawBody,
      signature,
    });

    if (!isValid) {
      return NextResponse.json(
        { error: "Invalid webhook signature." },
        { status: 400 }
      );
    }

    let payload: any;
    try {
      payload = JSON.parse(rawBody);
    } catch {
      return NextResponse.json(
        { error: "Invalid JSON payload in webhook body." },
        { status: 400 }
      );
    }

    const eventType = payload.event || "unknown";
    const eventId = payload.event_id || payload.id || req.headers.get("x-razorpay-event-id") || `evt_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;

    // Record webhook event for idempotency
    const record = recordWebhookEvent({
      eventId,
      eventType,
      payload: rawBody,
    });

    if (record.duplicate) {
      return NextResponse.json(
        { status: "ignored", message: "Duplicate webhook event already processed." },
        { status: 200 }
      );
    }

    // Process event types
    switch (eventType) {
      case "payment.captured": {
        const paymentEntity = payload.payload?.payment?.entity;
        if (paymentEntity?.order_id && paymentEntity?.id) {
          capturePayment({
            razorpayOrderId: paymentEntity.order_id,
            razorpayPaymentId: paymentEntity.id,
          });
        }
        break;
      }

      case "payment.failed": {
        const paymentEntity = payload.payload?.payment?.entity;
        if (paymentEntity?.order_id) {
          markPaymentFailed({
            razorpayOrderId: paymentEntity.order_id,
            failureReason: paymentEntity.error_description || "Payment failed via webhook notification.",
          });
        }
        break;
      }

      case "refund.processed": {
        // Handled automatically via DB createRefund or manual webhook reconciliation
        break;
      }

      default:
        // Ignore unhandled event types gracefully
        break;
    }

    updateWebhookEventStatus(eventId, "processed");

    return NextResponse.json(
      { status: "success", received: true, eventId },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("[API_WEBHOOK_RAZORPAY_ERROR]", error);
    return NextResponse.json(
      { error: "Internal server error while processing webhook." },
      { status: 500 }
    );
  }
}
