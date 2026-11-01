import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { getPaymentsForBorrower } from "@/lib/db";

export async function GET(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json(
        { error: "Authentication required." },
        { status: 401 }
      );
    }

    const payments = await getPaymentsForBorrower(user.id);
    return NextResponse.json({
      success: true,
      payments,
    });
  } catch (error: any) {
    console.error("[API_BORROWER_PAYMENTS_ERROR]", error);
    return NextResponse.json(
      { error: "Failed to fetch borrower payments." },
      { status: 500 }
    );
  }
}
