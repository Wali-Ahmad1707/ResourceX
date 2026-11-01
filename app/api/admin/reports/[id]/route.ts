import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { getReportById, updateReportByAdmin } from "@/lib/db";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const admin = await requireAdmin();
  if (!admin) {
    return NextResponse.json(
      { error: "Forbidden: Administrator privileges required." },
      { status: 403 }
    );
  }

  const { id } = await params;
  const report = await getReportById(id);
  if (!report) {
    return NextResponse.json(
      { error: "Report not found." },
      { status: 404 }
    );
  }

  return NextResponse.json({ success: true, report });
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const admin = await requireAdmin();
  if (!admin) {
    return NextResponse.json(
      { error: "Forbidden: Administrator privileges required." },
      { status: 403 }
    );
  }

  const { id } = await params;

  try {
    const body = await req.json();
    const { status, assignedAdminId, adminNotes, resolution, actionTaken } = body;

    const result = await updateReportByAdmin(admin.id, id, {
      status,
      assignedAdminId,
      adminNotes,
      resolution,
      actionTaken,
    });

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      message: "Report updated successfully.",
      report: result.report,
    });
  } catch (error: any) {
    console.error("[API_ADMIN_UPDATE_REPORT_ERROR]", error);
    return NextResponse.json(
      { error: "Failed to update report." },
      { status: 500 }
    );
  }
}
