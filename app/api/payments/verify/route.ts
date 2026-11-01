import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { capturePayment, markPaymentFailed, getPaymentByOrderId } from "@/lib/db";
import { verifyPaymentSignature } from "@/lib/razorpay";

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json(
        { error: "Authentication required to verify payment." },
        { status: 401 }
      );
    }

    const body = await req.json();
    const { orderId, paymentId, signature } = body;

    if (!orderId || !paymentId || !signature) {
      return NextResponse.json(
        { error: "Missing required verification fields: orderId, paymentId, and signature are required." },
        { status: 400 }
      );
    }

    // Verify payment record exists
    const existingPayment = getPaymentByOrderId(orderId);
    if (!existingPayment) {
      return NextResponse.json(
        { error: "Payment record not found for this order." },
        { status: 404 }
      );
    }

    // Validate ownership
    if (existingPayment.userId !== user.id && user.role !== "admin") {
      return NextResponse.json(
        { error: "Unauthorized: You cannot verify payment for another user's order." },
        { status: 403 }
      );
    }

    // Server-side cryptographic HMAC SHA-256 verification
    const isValid = verifyPaymentSignature({
      orderId,
      paymentId,
      signature,
    });

    if (!isValid) {
      markPaymentFailed({
        razorpayOrderId: orderId,
        failureReason: "Invalid HMAC SHA-256 payment signature verification.",
      });

      return NextResponse.json(
        { error: "Invalid payment signature. Verification failed." },
        { status: 400 }
      );
    }

    // Capture payment and update booking depositStatus
    const captureRes = capturePayment({
      razorpayOrderId: orderId,
      razorpayPaymentId: paymentId,
      razorpaySignature: signature,
    });

    if (!captureRes.success || !captureRes.payment) {
      return NextResponse.json(
        { error: captureRes.error || "Failed to capture payment." },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Payment verified and deposit successfully captured.",
      payment: captureRes.payment,
    });
  } catch (error: any) {
    console.error("[API_PAYMENT_VERIFY_ERROR]", error);
    return NextResponse.json(
      { error: "Internal server error during payment verification." },
      { status: 500 }
    );
  }
}
