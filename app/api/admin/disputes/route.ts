import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { getDisputesForAdmin } from "@/lib/db";

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

    const disputes = getDisputesForAdmin({ status });
    return NextResponse.json({ success: true, disputes });
  } catch (error: any) {
    console.error("[API_ADMIN_DISPUTES_ERROR]", error);
    return NextResponse.json(
      { error: "Failed to fetch booking disputes." },
      { status: 500 }
    );
  }
}
