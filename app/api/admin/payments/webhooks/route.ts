import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { getAllWebhookEventsForAdmin } from "@/lib/db";

export async function GET(req: NextRequest) {
  try {
    const admin = await requireAdmin();
    if (!admin) {
      return NextResponse.json(
        { error: "Forbidden: Administrator privileges required." },
        { status: 403 }
      );
    }

    const events = getAllWebhookEventsForAdmin(50);

    return NextResponse.json({
      success: true,
      events,
    });
  } catch (error: any) {
    console.error("[API_ADMIN_WEBHOOKS_ERROR]", error);
    return NextResponse.json(
      { error: "Failed to fetch webhook events." },
      { status: 500 }
    );
  }
}
