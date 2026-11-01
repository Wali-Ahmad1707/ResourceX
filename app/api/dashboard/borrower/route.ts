import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import {
  getBorrowerAnalytics,
  getBookingsByBorrower,
  getWaitlistByBorrower,
  getSavedResources,
  getReviewsForUser,
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

    if (user.role !== "borrower" && user.role !== "admin") {
      return NextResponse.json(
        { error: "Forbidden: Borrower dashboard is only accessible to borrowers." },
        { status: 403 }
      );
    }

    const analytics = await getBorrowerAnalytics(user.id);
    const bookings = await getBookingsByBorrower(user.id);
    const waitlists = await getWaitlistByBorrower(user.id);
    const saved = await getSavedResources(user.id);
    const reviews = await getReviewsForUser(user.id);
    const trustProfile = await getUserTrustProfile(user.id);

    return NextResponse.json({
      success: true,
      analytics,
      bookings,
      waitlists,
      saved,
      reviews,
      trustProfile,
    });
  } catch (error) {
    console.error("GET /api/dashboard/borrower error:", error);
    return NextResponse.json(
      { error: "Failed to load borrower dashboard data." },
      { status: 500 }
    );
  }
}
