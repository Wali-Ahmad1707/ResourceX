import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { completeBooking } from "@/lib/db";
import { getResourceById } from "@/lib/mock-data";

interface RouteParams {
  params: Promise<{ id: string }>;
}

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
        { success: false, error: "Forbidden: Only owners can mark equipment returns as complete." },
        { status: 403 }
      );
    }

    const { id } = await params;
    const result = await completeBooking(id, user.id);

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
      message: "Equipment return completed successfully! Reviews unlocked.",
      booking: {
        ...result.booking,
        resourceTitle: res?.title || "Equipment",
      },
    });
  } catch (error: any) {
    console.error("Complete booking error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error." },
      { status: 500 }
    );
  }
}
