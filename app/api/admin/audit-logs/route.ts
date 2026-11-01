import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { getAllAuditLogsForAdmin } from "@/lib/db";

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
    const actorId = searchParams.get("actorId") || undefined;
    const entityType = searchParams.get("entityType") || undefined;
    const action = searchParams.get("action") || undefined;
    const limit = searchParams.get("limit") ? parseInt(searchParams.get("limit")!) : 50;
    const offset = searchParams.get("offset") ? parseInt(searchParams.get("offset")!) : 0;

    const result = getAllAuditLogsForAdmin({
      actorId,
      entityType,
      action,
      limit,
      offset,
    });

    return NextResponse.json({
      success: true,
      logs: result.logs,
      total: result.total,
      limit,
      offset,
    });
  } catch (error: any) {
    console.error("[API_ADMIN_AUDIT_LOGS_ERROR]", error);
    return NextResponse.json(
      { error: "Failed to retrieve audit logs." },
      { status: 500 }
    );
  }
}
