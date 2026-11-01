import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { approveBooking } from "@/lib/db";
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
        { success: false, error: "Forbidden: Only owners can approve booking requests." },
        { status: 403 }
      );
    }

    const { id } = await params;
    const result = approveBooking(id, user.id);

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
      message: "Booking request approved successfully! Dates are reserved.",
      booking: {
        ...result.booking,
        resourceTitle: res?.title || "Equipment",
      },
    });
  } catch (error: any) {
    console.error("Approve booking error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error while approving booking." },
      { status: 500 }
    );
  }
}