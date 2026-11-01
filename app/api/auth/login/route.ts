import { NextResponse } from "next/server";
import { z } from "zod";
import { findUserByEmail, createAuditLog } from "@/lib/db";
import { verifyPassword, signJwt, sanitizeUser, SESSION_COOKIE_NAME } from "@/lib/auth";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";

const loginSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(1, "Password is required"),
  rememberMe: z.boolean().optional(),
});

export async function POST(request: Request) {
  try {
    const ip = getClientIp(request);
    const rateCheck = checkRateLimit(`auth_login:${ip}`, 40, 60000);
    if (!rateCheck.allowed) {
      return NextResponse.json(
        { success: false, error: "Too many login attempts. Please try again later." },
        {
          status: 429,
          headers: {
            "Retry-After": rateCheck.retryAfterSec.toString(),
            "X-RateLimit-Limit": rateCheck.limit.toString(),
            "X-RateLimit-Remaining": "0",
          },
        }
      );
    }

    const body = await request.json();
    const result = loginSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error.errors[0]?.message || "Invalid input" },
        { status: 400 }
      );
    }

    const { email, password, rememberMe } = result.data;

    // 1. Find user in persistent database
    const user = await findUserByEmail(email);
    if (!user) {
      return NextResponse.json(
        { success: false, error: "Invalid email or password" },
        { status: 401 }
      );
    }

    // 2. Verify password with timing-safe comparison
    const isValid = verifyPassword(password, user.passwordHash);
    if (!isValid) {
      return NextResponse.json(
        { success: false, error: "Invalid email or password" },
        { status: 401 }
      );
    }

    // 3. Verify account status
    if (user.status !== "active") {
      return NextResponse.json(
        { success: false, error: `Account is currently ${user.status}. Please contact support.` },
        { status: 403 }
      );
    }

    // 4. Record login in audit log
    const now = new Date().toISOString();
    await createAuditLog({
      id: `aud_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      actorId: user.id,
      action: "USER_LOGGED_IN",
      entityType: "users",
      entityId: user.id,
      details: JSON.stringify({ ip: request.headers.get("x-forwarded-for") || "local", rememberMe }),
      timestamp: now,
    });

    // 5. Sign JWT and set session cookie
    const expiresInHours = rememberMe ? 24 * 7 : 24; // 7 days if remember me, else 24 hours
    const token = signJwt(
      {
        userId: user.id,
        email: user.email,
        role: user.role,
        fullName: user.fullName,
      },
      expiresInHours
    );

    const sanitized = sanitizeUser(user);

    const response = NextResponse.json({
      success: true,
      message: "Login successful",
      user: sanitized,
    });

    const isSecure = request.url.startsWith("https://") || request.headers.get("x-forwarded-proto") === "https";

    response.cookies.set({
      name: SESSION_COOKIE_NAME,
      value: token,
      httpOnly: true,
      secure: isSecure,
      sameSite: "lax",
      path: "/",
      maxAge: expiresInHours * 3600,
    });

    return response;
  } catch (error: any) {
    console.error("Login error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error during authentication" },
      { status: 500 }
    );
  }
}
