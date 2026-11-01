import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { updatePlatformCategory, deletePlatformCategory } from "@/lib/db";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const admin = await requireAdmin();
  if (!admin) {
    return NextResponse.json(
      { error: "Forbidden: Administrator privileges required." },
      { status: 403 }
    );
  }

  const { id } = await params;

  try {
    const body = await req.json();
    const { name, description, icon, isActive, displayOrder } = body;

    const result = await updatePlatformCategory(admin.id, id, {
      name,
      description,
      icon,
      isActive: typeof isActive === "number" || typeof isActive === "boolean" ? (isActive ? 1 : 0) : undefined,
      displayOrder: typeof displayOrder === "number" ? displayOrder : undefined,
    });

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      message: "Category updated successfully.",
      category: result.category,
    });
  } catch (error: any) {
    console.error("[API_ADMIN_UPDATE_CATEGORY_ERROR]", error);
    return NextResponse.json(
      { error: "Failed to update category." },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const admin = await requireAdmin();
  if (!admin) {
    return NextResponse.json(
      { error: "Forbidden: Administrator privileges required." },
      { status: 403 }
    );
  }

  const { id } = await params;

  try {
    const result = await deletePlatformCategory(admin.id, id);
    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      message: "Category deleted successfully.",
    });
  } catch (error: any) {
    console.error("[API_ADMIN_DELETE_CATEGORY_ERROR]", error);
    return NextResponse.json(
      { error: "Failed to delete category." },
      { status: 500 }
    );
  }
}
