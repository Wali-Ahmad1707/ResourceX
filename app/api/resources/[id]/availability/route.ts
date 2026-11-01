import { NextResponse } from "next/server";
import { getResourceApprovedBookings, getWaitlistByResource } from "@/lib/db";
import { getResourceById } from "@/lib/mock-data";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function GET(request: Request, { params }: RouteParams) {
  try {
    const { id } = await params;
    const resource = getResourceById(id);

    if (!resource) {
      return NextResponse.json(
        { success: false, error: "Resource not found in catalog." },
        { status: 404 }
      );
    }

    // Retrieve all approved bookings from SQLite
    const approved = getResourceApprovedBookings(id);
    const bookedRanges = approved.map((b) => ({
      startDate: b.startDate,
      endDate: b.endDate,
      status: b.status,
    }));

    // Waitlist queue count
    const waitlist = getWaitlistByResource(id);

    return NextResponse.json({
      success: true,
      resourceId: id,
      availability: resource.availability,
      bookedRanges,
      waitlistCount: waitlist.length,
      maxDuration: resource.maxDuration,
    });
  } catch (error: any) {
    console.error("Availability check error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error fetching availability." },
      { status: 500 }
    );
  }
}