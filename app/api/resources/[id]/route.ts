import { NextResponse } from "next/server";
import { z } from "zod";
import { getCurrentUser } from "@/lib/auth";
import { getDbResourceById, updateResource, deleteResource } from "@/lib/db";

interface RouteParams {
  params: Promise<{ id: string }>;
}

const updateSchema = z.object({
  title: z.string().min(3).max(120).optional(),
  tagline: z.string().max(200).optional(),
  description: z.string().min(10).optional(),
  longDescription: z.string().optional(),
  category: z.string().optional(),
  condition: z.enum(["Like New", "Excellent", "Good", "Fair"]).optional(),
  location: z.string().optional(),
  images: z.array(z.string()).optional(),
  deposit: z.union([z.string(), z.number()]).transform((v) => typeof v === "number" ? `$${v}` : v).optional(),
  maxDuration: z.string().optional(),
  pickupInstructions: z.string().optional(),
  safetyInstructions: z.string().optional(),
  borrowingTerms: z.string().optional(),
  specs: z.union([
    z.record(z.string()),
    z.array(z.string()).transform((arr) => Object.fromEntries(arr.map((s, i) => [`Feature ${i + 1}`, s])))
  ]).optional(),
  availabilityStatus: z.enum(["Available", "In Use", "Waitlist", "Paused", "Maintenance"]).optional(),
  status: z.enum(["active", "paused", "deleted"]).optional(),
});

export async function GET(request: Request, { params }: RouteParams) {
  try {
    const { id } = await params;
    const resource = getDbResourceById(id);

    if (!resource || resource.status === "deleted") {
      return NextResponse.json(
        { success: false, error: "Resource not found in catalog." },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      resource,
    });
  } catch (error: any) {
    console.error("Get resource error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error." },
      { status: 500 }
    );
  }
}

export async function PATCH(request: Request, { params }: RouteParams) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json(
        { success: false, error: "Authentication required." },
        { status: 401 }
      );
    }

    const { id } = await params;
    const body = await request.json();
    const parse = updateSchema.safeParse(body);

    if (!parse.success) {
      return NextResponse.json(
        { success: false, error: parse.error.errors[0]?.message || "Validation failed" },
        { status: 400 }
      );
    }

    const result = updateResource(id, user.id, parse.data);

    if (!result.success) {
      const status = result.error?.includes("Unauthorized") ? 403 : 400;
      return NextResponse.json(
        { success: false, error: result.error },
        { status }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Resource updated successfully.",
      resource: result.resource,
    });
  } catch (error: any) {
    console.error("Update resource error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error while updating resource." },
      { status: 500 }
    );
  }
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
    const result = deleteResource(id, user.id);

    if (!result.success) {
      const status = result.error?.includes("Unauthorized") ? 403 : 400;
      return NextResponse.json(
        { success: false, error: result.error },
        { status }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Resource removed successfully from catalog.",
    });
  } catch (error: any) {
    console.error("Delete resource error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error." },
      { status: 500 }
    );
  }
}