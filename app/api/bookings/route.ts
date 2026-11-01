import { NextResponse } from "next/server";
import { z } from "zod";
import { getCurrentUser } from "@/lib/auth";
import { 
  createBooking, 
  getBookingsByBorrower, 
  getBookingsByOwner,
  getDatabase,
  getDbResourceById,
  type BookingStatus
} from "@/lib/db";
import { getResourceById } from "@/lib/mock-data";

const bookingCreateSchema = z.object({
  resourceId: z.string().min(1, "Resource ID is required"),
  startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Start date must be YYYY-MM-DD"),
  endDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "End date must be YYYY-MM-DD"),
  purpose: z.string().min(3, "Purpose must be at least 3 characters").max(500),
  message: z.string().max(1000).optional(),
  pickupPreference: z.string().max(100).optional(),
});

export async function POST(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json(
        { success: false, error: "Authentication required to request a booking." },
        { status: 401 }
      );
    }

    if (user.role !== "borrower" && user.role !== "admin") {
      return NextResponse.json(
        { success: false, error: "Only borrower accounts can initiate borrowing requests." },
        { status: 403 }
      );
    }

    const body = await request.json();
    const result = bookingCreateSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error.errors[0]?.message || "Invalid booking data" },
        { status: 400 }
      );
    }

    const { resourceId, startDate, endDate, purpose, message, pickupPreference } = result.data;

    // Check resource existence in DB or mock catalog
    const dbResource = await getDbResourceById(resourceId);
    const mockResource = getResourceById(resourceId);

    if (!dbResource && !mockResource) {
      return NextResponse.json(
        { success: false, error: "Requested resource was not found in catalog." },
        { status: 404 }
      );
    }

    const title = dbResource?.title || mockResource?.title || "Equipment";
    const image = dbResource?.images?.[0] || mockResource?.images?.[0] || "/placeholder.jpg";
    const location = dbResource?.location || mockResource?.location || "Community Hub";
    const deposit = dbResource?.deposit || mockResource?.deposit || "None";

    // Determine Owner ID
    const db = await getDatabase();
    let ownerId = "usr_demo_owner_01"; // Default to Marcus Vance

    if (dbResource) {
      ownerId = dbResource.ownerId;
    } else if (mockResource) {
      const matchingOwner = (await db.prepare(
        "SELECT id FROM users WHERE fullName = ? AND role = 'owner'"
      ).get(mockResource.owner.name)) as { id: string } | null;
      if (matchingOwner && matchingOwner.id) {
        ownerId = matchingOwner.id;
      }
    }

    if (ownerId === user.id) {
      return NextResponse.json(
        { success: false, error: "You cannot request to borrow your own resource." },
        { status: 400 }
      );
    }

    const creationResult = await createBooking({
      resourceId,
      borrowerId: user.id,
      ownerId,
      startDate,
      endDate,
      purpose,
      message,
      pickupPreference,
      resourceTitle: title,
    });

    if (!creationResult.success) {
      return NextResponse.json(
        { success: false, error: creationResult.error },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { 
        success: true, 
        message: "Booking request submitted successfully! The owner will review your dates.", 
        booking: {
          ...creationResult.booking,
          resourceTitle: title,
          resourceImage: image,
          resourceLocation: location,
          deposit: deposit,
        }
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("Booking creation error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error while processing booking." },
      { status: 500 }
    );
  }
}

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
    const status = searchParams.get("status") as BookingStatus | null;

    let bookings = [];
    if (user.role === "owner") {
      bookings = await getBookingsByOwner(user.id, status || undefined);
    } else {
      bookings = await getBookingsByBorrower(user.id, status || undefined);
    }

    // Enrich with resource metadata
    const enriched = bookings.map((b) => {
      const res = getResourceById(b.resourceId);
      return {
        ...b,
        resourceTitle: res?.title || "Community Resource",
        resourceImage: res?.images[0] || "/placeholder.jpg",
        resourceCategory: res?.category || "Equipment",
        resourceLocation: res?.location || "Community Hub",
        deposit: res?.deposit || "$0 (Free)",
      };
    });

    return NextResponse.json({
      success: true,
      bookings: enriched,
    });
  } catch (error: any) {
    console.error("Bookings fetch error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error while fetching bookings." },
      { status: 500 }
    );
  }
}