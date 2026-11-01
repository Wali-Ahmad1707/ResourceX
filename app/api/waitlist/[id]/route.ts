import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { leaveWaitlist } from "@/lib/db";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function DELETE(request: Request, { params }: RouteParams) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json(
        { success: false, error: "Authentication required." },
        { status: 401 }
      );
    }

    const { id } = await params;
    const result = leaveWaitlist(id, user.id);

    if (!result.success) {
      const status = result.error?.includes("Unauthorized") ? 403 : 400;
      return NextResponse.json(
        { success: false, error: result.error },
        { status }
      );
    }

    return NextResponse.json({
      success: true,
      message: "You have left the waitlist for this resource.",
    });
  } catch (error: any) {
    console.error("Leave waitlist error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error." },
      { status: 500 }
    );
  }
}