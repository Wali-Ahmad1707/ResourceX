import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { cancelBooking } from "@/lib/db";
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

    const { id } = await params;
    const result = await cancelBooking(id, user.id);

    if (!result.success) {
      const status = result.error?.includes("Unauthorized") 
        ? 403 
        : result.error?.toLowerCase().includes("not found") 
        ? 404 
        : 400;
      return NextResponse.json(
        { success: false, error: result.error },
        { status }
      );
    }

    const res = getResourceById(result.booking!.resourceId);

    return NextResponse.json({
      success: true,
      message: "Booking cancelled successfully.",
      booking: {
        ...result.booking,
        resourceTitle: res?.title || "Equipment",
      },
    });
  } catch (error: any) {
    console.error("Cancel booking error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error while cancelling booking." },
      { status: 500 }
    );
  }
}