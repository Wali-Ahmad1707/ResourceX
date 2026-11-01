import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { getAllPaymentsForAdmin, getAdminPaymentMetrics } from "@/lib/db";

export async function GET(req: NextRequest) {
  try {
    const admin = await requireAdmin();
    if (!admin) {
      return NextResponse.json(
        { error: "Forbidden: Administrator privileges required." },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status") || undefined;
    const search = searchParams.get("search") || undefined;
    const limit = searchParams.get("limit") ? parseInt(searchParams.get("limit")!, 10) : 50;
    const offset = searchParams.get("offset") ? parseInt(searchParams.get("offset")!, 10) : 0;

    const { payments, total } = await getAllPaymentsForAdmin({
      status,
      search,
      limit,
      offset,
    });

    const metrics = await getAdminPaymentMetrics();

    return NextResponse.json({
      success: true,
      payments,
      total,
      metrics,
    });
  } catch (error: any) {
    console.error("[API_ADMIN_PAYMENTS_ERROR]", error);
    return NextResponse.json(
      { error: "Failed to fetch admin payments." },
      { status: 500 }
    );
  }
}
