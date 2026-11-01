import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { getAdminDashboardMetrics } from "@/lib/db";

export async function GET() {
  const admin = await requireAdmin();
  if (!admin) {
    return NextResponse.json(
      { error: "Forbidden: Administrator privileges required." },
      { status: 403 }
    );
  }

  try {
    const metrics = getAdminDashboardMetrics();
    return NextResponse.json({ success: true, metrics });
  } catch (error: any) {
    console.error("[API_ADMIN_DASHBOARD_ERROR]", error);
    return NextResponse.json(
      { error: "Failed to retrieve dashboard metrics." },
      { status: 500 }
    );
  }
}
