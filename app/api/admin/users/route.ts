import { NextRequest, NextResponse } from "next/server";
import { requireAdmin, sanitizeUser } from "@/lib/auth";
import { getAllUsersForAdmin } from "@/lib/db";

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
    const role = searchParams.get("role") || undefined;
    const status = searchParams.get("status") || undefined;
    const search = searchParams.get("search") || undefined;

    const rawUsers = getAllUsersForAdmin({ role, status, search });
    const users = rawUsers.map((u) => ({
      ...sanitizeUser(u),
      suspendedReason: u.suspendedReason || null,
      suspendedAt: u.suspendedAt || null,
      suspendedBy: u.suspendedBy || null,
    }));

    return NextResponse.json({ success: true, users });
  } catch (error: any) {
    console.error("[API_ADMIN_USERS_ERROR]", error);
    return NextResponse.json(
      { error: "Failed to fetch platform users." },
      { status: 500 }
    );
  }
}
