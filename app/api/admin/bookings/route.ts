import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { getAllBookingsForAdmin } from "@/lib/db";

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
    const status = searchParams.get("status") || undefined;
    const search = searchParams.get("search") || undefined;

    const bookings = await getAllBookingsForAdmin({ status, search });
    return NextResponse.json({ success: true, bookings });
  } catch (error: any) {
    console.error("[API_ADMIN_BOOKINGS_ERROR]", error);
    return NextResponse.json(
      { error: "Failed to fetch platform bookings." },
      { status: 500 }
    );
  }
}
