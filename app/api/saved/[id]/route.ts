import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { unsaveResource } from "@/lib/db";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function DELETE(request: Request, { params }: RouteParams) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json(
        { success: false, error: "Authentication required." },
        { status: 401 }
      );
    }

    const { id } = await params;
    unsaveResource(user.id, id);

    return NextResponse.json({
      success: true,
      message: "Resource removed from saved collection.",
    });
  } catch (error: any) {
    console.error("Unsave resource error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error." },
      { status: 500 }
    );
  }
}