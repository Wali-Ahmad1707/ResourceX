import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import {
  getOwnerAnalytics,
  getDbResourcesByOwner,
  getBookingsByOwner,
  getUserTrustProfile,
} from "@/lib/db";

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json(
        { error: "Unauthorized: Please log in." },
        { status: 401 }
      );
    }

    if (user.role !== "owner" && user.role !== "admin") {
      return NextResponse.json(
        { error: "Forbidden: Owner dashboard is only accessible to resource owners." },
        { status: 403 }
      );
    }

    const analytics = getOwnerAnalytics(user.id);
    const resources = getDbResourcesByOwner(user.id);
    const bookings = getBookingsByOwner(user.id);
    const trustProfile = getUserTrustProfile(user.id);

    return NextResponse.json({
      success: true,
      analytics,
      resources,
      bookings,
      trustProfile,
    });
  } catch (error) {
    console.error("GET /api/dashboard/owner error:", error);
    return NextResponse.json(
      { error: "Failed to load owner dashboard data." },
      { status: 500 }
    );
  }
}
