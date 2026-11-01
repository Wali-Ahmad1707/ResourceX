import { NextResponse } from "next/server";
import { z } from "zod";
import { findUserByEmail, createUser } from "@/lib/db";
import { hashPassword, signJwt, sanitizeUser, SESSION_COOKIE_NAME } from "@/lib/auth";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";

const registerSchema = z.object({
  fullName: z.string().min(2, "Full name must be at least 2 characters").max(100),
  email: z.string().email("Invalid email address"),
  phone: z.string().min(7, "Phone number must be at least 7 characters").max(20),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .regex(/[A-Z]/, "Password must include at least one uppercase letter")
    .regex(/[a-z]/, "Password must include at least one lowercase letter")
    .regex(/[0-9]/, "Password must include at least one number"),
  confirmPassword: z.string(),
  role: z.enum(["borrower", "owner"], {
    errorMap: () => ({ message: "Please select either Borrower or Owner role" }),
  }),
  terms: z.literal(true, {
    errorMap: () => ({ message: "You must accept the terms and conditions" }),
  }),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

export async function POST(request: Request) {
  try {
    const ip = getClientIp(request);
    const rateCheck = checkRateLimit(`auth_register:${ip}`, 30, 60000);
    if (!rateCheck.allowed) {
      return NextResponse.json(
        { success: false, error: "Too many registration attempts. Please try again later." },
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
    const result = registerSchema.safeParse(body);

    if (!result.success) {
      const errorMsg = result.error.errors[0]?.message || "Validation failed";
      return NextResponse.json(
        { success: false, error: errorMsg, errors: result.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const { fullName, email, phone, password, role } = result.data;

    // 1. Check for duplicate email
    const existingUser = await findUserByEmail(email);
    if (existingUser) {
      return NextResponse.json(
        { success: false, error: "An account with this email address already exists" },
        { status: 409 }
      );
    }

    // 2. Hash password with cryptographic salt
    const passwordHash = hashPassword(password);

    // 3. Create persistent user in SQLite
    const userId = `usr_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const user = await createUser({
      id: userId,
      fullName,
      email,
      phone,
      passwordHash,
      role,
      avatar: "/placeholder-user.jpg",
    });

    const sanitized = sanitizeUser(user);

    // 4. Create JWT and set HttpOnly session cookie
    const token = signJwt({
      userId: user.id,
      email: user.email,
      role: user.role,
      fullName: user.fullName,
    });

    const response = NextResponse.json(
      {
        success: true,
        message: "Registration successful",
        user: sanitized,
      },
      { status: 201 }
    );

    const isSecure = request.url.startsWith("https://") || request.headers.get("x-forwarded-proto") === "https";

    response.cookies.set({
      name: SESSION_COOKIE_NAME,
      value: token,
      httpOnly: true,
      secure: isSecure,
      sameSite: "lax",
      path: "/",
      maxAge: 24 * 60 * 60, // 24 hours
    });

    return response;
  } catch (error: any) {
    console.error("Registration error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error during registration" },
      { status: 500 }
    );
  }
}
