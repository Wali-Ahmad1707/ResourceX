import { NextResponse } from "next/server";
import { z } from "zod";
import { getCurrentUser } from "@/lib/auth";
import { joinWaitlist, getWaitlistByBorrower, getDbResourceById } from "@/lib/db";
import { getResourceById } from "@/lib/mock-data";

const waitlistSchema = z.object({
  resourceId: z.string().min(1, "Resource ID is required"),
  startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Start date must be YYYY-MM-DD"),
  endDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "End date must be YYYY-MM-DD"),
});

export async function POST(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json(
        { success: false, error: "Authentication required to join the waitlist." },
        { status: 401 }
      );
    }

    if (user.role !== "borrower" && user.role !== "admin") {
      return NextResponse.json(
        { success: false, error: "Only borrower accounts can join resource waitlists." },
        { status: 403 }
      );
    }

    const body = await request.json();
    const result = waitlistSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error.errors[0]?.message || "Invalid data" },
        { status: 400 }
      );
    }

    const { resourceId, startDate, endDate } = result.data;
    const dbResource = getDbResourceById(resourceId);
    const mockResource = getResourceById(resourceId);
    const resource = dbResource || mockResource;

    if (!resource) {
      return NextResponse.json(
        { success: false, error: "Resource not found." },
        { status: 404 }
      );
    }

    const joinResult = joinWaitlist({
      resourceId,
      borrowerId: user.id,
      startDate,
      endDate,
      resourceTitle: resource.title,
    });

    if (!joinResult.success) {
      return NextResponse.json(
        { success: false, error: joinResult.error },
        { status: 400 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        message: `Successfully added to waitlist at position #${joinResult.waitlist!.position}. We'll notify you as soon as dates clear!`,
        waitlist: {
          ...joinResult.waitlist,
          resourceTitle: resource.title,
          resourceImage: resource.images[0] || "/placeholder.jpg",
        },
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("Join waitlist error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error while joining waitlist." },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json(
        { success: false, error: "Authentication required." },
        { status: 401 }
      );
    }

    const entries = getWaitlistByBorrower(user.id);
    const enriched = entries.map((w) => {
      const res = getResourceById(w.resourceId);
      return {
        ...w,
        resourceTitle: res?.title || "Community Resource",
        resourceImage: res?.images[0] || "/placeholder.jpg",
        resourceLocation: res?.location || "Community Hub",
      };
    });

    return NextResponse.json({
      success: true,
      waitlist: enriched,
    });
  } catch (error: any) {
    console.error("Get waitlist error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error." },
      { status: 500 }
    );
  }
}