import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { getAllPlatformCategories, createPlatformCategory } from "@/lib/db";

export async function GET() {
  const admin = await requireAdmin();
  if (!admin) {
    return NextResponse.json(
      { error: "Forbidden: Administrator privileges required." },
      { status: 403 }
    );
  }

  try {
    const categories = await getAllPlatformCategories();
    return NextResponse.json({ success: true, categories });
  } catch (error: any) {
    console.error("[API_ADMIN_CATEGORIES_ERROR]", error);
    return NextResponse.json(
      { error: "Failed to fetch platform categories." },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  const admin = await requireAdmin();
  if (!admin) {
    return NextResponse.json(
      { error: "Forbidden: Administrator privileges required." },
      { status: 403 }
    );
  }

  try {
    const body = await req.json();
    const { name, slug, description, icon, displayOrder } = body;

    if (!name || typeof name !== "string" || name.trim().length === 0) {
      return NextResponse.json(
        { error: "Category name is required." },
        { status: 400 }
      );
    }

    if (!description || typeof description !== "string") {
      return NextResponse.json(
        { error: "Category description is required." },
        { status: 400 }
      );
    }

    const result = await createPlatformCategory(admin.id, {
      name,
      slug,
      description,
      icon,
      displayOrder: typeof displayOrder === "number" ? displayOrder : undefined,
    });

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      message: "Category created successfully.",
      category: result.category,
    }, { status: 201 });
  } catch (error: any) {
    console.error("[API_ADMIN_CREATE_CATEGORY_ERROR]", error);
    return NextResponse.json(
      { error: "Failed to create category." },
      { status: 500 }
    );
  }
}
