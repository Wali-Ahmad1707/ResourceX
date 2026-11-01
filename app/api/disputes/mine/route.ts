import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { getDisputesForUser } from "@/lib/db";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json(
      { error: "Unauthorized: Please log in." },
      { status: 401 }
    );
  }

  try {
    const disputes = await getDisputesForUser(user.id);
    return NextResponse.json({ success: true, disputes });
  } catch (error: any) {
    console.error("[API_MY_DISPUTES_ERROR]", error);
    return NextResponse.json(
      { error: "Failed to fetch user disputes." },
      { status: 500 }
    );
  }
}
