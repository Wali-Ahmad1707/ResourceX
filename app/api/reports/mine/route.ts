import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { getReportsForUser } from "@/lib/db";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json(
      { error: "Unauthorized: Please log in." },
      { status: 401 }
    );
  }

  try {
    const reports = await getReportsForUser(user.id);
    return NextResponse.json({ success: true, reports });
  } catch (error: any) {
    console.error("[API_MY_REPORTS_ERROR]", error);
    return NextResponse.json(
      { error: "Failed to fetch submitted reports." },
      { status: 500 }
    );
  }
}
