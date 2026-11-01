import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { getReportsForAdmin } from "@/lib/db";

export async function GET(req: NextRequest) {
  const admin = await requireAdmin();
  if (!admin) {
    return NextResponse.json(
      { error: "Forbidden: Administrator privileges required." },
      { status: 403 }
    );
  }

  try {
    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status") || undefined;
    const targetType = searchParams.get("targetType") || undefined;

    const reports = await getReportsForAdmin({ status, targetType });
    return NextResponse.json({ success: true, reports });
  } catch (error: any) {
    console.error("[API_ADMIN_REPORTS_ERROR]", error);
    return NextResponse.json(
      { error: "Failed to fetch platform reports." },
      { status: 500 }
    );
  }
}
