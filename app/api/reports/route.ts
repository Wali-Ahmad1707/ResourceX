import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { createReport, ReportTargetType } from "@/lib/db";

export async function POST(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json(
      { error: "Unauthorized: You must be logged in to submit a report." },
      { status: 401 }
    );
  }

  try {
    const body = await req.json();
    const { targetType, targetId, reason, details, evidence } = body;

    if (!targetType || !["user", "resource", "booking"].includes(targetType)) {
      return NextResponse.json(
        { error: "Invalid targetType. Must be 'user', 'resource', or 'booking'." },
        { status: 400 }
      );
    }

    if (!targetId || typeof targetId !== "string") {
      return NextResponse.json(
        { error: "targetId is required." },
        { status: 400 }
      );
    }

    if (!reason || typeof reason !== "string" || reason.trim().length === 0) {
      return NextResponse.json(
        { error: "A valid report reason is required." },
        { status: 400 }
      );
    }

    if (!details || typeof details !== "string" || details.trim().length === 0) {
      return NextResponse.json(
        { error: "Detailed explanation is required." },
        { status: 400 }
      );
    }

    const result = createReport({
      reporterId: user.id,
      targetType: targetType as ReportTargetType,
      targetId,
      reason,
      details,
      evidence: Array.isArray(evidence) ? evidence : undefined,
    });

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      message: "Report submitted successfully. Our safety team is investigating.",
      report: result.report,
    }, { status: 201 });
  } catch (error: any) {
    console.error("[API_CREATE_REPORT_ERROR]", error);
    return NextResponse.json(
      { error: "Failed to submit report." },
      { status: 500 }
    );
  }
}
