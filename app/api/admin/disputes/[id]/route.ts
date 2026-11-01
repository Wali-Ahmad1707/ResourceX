import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { getDisputeById, updateDisputeByAdmin } from "@/lib/db";

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
  const dispute = getDisputeById(id);
  if (!dispute) {
    return NextResponse.json(
      { error: "Dispute not found." },
      { status: 404 }
    );
  }

  return NextResponse.json({ success: true, dispute });
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

    const result = updateDisputeByAdmin(admin.id, id, {
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
      message: "Dispute updated successfully.",
      dispute: result.dispute,
    });
  } catch (error: any) {
    console.error("[API_ADMIN_UPDATE_DISPUTE_ERROR]", error);
    return NextResponse.json(
      { error: "Failed to update dispute." },
      { status: 500 }
    );
  }
}
