import { NextResponse } from "next/server";
import { z } from "zod";
import { getCurrentUser } from "@/lib/auth";
import { rejectBooking } from "@/lib/db";
import { getResourceById } from "@/lib/mock-data";

interface RouteParams {
  params: Promise<{ id: string }>;
}

const rejectSchema = z.object({
  reason: z.string().max(500).optional(),
});

export async function POST(request: Request, { params }: RouteParams) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json(
        { success: false, error: "Authentication required." },
        { status: 401 }
      );
    }

    if (user.role !== "owner" && user.role !== "admin") {
      return NextResponse.json(
        { success: false, error: "Forbidden: Only owners can reject booking requests." },
        { status: 403 }
      );
    }

    const { id } = await params;
    let reason: string | undefined;

    try {
      const body = await request.json();
      const parse = rejectSchema.safeParse(body);
      if (parse.success) {
        reason = parse.data.reason;
      }
    } catch {
      // Body is optional
    }

    const result = rejectBooking(id, user.id, reason);

    if (!result.success) {
      const status = result.error?.includes("Unauthorized") ? 403 : 400;
      return NextResponse.json(
        { success: false, error: result.error },
        { status }
      );
    }

    const res = getResourceById(result.booking!.resourceId);

    return NextResponse.json({
      success: true,
      message: "Booking request declined.",
      booking: {
        ...result.booking,
        resourceTitle: res?.title || "Equipment",
      },
    });
  } catch (error: any) {
    console.error("Reject booking error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error while declining booking." },
      { status: 500 }
    );
  }
}