import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { updateReview } from "@/lib/db";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json(
        { error: "Unauthorized: Please log in." },
        { status: 401 }
      );
    }

    const { id } = await params;
    const body = await request.json();
    const { rating, comment } = body;

    const updates: { rating?: number; comment?: string } = {};

    if (rating !== undefined) {
      const numRating = Number(rating);
      if (isNaN(numRating) || numRating < 1 || numRating > 5) {
        return NextResponse.json(
          { error: "Rating must be between 1 and 5." },
          { status: 400 }
        );
      }
      updates.rating = Math.round(numRating);
    }

    if (comment !== undefined) {
      if (typeof comment !== "string" || comment.trim().length < 5) {
        return NextResponse.json(
          { error: "Comment must be at least 5 characters long." },
          { status: 400 }
        );
      }
      updates.comment = comment.trim();
    }

    const result = updateReview(id, user.id, updates);

    if (!result.success) {
      const statusCode = result.error?.startsWith("Unauthorized") ? 403 : 400;
      return NextResponse.json(
        { error: result.error },
        { status: statusCode }
      );
    }

    return NextResponse.json({
      success: true,
      review: result.review,
      message: "Review updated successfully.",
    });
  } catch (error) {
    console.error("PATCH /api/reviews/[id] error:", error);
    return NextResponse.json(
      { error: "Failed to update review." },
      { status: 500 }
    );
  }
}
