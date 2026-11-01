import { NextResponse } from "next/server";
import { z } from "zod";
import { getCurrentUser } from "@/lib/auth";
import { createResource, getAllDbResources } from "@/lib/db";

const resourceSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters").max(120),
  tagline: z.string().max(200).optional(),
  description: z.string().min(10, "Description must be at least 10 characters").max(2000),
  longDescription: z.string().max(10000).optional(),
  category: z.string().min(1, "Category is required").max(50),
  condition: z.enum(["Like New", "Excellent", "Good", "Fair"]),
  location: z.string().min(2, "Location is required").max(100),
  images: z
    .array(z.string().max(1000))
    .min(1, "At least one image is required")
    .max(10, "Maximum of 10 images allowed"),
  deposit: z.union([z.string(), z.number()]).transform((v) => typeof v === "number" ? `$${v}` : v).optional(),
  maxDuration: z.string().max(50).optional(),
  pickupInstructions: z.string().max(500).optional(),
  safetyInstructions: z.string().max(500).optional(),
  borrowingTerms: z.string().max(1000).optional(),
  specs: z.union([
    z.record(z.string().max(200)),
    z.array(z.string().max(200)).max(20).transform((arr) => Object.fromEntries(arr.map((s, i) => [`Feature ${i + 1}`, s])))
  ]).optional(),
  tags: z.array(z.string().max(50)).max(15, "Maximum of 15 tags allowed").optional(),
});

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get("category") || undefined;
    const condition = searchParams.get("condition") || undefined;
    const availabilityStatus = searchParams.get("availability") || undefined;
    const rawSearch = searchParams.get("search") || undefined;
    const search = rawSearch ? decodeURIComponent(rawSearch.replace(/\+/g, " ")) : undefined;
    const ownerId = searchParams.get("ownerId") || undefined;
    const status = searchParams.get("status") || "active";

    const resources = await getAllDbResources({
      category,
      condition,
      availabilityStatus,
      search,
      ownerId,
      status,
    });

    return NextResponse.json({
      success: true,
      count: resources.length,
      resources,
    });
  } catch (error: any) {
    console.error("Fetch resources error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error fetching resources." },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json(
        { success: false, error: "Authentication required to list a resource." },
        { status: 401 }
      );
    }

    if (user.role !== "owner" && user.role !== "admin") {
      return NextResponse.json(
        { success: false, error: "Only Resource Owners can list new equipment." },
        { status: 403 }
      );
    }

    const contentLength = request.headers.get("content-length");
    if (contentLength && parseInt(contentLength, 10) > 1024 * 1024) {
      return NextResponse.json(
        { success: false, error: "Payload exceeds 1MB maximum size limit." },
        { status: 413 }
      );
    }

    const body = await request.json();
    const result = resourceSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error.errors[0]?.message || "Validation failed" },
        { status: 400 }
      );
    }

    const created = await createResource({
      ownerId: user.id,
      ...result.data,
    });

    return NextResponse.json(
      {
        success: true,
        message: "Resource listed successfully in the ResourceX community catalog!",
        resource: created,
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("Create resource error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to create resource." },
      { status: 500 }
    );
  }
}