import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { getPaymentsForOwner } from "@/lib/db";

export async function GET(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json(
        { error: "Authentication required." },
        { status: 401 }
      );
    }

    const payments = await getPaymentsForOwner(user.id);
    return NextResponse.json({
      success: true,
      payments,
    });
  } catch (error: any) {
    console.error("[API_OWNER_PAYMENTS_ERROR]", error);
    return NextResponse.json(
      { error: "Failed to fetch owner payments." },
      { status: 500 }
    );
  }
}
