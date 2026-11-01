import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { getBookingById, getDbResourceById, createPaymentOrder } from "@/lib/db";
import { getRazorpayClient, parseDepositToPaise, formatPaiseToINR } from "@/lib/razorpay";
import { checkRateLimit } from "@/lib/rate-limit";

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json(
        { error: "Authentication required to initiate payment." },
        { status: 401 }
      );
    }

    const rateCheck = checkRateLimit(`pay_order:${user.id}`, 50, 60000);
    if (!rateCheck.allowed) {
      return NextResponse.json(
        { error: "Too many payment requests. Please try again shortly." },
        {
          status: 429,
          headers: {
            "Retry-After": rateCheck.retryAfterSec.toString(),
          },
        }
      );
    }

    const body = await req.json();
    const { bookingId } = body;

    if (!bookingId) {
      return NextResponse.json(
        { error: "Booking ID is required." },
        { status: 400 }
      );
    }

    const booking = await getBookingById(bookingId);
    if (!booking) {
      return NextResponse.json(
        { error: "Booking not found." },
        { status: 404 }
      );
    }

    if (booking.borrowerId !== user.id && user.role !== "admin") {
      return NextResponse.json(
        { error: "Unauthorized: You may only initiate payment for your own bookings." },
        { status: 403 }
      );
    }

    if (booking.status === "rejected" || booking.status === "cancelled") {
      return NextResponse.json(
        { error: `Cannot pay deposit for ${booking.status} booking.` },
        { status: 400 }
      );
    }

    if (booking.depositStatus === "paid") {
      return NextResponse.json(
        { error: "Security deposit has already been paid for this booking." },
        { status: 400 }
      );
    }

    const resource = await getDbResourceById(booking.resourceId);
    let amountPaise = parseDepositToPaise(resource?.deposit);
    // If deposit parsed is 0, provide default minimum 5000 paise (₹50)
    if (amountPaise <= 0) {
      amountPaise = 5000;
    }

    // Create Razorpay order
    let orderId: string;
    const rzpClient = getRazorpayClient();

    if (rzpClient) {
      try {
        const order = await rzpClient.orders.create({
          amount: amountPaise,
          currency: "INR",
          receipt: `rcpt_${booking.id.replace(/[^a-zA-Z0-9]/g, "").slice(-12)}`,
          notes: {
            bookingId: booking.id,
            resourceId: booking.resourceId,
            borrowerId: user.id,
          },
        });
        orderId = order.id;
      } catch (err: any) {
        // Fallback test order id if test keys cannot reach network
        orderId = `order_test_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
      }
    } else {
      orderId = `order_test_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    }

    const orderRes = await createPaymentOrder({
      userId: user.id,
      bookingId: booking.id,
      resourceId: booking.resourceId,
      ownerId: booking.ownerId,
      amount: amountPaise,
      paymentType: "security_deposit",
      razorpayOrderId: orderId,
    });

    if (!orderRes.success || !orderRes.payment) {
      return NextResponse.json(
        { error: orderRes.error || "Failed to create payment record." },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      orderId,
      amount: amountPaise,
      currency: "INR",
      keyId: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || process.env.RAZORPAY_KEY_ID || "rzp_test_placeholder",
      bookingId: booking.id,
      paymentId: orderRes.payment.id,
      resourceTitle: resource?.title || "Resource",
      depositAmountFormatted: formatPaiseToINR(amountPaise),
    });
  } catch (error: any) {
    console.error("[API_CREATE_ORDER_ERROR]", error);
    return NextResponse.json(
      { error: "Internal server error while creating payment order." },
      { status: 500 }
    );
  }
}
