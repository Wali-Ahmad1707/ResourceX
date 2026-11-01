import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { getDbResourceById, moderateResourceByAdmin } from "@/lib/db";

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
  const resource = await getDbResourceById(id);
  if (!resource) {
    return NextResponse.json(
      { error: "Resource not found." },
      { status: 404 }
    );
  }

  return NextResponse.json({ success: true, resource });
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
    const { action, reason } = body;

    if (!action || !["approve", "reject", "suspend", "restore"].includes(action)) {
      return NextResponse.json(
        { error: "Invalid action. Must be 'approve', 'reject', 'suspend', or 'restore'." },
        { status: 400 }
      );
    }

    if (action === "reject" && (!reason || reason.trim().length === 0)) {
      return NextResponse.json(
        { error: "A rejection reason is mandatory when rejecting a listing." },
        { status: 400 }
      );
    }

    const result = await moderateResourceByAdmin(admin.id, id, action, reason);
    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      message: `Resource listing successfully ${action}d.`,
      resource: result.resource,
    });
  } catch (error: any) {
    console.error("[API_ADMIN_RESOURCE_MODERATION_ERROR]", error);
    return NextResponse.json(
      { error: "Failed to moderate resource." },
      { status: 500 }
    );
  }
}
