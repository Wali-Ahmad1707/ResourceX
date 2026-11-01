import { NextResponse } from "next/server";
import { getCurrentUser, SESSION_COOKIE_NAME } from "@/lib/auth";
import { createAuditLog } from "@/lib/db";

export async function POST(request: Request) {
  try {
    const user = await getCurrentUser();
    
    if (user) {
      createAuditLog({
        id: `aud_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
        actorId: user.id,
        action: "USER_LOGGED_OUT",
        entityType: "users",
        entityId: user.id,
        details: JSON.stringify({ note: "User initiated logout" }),
        timestamp: new Date().toISOString(),
      });
    }

    const response = NextResponse.json({
      success: true,
      message: "Logged out successfully",
    });

    // Clear session cookie
    const isSecure = request.url.startsWith("https://") || request.headers.get("x-forwarded-proto") === "https";

    response.cookies.set({
      name: SESSION_COOKIE_NAME,
      value: "",
      httpOnly: true,
      secure: isSecure,
      sameSite: "lax",
      path: "/",
      maxAge: 0,
    });

    return response;
  } catch (error: any) {
    console.error("Logout error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error during logout" },
      { status: 500 }
    );
  }
}
