import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { createDispute } from "@/lib/db";

export async function POST(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json(
      { error: "Unauthorized: You must be logged in to open a dispute." },
      { status: 401 }
    );
  }

  try {
    const body = await req.json();
    const { bookingId, reason, description, evidence } = body;

    if (!bookingId || typeof bookingId !== "string") {
      return NextResponse.json(
        { error: "bookingId is required." },
        { status: 400 }
      );
    }

    if (!reason || typeof reason !== "string" || reason.trim().length === 0) {
      return NextResponse.json(
        { error: "Dispute reason is required." },
        { status: 400 }
      );
    }

    if (!description || typeof description !== "string" || description.trim().length === 0) {
      return NextResponse.json(
        { error: "Dispute description is required." },
        { status: 400 }
      );
    }

    const result = await createDispute({
      bookingId,
      initiatorId: user.id,
      reason,
      description,
      evidence: Array.isArray(evidence) ? evidence : undefined,
    });

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      message: "Dispute opened successfully. Platform administration will review the case.",
      dispute: result.dispute,
    }, { status: 201 });
  } catch (error: any) {
    console.error("[API_CREATE_DISPUTE_ERROR]", error);
    return NextResponse.json(
      { error: "Failed to create dispute." },
      { status: 500 }
    );
  }
}
