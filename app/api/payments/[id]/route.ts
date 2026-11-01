import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { getPaymentById, getRefundsByPaymentId } from "@/lib/db";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json(
        { error: "Authentication required." },
        { status: 401 }
      );
    }

    const { id } = await params;
    const payment = getPaymentById(id);
    if (!payment) {
      return NextResponse.json(
        { error: "Payment not found." },
        { status: 404 }
      );
    }

    if (
      payment.userId !== user.id &&
      payment.ownerId !== user.id &&
      user.role !== "admin"
    ) {
      return NextResponse.json(
        { error: "Unauthorized: You do not have permission to view this payment." },
        { status: 403 }
      );
    }

    const refunds = getRefundsByPaymentId(payment.id);

    return NextResponse.json({
      success: true,
      payment,
      refunds,
    });
  } catch (error: any) {
    console.error("[API_GET_PAYMENT_ERROR]", error);
    return NextResponse.json(
      { error: "Failed to fetch payment details." },
      { status: 500 }
    );
  }
}
