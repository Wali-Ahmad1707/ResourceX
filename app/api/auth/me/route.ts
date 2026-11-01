import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { getUserAuditLogs, getUserStats } from "@/lib/db";

export async function GET() {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json(
        { success: false, error: "Unauthenticated", user: null },
        { status: 401 }
      );
    }

    const auditLogs = getUserAuditLogs(user.id, 5);
    const stats = getUserStats(user.id, user.role);

    return NextResponse.json({
      success: true,
      user,
      stats,
      recentActivity: auditLogs,
    });
  } catch (error: any) {
    console.error("Session check error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
