import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { getAllResourcesForAdmin } from "@/lib/db";

export async function GET(req: NextRequest) {
  const admin = await requireAdmin();
  if (!admin) {
    return NextResponse.json(
      { error: "Forbidden: Administrator privileges required." },
      { status: 403 }
    );
  }

  try {
    const { searchParams } = new URL(req.url);
    const moderationStatus = searchParams.get("moderationStatus") || undefined;
    const category = searchParams.get("category") || undefined;
    const search = searchParams.get("search") || undefined;

    const resources = await getAllResourcesForAdmin({ moderationStatus, category, search });
    return NextResponse.json({ success: true, resources });
  } catch (error: any) {
    console.error("[API_ADMIN_RESOURCES_ERROR]", error);
    return NextResponse.json(
      { error: "Failed to fetch platform resources." },
      { status: 500 }
    );
  }
}
