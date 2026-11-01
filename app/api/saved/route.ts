import { NextResponse } from "next/server";
import { z } from "zod";
import { getCurrentUser } from "@/lib/auth";
import { saveResource, getSavedResources, isResourceSaved } from "@/lib/db";

const saveSchema = z.object({
  resourceId: z.string().min(1, "Resource ID is required"),
});

export async function GET(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json(
        { success: false, error: "Authentication required." },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const resourceId = searchParams.get("resourceId");

    if (resourceId) {
      const isSaved = isResourceSaved(user.id, resourceId);
      return NextResponse.json({
        success: true,
        isSaved,
      });
    }

    const saved = getSavedResources(user.id);

    return NextResponse.json({
      success: true,
      count: saved.length,
      saved: saved,
      savedResources: saved,
    });
  } catch (error: any) {
    console.error("Get saved resources error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error." },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json(
        { success: false, error: "Authentication required to bookmark resources." },
        { status: 401 }
      );
    }

    const body = await request.json();
    const parse = saveSchema.safeParse(body);

    if (!parse.success) {
      return NextResponse.json(
        { success: false, error: parse.error.errors[0]?.message || "Invalid input" },
        { status: 400 }
      );
    }

    const result = saveResource(user.id, parse.data.resourceId);

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error || "Failed to save resource." },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { success: true, message: "Resource added to your saved wishlist." },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("Save resource error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to save resource." },
      { status: 500 }
    );
  }
}