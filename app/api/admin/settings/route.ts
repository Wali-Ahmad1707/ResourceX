import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { getAllPlatformSettings, updatePlatformSetting } from "@/lib/db";

export async function GET() {
  const admin = await requireAdmin();
  if (!admin) {
    return NextResponse.json(
      { error: "Forbidden: Administrator privileges required." },
      { status: 403 }
    );
  }

  try {
    const settings = getAllPlatformSettings();
    return NextResponse.json({ success: true, settings });
  } catch (error: any) {
    console.error("[API_ADMIN_SETTINGS_GET_ERROR]", error);
    return NextResponse.json(
      { error: "Failed to fetch platform settings." },
      { status: 500 }
    );
  }
}

export async function PATCH(req: NextRequest) {
  const admin = await requireAdmin();
  if (!admin) {
    return NextResponse.json(
      { error: "Forbidden: Administrator privileges required." },
      { status: 403 }
    );
  }

  try {
    const body = await req.json();
    const { key, value } = body;

    if (!key || typeof key !== "string") {
      return NextResponse.json(
        { error: "Setting key is required." },
        { status: 400 }
      );
    }

    if (value === undefined || typeof value !== "string") {
      return NextResponse.json(
        { error: "Setting value must be a string." },
        { status: 400 }
      );
    }

    const result = updatePlatformSetting(admin.id, key, value);
    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      message: `Setting '${key}' updated successfully.`,
      setting: result.setting,
    });
  } catch (error: any) {
    console.error("[API_ADMIN_SETTINGS_UPDATE_ERROR]", error);
    return NextResponse.json(
      { error: "Failed to update platform setting." },
      { status: 500 }
    );
  }
}
