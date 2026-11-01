import { NextRequest, NextResponse } from "next/server";
import { requireAdmin, sanitizeUser } from "@/lib/auth";
import { getUserDetailsForAdmin, updateUserStatusByAdmin, updateUserRoleByAdmin } from "@/lib/db";

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
  try {
    const details = getUserDetailsForAdmin(id);
    if (!details.user) {
      return NextResponse.json(
        { error: "User not found." },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      user: {
        ...sanitizeUser(details.user),
        suspendedReason: details.user.suspendedReason || null,
        suspendedAt: details.user.suspendedAt || null,
        suspendedBy: details.user.suspendedBy || null,
      },
      stats: details.stats,
      auditLogs: details.auditLogs,
    });
  } catch (error: any) {
    console.error("[API_ADMIN_USER_DETAILS_ERROR]", error);
    return NextResponse.json(
      { error: "Failed to retrieve user details." },
      { status: 500 }
    );
  }
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
    const { action, status, role, reason } = body;

    // 1. Change Status (suspend / reactivate)
    if (action === "update_status" || status !== undefined) {
      const targetStatus = status || (action === "suspend" ? "suspended" : "active");
      if (targetStatus !== "active" && targetStatus !== "suspended") {
        return NextResponse.json(
          { error: "Invalid status. Must be 'active' or 'suspended'." },
          { status: 400 }
        );
      }

      const result = updateUserStatusByAdmin(admin.id, id, targetStatus, reason);
      if (!result.success) {
        return NextResponse.json({ error: result.error }, { status: 400 });
      }

      return NextResponse.json({
        success: true,
        message: targetStatus === "suspended" ? "User account suspended." : "User account reactivated.",
        user: sanitizeUser(result.user!),
      });
    }

    // 2. Change Role
    if (action === "update_role" || role !== undefined) {
      if (role !== "borrower" && role !== "owner" && role !== "admin") {
        return NextResponse.json(
          { error: "Invalid role. Must be 'borrower', 'owner', or 'admin'." },
          { status: 400 }
        );
      }

      const result = updateUserRoleByAdmin(admin.id, id, role);
      if (!result.success) {
        return NextResponse.json({ error: result.error }, { status: 400 });
      }

      return NextResponse.json({
        success: true,
        message: `User role updated to ${role}.`,
        user: sanitizeUser(result.user!),
      });
    }

    return NextResponse.json(
      { error: "No valid action specified (expected status update or role change)." },
      { status: 400 }
    );
  } catch (error: any) {
    console.error("[API_ADMIN_USER_UPDATE_ERROR]", error);
    return NextResponse.json(
      { error: "Failed to update user." },
      { status: 500 }
    );
  }
}
