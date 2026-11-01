import { NextResponse } from "next/server";
import { z } from "zod";
import { getCurrentUser, hashPassword, verifyPassword, sanitizeUser } from "@/lib/auth";
import { findUserById, updateUser } from "@/lib/db";

const profileUpdateSchema = z.object({
  fullName: z.string().min(2, "Full name must be at least 2 characters").max(100).optional(),
  phone: z.string().min(7, "Phone number must be at least 7 characters").max(20).optional(),
  avatar: z.string().optional(),
  currentPassword: z.string().optional(),
  newPassword: z
    .string()
    .min(8, "New password must be at least 8 characters")
    .regex(/[A-Z]/, "Password must include at least one uppercase letter")
    .regex(/[a-z]/, "Password must include at least one lowercase letter")
    .regex(/[0-9]/, "Password must include at least one number")
    .optional(),
});

export async function PATCH(request: Request) {
  try {
    const sessionUser = await getCurrentUser();

    if (!sessionUser) {
      return NextResponse.json(
        { success: false, error: "Unauthorized. Please log in." },
        { status: 401 }
      );
    }

    const body = await request.json();
    const result = profileUpdateSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error.errors[0]?.message || "Invalid profile data" },
        { status: 400 }
      );
    }

    const { fullName, phone, avatar, currentPassword, newPassword } = result.data;

    const dbUser = await findUserById(sessionUser.id);
    if (!dbUser) {
      return NextResponse.json(
        { success: false, error: "User record not found" },
        { status: 404 }
      );
    }

    const updates: {
      fullName?: string;
      phone?: string;
      avatar?: string;
      passwordHash?: string;
    } = {};

    if (fullName !== undefined) updates.fullName = fullName;
    if (phone !== undefined) updates.phone = phone;
    if (avatar !== undefined) updates.avatar = avatar;

    // Handle password change if requested
    if (newPassword) {
      if (!currentPassword) {
        return NextResponse.json(
          { success: false, error: "Current password is required to change your password" },
          { status: 400 }
        );
      }

      const isCurrentValid = verifyPassword(currentPassword, dbUser.passwordHash);
      if (!isCurrentValid) {
        return NextResponse.json(
          { success: false, error: "Current password entered is incorrect" },
          { status: 400 }
        );
      }

      updates.passwordHash = hashPassword(newPassword);
    }

    const updatedUser = await updateUser(sessionUser.id, updates);
    if (!updatedUser) {
      return NextResponse.json(
        { success: false, error: "Failed to update profile record" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Profile updated successfully",
      user: sanitizeUser(updatedUser),
    });
  } catch (error: any) {
    console.error("Profile update error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error while updating profile" },
      { status: 500 }
    );
  }
}
