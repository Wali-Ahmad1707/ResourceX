import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import {
  createReview,
  getReviewsForResource,
  getReviewsForUser,
  getUserRatingSummary,
} from "@/lib/db";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const resourceId = searchParams.get("resourceId");
    const userId = searchParams.get("userId");

    if (resourceId) {
      const reviews = await getReviewsForResource(resourceId);
      return NextResponse.json({
        success: true,
        reviews,
        total: reviews.length,
      });
    }

    if (userId) {
      const reviews = await getReviewsForUser(userId);
      const summary = await getUserRatingSummary(userId);
      return NextResponse.json({
        success: true,
        reviews,
        summary,
        total: reviews.length,
      });
    }

    return NextResponse.json(
      { error: "Provide either resourceId or userId query parameter." },
      { status: 400 }
    );
  } catch (error) {
    console.error("GET /api/reviews error:", error);
    return NextResponse.json(
      { error: "Failed to fetch reviews." },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json(
        { error: "Unauthorized: Please log in to leave a review." },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { bookingId, rating, comment } = body;

    if (!bookingId || typeof bookingId !== "string") {
      return NextResponse.json(
        { error: "A valid bookingId is required." },
        { status: 400 }
      );
    }

    const numRating = Number(rating);
    if (isNaN(numRating) || numRating < 1 || numRating > 5) {
      return NextResponse.json(
        { error: "Rating must be an integer between 1 and 5." },
        { status: 400 }
      );
    }

    if (!comment || typeof comment !== "string" || comment.trim().length < 5) {
      return NextResponse.json(
        { error: "Comment must be at least 5 characters long." },
        { status: 400 }
      );
    }

    const result = await createReview({
      bookingId,
      reviewerId: user.id,
      rating: Math.round(numRating),
      comment: comment.trim(),
    });

    if (!result.success) {
      return NextResponse.json(
        { error: result.error },
        { status: 400 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        review: result.review,
        message: "Review submitted successfully.",
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("POST /api/reviews error:", error);
    return NextResponse.json(
      { error: "Internal server error while submitting review." },
      { status: 500 }
    );
  }
}
