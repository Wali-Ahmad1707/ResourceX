import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { getBookingById } from "@/lib/db";
import { getResourceById } from "@/lib/mock-data";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function GET(request: Request, { params }: RouteParams) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json(
        { success: false, error: "Authentication required." },
        { status: 401 }
      );
    }

    const { id } = await params;
    const booking = await getBookingById(id);

    if (!booking) {
      return NextResponse.json(
        { success: false, error: "Booking not found." },
        { status: 404 }
      );
    }

    // Role-based access check: Only the borrower, the owner, or an admin can view private booking details
    if (booking.borrowerId !== user.id && booking.ownerId !== user.id && user.role !== "admin") {
      return NextResponse.json(
        { success: false, error: "Forbidden: You are not authorized to view this booking." },
        { status: 403 }
      );
    }

    const resource = getResourceById(booking.resourceId);

    return NextResponse.json({
      success: true,
      booking: {
        ...booking,
        resourceTitle: resource?.title || "Community Resource",
        resourceImage: resource?.images[0] || "/placeholder.jpg",
        resourceLocation: resource?.location || "Community Hub",
        deposit: resource?.deposit || "None",
      },
    });
  } catch (error: any) {
    console.error("Fetch booking detail error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error." },
      { status: 500 }
    );
  }
}