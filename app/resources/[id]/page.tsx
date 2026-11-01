"use client";

import React, { useState, useEffect, use } from "react";
import Link from "next/link";
import { notFound, useRouter } from "next/navigation";
import { 
  MapPin, 
  Star, 
  ShieldCheck, 
  Clock, 
  Calendar as CalendarIcon, 
  ChevronRight, 
  Info, 
  CheckCircle2, 
  AlertCircle,
  Share2,
  ArrowLeft,
  Sparkles,
  ArrowRight,
  Package,
  Loader2,
  Users,
  Check,
  CalendarCheck,
  Send,
  Bookmark
} from "lucide-react";
import { Header } from "@/components/header";
import { FooterSection } from "@/components/sections/footer-section";
import { FadeImage } from "@/components/fade-image";
import { ResourceCard } from "@/components/resource-card";
import { resolveResourceGallery } from "@/lib/image-mapping";
import { useAuth } from "@/hooks/use-auth";
import { toast } from "sonner";
import { 
  getResourceById, 
  getRelatedResources, 
  getAllResources 
} from "@/lib/mock-data";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";

interface PageProps {
  params: Promise<{ id: string }>;
}

interface BookedRange {
  startDate: string;
  endDate: string;
  status: string;
}

export default function ResourceDetailPage({ params }: PageProps) {
  const { id } = use(params);
  const initialMock = getResourceById(id);
  const [resource, setResource] = useState<any>(initialMock || null);
  const [resourceLoading, setResourceLoading] = useState(!initialMock);
  const [reviews, setReviews] = useState<any[]>([]);
  const [isSaved, setIsSaved] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const { user } = useAuth();
  const router = useRouter();

  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const galleryImages = resource ? resolveResourceGallery(resource) : [];

  // Availability from API
  const [bookedRanges, setBookedRanges] = useState<BookedRange[]>([]);
  const [waitlistCount, setWaitlistCount] = useState<number>(0);
  const [isAvailabilityLoading, setIsAvailabilityLoading] = useState(true);

  // Booking Modal & Form state
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [isWaitlistModalOpen, setIsWaitlistModalOpen] = useState(false);
  const [isAuthPromptOpen, setIsAuthPromptOpen] = useState(false);

  // Tomorrow as default start date
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const tomorrowStr = tomorrow.toISOString().split("T")[0];

  const defaultEnd = new Date();
  defaultEnd.setDate(defaultEnd.getDate() + 3);
  const defaultEndStr = defaultEnd.toISOString().split("T")[0];

  const [startDate, setStartDate] = useState(tomorrowStr);
  const [endDate, setEndDate] = useState(defaultEndStr);
  const [purpose, setPurpose] = useState("");
  const [message, setMessage] = useState("");
  const [pickupPreference, setPickupPreference] = useState("Standard Hub Pickup");
  const [agreedTerms, setAgreedTerms] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [bookingError, setBookingError] = useState<string | null>(null);
  const [confirmedBooking, setConfirmedBooking] = useState<any | null>(null);

  // Fetch real-time availability from SQLite API
  const fetchAvailability = async () => {
    if (!resource) return;
    try {
      const res = await fetch(`/api/resources/${resource.id}/availability`);
      if (res.ok) {
        const data = await res.json();
        setBookedRanges(data.bookedRanges || []);
        setWaitlistCount(data.waitlistCount || 0);
      }
    } catch (err) {
      console.error("Failed to load availability:", err);
    } finally {
      setIsAvailabilityLoading(false);
    }
  };

  useEffect(() => {
    if (!initialMock) {
      fetch(`/api/resources/${id}`)
        .then((res) => (res.ok ? res.json() : null))
        .then((data) => {
          if (data?.resource) {
            setResource({
              ...data.resource,
              tagline: data.resource.description?.slice(0, 100),
              longDescription: data.resource.description,
              availability: "Available",
              owner: {
                id: data.resource.ownerId,
                name: data.resource.ownerName || "Community Member",
                role: "Community Lender",
                avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=256&q=80",
                rating: 5.0,
                reviewCount: 1,
                verified: true,
                memberSince: "2024",
                responseRate: "1 hr",
                location: data.resource.location,
              },
              specs: Array.isArray(data.resource.specs)
                ? Object.fromEntries(data.resource.specs.map((s: string, i: number) => [`Spec ${i + 1}`, s]))
                : (data.resource.specs || {}),
              eligibility: [
                "Verified Community Member",
                "Valid Phone on File",
                "Agreed to Safety Guidelines",
              ],
              borrowingTerms: "Return in same clean condition. Report any maintenance issues promptly.",
              relatedIds: [],
            });
          }
        })
        .finally(() => setResourceLoading(false));
    }

    // Fetch reviews
    fetch(`/api/reviews?resourceId=${id}`)
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.reviews) setReviews(data.reviews);
      })
      .catch(() => {});
  }, [id, initialMock]);

  useEffect(() => {
    if (user && id) {
      fetch(`/api/saved?resourceId=${id}`)
        .then((res) => (res.ok ? res.json() : null))
        .then((data) => {
          if (data && typeof data.isSaved === "boolean") {
            setIsSaved(data.isSaved);
          }
        })
        .catch(() => {});
    }
  }, [user, id]);

  const handleToggleSave = async () => {
    if (!user) {
      setIsAuthPromptOpen(true);
      return;
    }
    try {
      setIsSaving(true);
      if (isSaved) {
        const res = await fetch(`/api/saved/${id}`, { method: "DELETE" });
        if (res.ok) {
          setIsSaved(false);
          toast.success("Removed from wishlist.");
        }
      } else {
        const res = await fetch("/api/saved", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ resourceId: id }),
        });
        if (res.ok) {
          setIsSaved(true);
          toast.success("Saved to your wishlist!");
        }
      }
    } catch {
      toast.error("Failed to update wishlist.");
    } finally {
      setIsSaving(false);
    }
  };

  useEffect(() => {
    if (resource) {
      fetchAvailability();
    }
  }, [resource]);

  if (resourceLoading) {
    return (
      <main className="min-h-screen bg-background flex flex-col items-center justify-center">
        <Loader2 className="size-8 animate-spin text-muted-foreground" />
        <p className="mt-3 text-xs font-mono text-muted-foreground">Loading resource details...</p>
      </main>
    );
  }

  if (!resource) {
    return (
      <main className="min-h-screen bg-background">
        <Header />
        <div className="pt-36 pb-24 px-6 text-center max-w-lg mx-auto">
          <div className="size-16 rounded-full bg-secondary flex items-center justify-center mx-auto text-muted-foreground mb-4">
            <AlertCircle className="size-8" />
          </div>
          <h1 className="text-2xl font-semibold text-foreground mb-2">Resource Not Found</h1>
          <p className="text-sm text-muted-foreground mb-6">
            The resource you are looking for does not exist or may have been unlisted by its community owner.
          </p>
          <Link
            href="/resources"
            className="inline-flex items-center gap-2 h-10 px-6 rounded-full bg-foreground text-background text-xs font-medium"
          >
            <ArrowLeft className="size-4" />
            <span>Return to Catalog</span>
          </Link>
        </div>
        <FooterSection />
      </main>
    );
  }

  const relatedResources = typeof getRelatedResources === "function" ? getRelatedResources(resource, 3) : [];
  const isAvailable = resource.availability === "Available";
  const isInUse = resource.availability === "In Use";
  const isWaitlist = resource.availability === "Waitlist";

  // Calculate duration
  const startD = new Date(startDate);
  const endD = new Date(endDate);
  const diffTime = endD.getTime() - startD.getTime();
  const durationDays = diffTime >= 0 ? Math.round(diffTime / (1000 * 60 * 60 * 24)) + 1 : 0;

  // Max duration number parsed
  const maxDays = parseInt(resource.maxDuration) || 7;
  const isDurationOverLimit = durationDays > maxDays;

  // Check if selected range conflicts with approved ranges
  const hasRangeConflict = bookedRanges.some((range) => {
    return startDate <= range.endDate && endDate >= range.startDate;
  });

  const handleActionClick = () => {
    if (!user) {
      setIsAuthPromptOpen(true);
      return;
    }

    if (user.role === "owner" && resource.owner.name === user.fullName) {
      toast.info("You own this resource. You can manage incoming requests from your profile.");
      router.push("/profile");
      return;
    }

    if (isAvailable && !hasRangeConflict) {
      setBookingError(null);
      setConfirmedBooking(null);
      setIsBookingModalOpen(true);
    } else {
      setIsWaitlistModalOpen(true);
    }
  };

  const handleBookingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBookingError(null);

    if (!user) {
      setIsAuthPromptOpen(true);
      return;
    }

    if (!purpose.trim()) {
      setBookingError("Please state the project or purpose of borrowing.");
      return;
    }

    if (durationDays <= 0) {
      setBookingError("End date must be on or after start date.");
      return;
    }

    if (!agreedTerms) {
      setBookingError("You must agree to return the resource cleaned and on time.");
      return;
    }

    setIsSubmitting(true);

    try {
      const res = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          resourceId: resource.id,
          startDate,
          endDate,
          purpose: purpose.trim(),
          message: message.trim() || undefined,
          pickupPreference,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setBookingError(data.error || "Failed to submit booking request.");
        toast.error(data.error || "Booking request failed");
        setIsSubmitting(false);
        return;
      }

      setConfirmedBooking(data.booking);
      toast.success("Booking request submitted! Waiting for owner review.");
      await fetchAvailability();
    } catch (err) {
      console.error(err);
      setBookingError("A network error occurred. Please try again.");
      toast.error("Network error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleJoinWaitlistSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const res = await fetch("/api/waitlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          resourceId: resource.id,
          startDate,
          endDate,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error || "Failed to join waitlist.");
        setIsSubmitting(false);
        return;
      }

      toast.success(data.message || "Added to waitlist!");
      setIsWaitlistModalOpen(false);
      await fetchAvailability();
    } catch (err) {
      console.error(err);
      toast.error("Failed to join waitlist.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="min-h-screen bg-background">
      <Header />

      {/* Breadcrumb Navigation */}
      <div className="pt-28 pb-4 md:pt-32 border-b border-border bg-secondary/20">
        <div className="px-6 md:px-12 lg:px-20">
          <div className="flex items-center gap-2 text-xs text-muted-foreground overflow-x-auto whitespace-nowrap py-1">
            <Link href="/" className="hover:text-foreground transition-colors">
              Home
            </Link>
            <ChevronRight className="size-3 shrink-0" />
            <Link href="/resources" className="hover:text-foreground transition-colors">
              Resources
            </Link>
            <ChevronRight className="size-3 shrink-0" />
            <Link 
              href={`/resources?category=${encodeURIComponent(resource.category)}`}
              className="hover:text-foreground transition-colors"
            >
              {resource.category}
            </Link>
            <ChevronRight className="size-3 shrink-0" />
            <span className="text-foreground font-medium truncate max-w-[200px]">
              {resource.title}
            </span>
          </div>
        </div>
      </div>

      {/* Resource Detail Main Section */}
      <div className="px-6 md:px-12 lg:px-20 py-10 md:py-16">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16">
          {/* Left Column: Image Gallery, Specs, Terms (7 cols) */}
          <div className="lg:col-span-7 space-y-10">
            {/* Main Featured Image */}
            <div className="relative aspect-4/3 w-full rounded-2xl overflow-hidden bg-secondary border border-border shadow-xs">
              <FadeImage
                src={galleryImages[selectedImageIndex] || galleryImages[0] || "/images/resources/cat_tools.jpg"}
                alt={resource.title}
                className="size-full object-cover"
              />
              <div className="absolute top-4 left-4 flex gap-2">
                <span className="px-3 py-1 rounded-full text-xs font-medium bg-background/90 backdrop-blur-md text-foreground border border-border/60 shadow-xs">
                  {resource.condition}
                </span>
                <span
                  className={`px-3 py-1 rounded-full text-xs font-medium backdrop-blur-md shadow-xs ${
                    isAvailable
                      ? "bg-emerald-500/90 text-white"
                      : isInUse
                      ? "bg-amber-500/90 text-white"
                      : "bg-blue-500/90 text-white"
                  }`}
                >
                  {isAvailable ? "Available Now" : isInUse ? "Currently In Use" : "Waitlist Open"}
                </span>
              </div>
            </div>

            {/* Thumbnail Gallery Strip */}
            {galleryImages.length > 1 && (
              <div className="flex gap-3 overflow-x-auto pb-2">
                {galleryImages.map((img: string, idx: number) => (
                  <button
                    type="button"
                    key={idx}
                    onClick={() => setSelectedImageIndex(idx)}
                    className={`relative size-20 sm:size-24 rounded-lg overflow-hidden border-2 transition-all shrink-0 cursor-pointer ${
                      selectedImageIndex === idx
                        ? "border-foreground ring-2 ring-foreground/20"
                        : "border-border hover:border-foreground/50 opacity-70 hover:opacity-100"
                    }`}
                  >
                    <FadeImage
                      src={img}
                      alt={`${resource.title} photo ${idx + 1}`}
                      className="size-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}

            {/* Availability Calendar & Booked Windows Card */}
            <div className="p-6 md:p-8 rounded-2xl border border-border bg-card shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CalendarCheck className="size-5 text-foreground" />
                  <h2 className="text-base font-semibold">Community Availability Calendar</h2>
                </div>
                {waitlistCount > 0 && (
                  <span className="inline-flex items-center gap-1 font-mono text-[11px] px-2.5 py-0.5 rounded-full bg-blue-500/10 text-blue-600 border border-blue-500/20">
                    <Users className="size-3" />
                    <span>{waitlistCount} on waitlist</span>
                  </span>
                )}
              </div>

              <p className="text-xs text-muted-foreground leading-relaxed">
                Resource availability is synchronized live with the platform database. Reservations are held on a first-come, first-served basis with verified owner sign-off.
              </p>

              {bookedRanges.length > 0 ? (
                <div className="mt-3 p-3.5 rounded-xl bg-amber-500/5 border border-amber-500/20 space-y-2">
                  <div className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                    <Clock className="size-3.5 text-amber-500" />
                    <span>Currently Reserved Dates:</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {bookedRanges.map((range, i) => (
                      <span key={i} className="font-mono text-[11px] px-2.5 py-1 rounded-md bg-background border border-border text-foreground">
                        {range.startDate} → {range.endDate} (Reserved)
                      </span>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="mt-3 p-3.5 rounded-xl bg-emerald-500/5 border border-emerald-500/20 flex items-center gap-2 text-xs text-emerald-700 dark:text-emerald-400">
                  <CheckCircle2 className="size-4 shrink-0" />
                  <span>No active reservations currently blocking this item. All dates are open for booking!</span>
                </div>
              )}
            </div>

            {/* Description Section */}
            <div>
              <h2 className="text-xs font-mono uppercase tracking-widest text-muted-foreground mb-3">
                About this Resource
              </h2>
              <p className="text-base text-foreground leading-relaxed">
                {resource.description}
              </p>
              <p className="mt-4 text-sm text-muted-foreground leading-relaxed">
                {resource.longDescription}
              </p>
            </div>

            {/* Technical Specifications */}
            <div className="border-t border-border pt-8">
              <h2 className="text-xs font-mono uppercase tracking-widest text-muted-foreground mb-4">
                Technical Specifications
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {Object.entries(resource.specs).map(([key, val]) => (
                  <div
                    key={key}
                    className="p-3.5 rounded-lg bg-secondary/30 border border-border/60 flex flex-col justify-between"
                  >
                    <span className="text-[11px] font-mono text-muted-foreground uppercase">
                      {key}
                    </span>
                    <span className="text-sm font-medium text-foreground mt-1">
                      {String(val)}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Borrowing Terms & Guidelines */}
            <div className="border-t border-border pt-8">
              <h2 className="text-xs font-mono uppercase tracking-widest text-muted-foreground mb-4">
                Borrowing Terms & Care Instructions
              </h2>
              <div className="p-4 rounded-xl bg-secondary/40 border border-border/80 text-sm text-foreground leading-relaxed">
                {resource.borrowingTerms}
              </div>
            </div>

            {/* Eligibility Requirements */}
            <div className="border-t border-border pt-8">
              <h2 className="text-xs font-mono uppercase tracking-widest text-muted-foreground mb-4">
                Borrower Eligibility
              </h2>
              <ul className="space-y-2.5">
                {resource.eligibility.map((item: string, idx: number) => (
                  <li key={idx} className="flex items-start gap-2.5 text-sm text-muted-foreground">
                    <CheckCircle2 className="size-4 text-emerald-500 shrink-0 mt-0.5" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Community Reviews & Ratings Section */}
            <div className="border-t border-border pt-8">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xs font-mono uppercase tracking-widest text-muted-foreground">
                  Community Reviews & Ratings ({reviews.length})
                </h2>
                {reviews.length > 0 && (
                  <div className="flex items-center gap-1.5 text-xs font-mono">
                    <Star className="size-3.5 fill-amber-400 text-amber-400" />
                    <span className="font-semibold text-foreground">
                      {(
                        reviews.reduce((acc: number, r: any) => acc + r.rating, 0) /
                        reviews.length
                      ).toFixed(1)}
                    </span>
                    <span className="text-muted-foreground">/ 5.0</span>
                  </div>
                )}
              </div>

              {reviews.length === 0 ? (
                <div className="p-6 rounded-xl bg-secondary/30 border border-border/60 text-center">
                  <Star className="size-6 text-muted-foreground/50 mx-auto mb-2" />
                  <p className="text-xs font-medium text-foreground">No peer reviews yet</p>
                  <p className="text-[11px] text-muted-foreground mt-0.5">
                    Reviews are unlocked after equipment has been borrowed and safely returned.
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {reviews.map((r: any) => (
                    <div
                      key={r.id}
                      className="p-4 rounded-xl bg-secondary/20 border border-border/60 space-y-2"
                    >
                      <div className="flex items-center justify-between text-xs">
                        <div className="flex items-center gap-2">
                          <div className="size-6 rounded-full bg-foreground text-background flex items-center justify-center font-bold text-[10px]">
                            {(r.reviewerName || "U").charAt(0).toUpperCase()}
                          </div>
                          <span className="font-semibold text-foreground">
                            {r.reviewerName || "Community Member"}
                          </span>
                        </div>
                        <div className="flex items-center gap-1">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={`size-3 ${
                                i < r.rating
                                  ? "fill-amber-400 text-amber-400"
                                  : "text-muted-foreground/30"
                              }`}
                            />
                          ))}
                          <span className="text-[10px] font-mono text-muted-foreground ml-1">
                            {new Date(r.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                      <p className="text-xs text-foreground/90 leading-relaxed italic">
                        &quot;{r.comment}&quot;
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Right Column: Title, Quick Actions & Owner Card (5 cols) */}
          <div className="lg:col-span-5 flex flex-col gap-6 lg:sticky lg:top-28">
            {/* Header / Summary Card */}
            <div className="p-6 md:p-8 rounded-2xl border border-border bg-card shadow-sm">
              {/* Category & Location */}
              <div className="flex items-center justify-between text-xs text-muted-foreground mb-3">
                <span className="font-mono uppercase tracking-wider">
                  {resource.category}
                </span>
                <span className="inline-flex items-center gap-1">
                  <MapPin className="size-3 text-muted-foreground" />
                  <span>{resource.location}</span>
                </span>
              </div>

              {/* Title */}
              <h1 className="text-2xl md:text-3xl font-medium tracking-tight text-foreground leading-snug">
                {resource.title}
              </h1>

              {/* Tagline */}
              <p className="mt-3 text-sm text-muted-foreground leading-relaxed">
                {resource.tagline}
              </p>

              {/* Quick Info Grid */}
              <div className="mt-6 pt-6 border-t border-border grid grid-cols-2 gap-4">
                <div>
                  <span className="text-[11px] font-mono text-muted-foreground uppercase">
                    Security Deposit
                  </span>
                  <p className="text-sm font-semibold text-foreground mt-0.5">
                    {resource.deposit}
                  </p>
                </div>
                <div>
                  <span className="text-[11px] font-mono text-muted-foreground uppercase">
                    Max Loan Duration
                  </span>
                  <p className="text-sm font-semibold text-foreground mt-0.5">
                    {resource.maxDuration}
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="mt-8 space-y-2.5">
                <button
                  type="button"
                  onClick={handleActionClick}
                  className={`w-full h-12 rounded-full font-medium text-sm inline-flex items-center justify-center gap-2 shadow-sm transition-all cursor-pointer ${
                    isAvailable && !hasRangeConflict
                      ? "bg-foreground text-background hover:opacity-90"
                      : "bg-blue-600 text-white hover:bg-blue-700"
                  }`}
                >
                  <span>
                    {isAvailable && !hasRangeConflict
                      ? "Request to Borrow"
                      : "Join Waitlist"}
                  </span>
                  <ArrowRight className="size-4" />
                </button>

                <button
                  type="button"
                  onClick={handleToggleSave}
                  disabled={isSaving}
                  className="w-full h-10 rounded-full border border-border text-xs font-medium hover:bg-muted transition-colors inline-flex items-center justify-center gap-2"
                >
                  <Bookmark
                    className={`size-3.5 ${isSaved ? "fill-amber-400 text-amber-400" : "text-muted-foreground"}`}
                  />
                  <span>{isSaved ? "Saved in Wishlist" : "Save to Wishlist"}</span>
                </button>

                <p className="text-center text-[11px] text-muted-foreground mt-1">
                  Free community sharing · Verified lender review
                </p>
              </div>
            </div>

            {/* Owner Profile Card */}
            <div className="p-6 md:p-8 rounded-2xl border border-border bg-card shadow-sm">
              <h2 className="text-xs font-mono uppercase tracking-widest text-muted-foreground mb-4">
                Community Lender Profile
              </h2>

              <div className="flex items-center gap-4">
                <div className="relative size-14 rounded-full overflow-hidden bg-secondary border border-border shrink-0">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={resource.owner.avatar}
                    alt={resource.owner.name}
                    className="size-full object-cover"
                  />
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <h3 className="text-base font-semibold text-foreground">
                      {resource.owner.name}
                    </h3>
                    {resource.owner.verified && (
                      <span className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[10px] font-medium border border-emerald-500/20">
                        <ShieldCheck className="size-3" />
                        Verified
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Member since {resource.owner.memberSince} · {resource.owner.location}
                  </p>
                </div>
              </div>

              {/* Owner Stats */}
              <div className="mt-6 pt-6 border-t border-border grid grid-cols-2 gap-4 text-center">
                <div className="p-3 rounded-xl bg-secondary/40 border border-border/50">
                  <div className="flex items-center justify-center gap-1 text-sm font-semibold text-foreground">
                    <Star className="size-3.5 fill-amber-400 text-amber-400" />
                    <span>{resource.owner.rating}</span>
                  </div>
                  <span className="text-[11px] text-muted-foreground">
                    {resource.owner.reviewCount} Reviews
                  </span>
                </div>
                <div className="p-3 rounded-xl bg-secondary/40 border border-border/50">
                  <span className="text-sm font-semibold text-foreground block">
                    {resource.owner.responseRate}
                  </span>
                  <span className="text-[11px] text-muted-foreground">
                    Avg Response Time
                  </span>
                </div>
              </div>

              {/* Trust Guarantee Note */}
              <div className="mt-5 flex items-start gap-2.5 p-3.5 rounded-xl bg-secondary/30 text-xs text-muted-foreground">
                <ShieldCheck className="size-4 text-emerald-500 shrink-0 mt-0.5" />
                <span>
                  All borrowers and lenders are covered by ResourceX Community Safety & Accountability Guidelines.
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Related Resources Section */}
        {relatedResources.length > 0 && (
          <div className="mt-20 pt-16 border-t border-border">
            <div className="flex items-center justify-between mb-8">
              <div>
                <p className="text-xs font-mono uppercase tracking-wider text-muted-foreground mb-1">
                  More in {resource.category}
                </p>
                <h2 className="text-2xl font-medium tracking-tight text-foreground md:text-3xl">
                  Related Community Resources.
                </h2>
              </div>
              <Link
                href={`/resources?category=${encodeURIComponent(resource.category)}`}
                className="text-xs font-medium text-foreground hover:underline inline-flex items-center gap-1"
              >
                <span>View all</span>
                <ChevronRight className="size-3.5" />
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {relatedResources.map((item) => (
                <ResourceCard key={item.id} resource={item} />
              ))}
            </div>
          </div>
        )}
      </div>

      {/* REAL INTERACTIVE BOOKING DIALOG (PHASE 4) */}
      <Dialog open={isBookingModalOpen} onOpenChange={setIsBookingModalOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <div className="size-10 rounded-full bg-secondary flex items-center justify-center text-foreground mb-2">
              <CalendarIcon className="size-5 text-foreground" />
            </div>
            <DialogTitle className="text-lg font-semibold text-foreground">
              {confirmedBooking ? "Booking Request Confirmed!" : `Request: ${resource.title}`}
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              {confirmedBooking 
                ? "Your request has been saved in the database. The owner has been notified."
                : `Community loan from ${resource.owner.name} · Free borrowing period.`}
            </DialogDescription>
          </DialogHeader>

          {confirmedBooking ? (
            <div className="space-y-4 py-2">
              <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-800 dark:text-emerald-300 space-y-2">
                <div className="flex items-center gap-2 font-semibold text-sm">
                  <CheckCircle2 className="size-4 text-emerald-600" />
                  <span>Request Saved to SQLite Database</span>
                </div>
                <div className="font-mono text-[11px] pt-1">
                  Booking Reference: <span className="font-bold underline">{confirmedBooking.id}</span>
                </div>
                <div className="text-[11px] text-muted-foreground">
                  Requested Dates: <span className="text-foreground font-medium">{confirmedBooking.startDate} to {confirmedBooking.endDate}</span>
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-muted/60 border border-border text-xs space-y-1.5">
                <div className="font-medium text-foreground">Next Steps:</div>
                <p className="text-muted-foreground text-[11px] leading-relaxed">
                  1. The owner ({resource.owner.name}) will inspect your requested dates and purpose.<br />
                  2. Upon approval, you will receive an in-app notification.<br />
                  3. Meet at {resource.location} to inspect condition and collect equipment.
                </p>
              </div>

              <DialogFooter className="pt-2 flex flex-col sm:flex-row gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setIsBookingModalOpen(false);
                    router.push("/profile");
                  }}
                  className="w-full sm:w-auto px-5 py-2.5 rounded-full bg-foreground text-background text-xs font-medium hover:opacity-90 transition-opacity"
                >
                  View in My Bookings
                </button>
                <button
                  type="button"
                  onClick={() => setIsBookingModalOpen(false)}
                  className="w-full sm:w-auto px-4 py-2.5 rounded-full border border-border text-foreground text-xs font-medium hover:bg-muted transition-colors"
                >
                  Close
                </button>
              </DialogFooter>
            </div>
          ) : (
            <form onSubmit={handleBookingSubmit} className="space-y-4 py-2">
              {bookingError && (
                <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-xs flex items-center gap-2">
                  <AlertCircle className="size-4 shrink-0" />
                  <span>{bookingError}</span>
                </div>
              )}

              {/* Date Pickers */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium mb-1 text-foreground">
                    Borrow Start Date
                  </label>
                  <input
                    type="date"
                    required
                    min={tomorrowStr}
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-border bg-background text-xs focus:ring-2 focus:ring-foreground/20 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium mb-1 text-foreground">
                    Borrow Return Date
                  </label>
                  <input
                    type="date"
                    required
                    min={startDate}
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-border bg-background text-xs focus:ring-2 focus:ring-foreground/20 focus:outline-none"
                  />
                </div>
              </div>

              {/* Duration calculation banner */}
              <div className="flex items-center justify-between p-3 rounded-xl bg-secondary/50 border border-border/70 text-xs">
                <div>
                  <span className="text-muted-foreground">Calculated Duration:</span>
                  <span className="ml-1.5 font-semibold text-foreground">{durationDays} {durationDays === 1 ? "day" : "days"}</span>
                </div>
                <div className="text-[11px] text-muted-foreground font-mono">
                  Max: {resource.maxDuration}
                </div>
              </div>

              {isDurationOverLimit && (
                <p className="text-[11px] text-amber-600 font-medium">
                  Note: Requested loan is longer than standard {resource.maxDuration}. The owner may request an adjusted timeline.
                </p>
              )}

              {/* Pickup Preference */}
              <div>
                <label className="block text-xs font-medium mb-1 text-foreground">
                  Pickup Preference
                </label>
                <select
                  value={pickupPreference}
                  onChange={(e) => setPickupPreference(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-border bg-background text-xs focus:ring-2 focus:ring-foreground/20 focus:outline-none"
                >
                  <option value="Standard Hub Pickup">Standard Community Hub ({resource.location})</option>
                  <option value="Direct Owner Handover">Direct Owner Handover (Coordinate via message)</option>
                  <option value="Secure Locker">Secure Neighborhood Locker Station</option>
                </select>
              </div>

              {/* Purpose */}
              <div>
                <label className="block text-xs font-medium mb-1 text-foreground">
                  Borrowing Purpose *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Backyard deck remodel, weekend camping trip"
                  value={purpose}
                  onChange={(e) => setPurpose(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-border bg-background text-xs focus:ring-2 focus:ring-foreground/20 focus:outline-none"
                />
              </div>

              {/* Optional Message */}
              <div>
                <label className="block text-xs font-medium mb-1 text-foreground">
                  Note to Owner (Optional)
                </label>
                <textarea
                  rows={2}
                  placeholder={`Hi ${resource.owner.name}, I'll handle this with care and return it cleaned...`}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-border bg-background text-xs focus:ring-2 focus:ring-foreground/20 focus:outline-none resize-none"
                />
              </div>

              {/* Financial & Care Checklist */}
              <div className="p-3.5 rounded-xl bg-muted/40 border border-border text-[11px] text-muted-foreground space-y-1.5">
                <div className="flex justify-between text-foreground">
                  <span>Borrowing Fee:</span>
                  <span className="font-semibold text-emerald-600">$0.00 (Free Community Share)</span>
                </div>
                <div className="flex justify-between text-foreground">
                  <span>Security Deposit:</span>
                  <span className="font-semibold">{resource.deposit} (Held in escrow if required)</span>
                </div>
              </div>

              <label className="flex items-start gap-2 pt-1 cursor-pointer text-xs text-muted-foreground select-none">
                <input
                  type="checkbox"
                  required
                  checked={agreedTerms}
                  onChange={(e) => setAgreedTerms(e.target.checked)}
                  className="mt-0.5 rounded border-border text-foreground focus:ring-foreground"
                />
                <span>
                  I agree to return this resource in original condition and follow the community lending agreement.
                </span>
              </label>

              <DialogFooter className="mt-4 pt-2">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full h-11 rounded-full bg-foreground text-background text-xs font-medium hover:opacity-90 transition-opacity flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="size-4 animate-spin" />
                      <span>Saving to database...</span>
                    </>
                  ) : (
                    <>
                      <span>Submit Request to Owner</span>
                      <Send className="size-3.5" />
                    </>
                  )}
                </button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>

      {/* WAITLIST MODAL (PHASE 4) */}
      <Dialog open={isWaitlistModalOpen} onOpenChange={setIsWaitlistModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <div className="size-10 rounded-full bg-blue-500/10 text-blue-600 flex items-center justify-center mb-2">
              <Users className="size-5" />
            </div>
            <DialogTitle className="text-lg font-semibold text-foreground">
              Join Resource Waitlist
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              "{resource.title}" currently has an active reservation or waitlist queue.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleJoinWaitlistSubmit} className="space-y-4 py-2">
            <div className="p-3.5 rounded-xl bg-blue-500/5 border border-blue-500/20 text-xs text-blue-900 dark:text-blue-300 leading-relaxed">
              When you join the waitlist, your position is secured FIFO. If an approved booking is cancelled by the owner or borrower, our database triggers an automated in-app availability offer directly to you!
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium mb-1 text-foreground">
                  Desired Start Date
                </label>
                <input
                  type="date"
                  required
                  min={tomorrowStr}
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-border bg-background text-xs"
                />
              </div>
              <div>
                <label className="block text-xs font-medium mb-1 text-foreground">
                  Desired End Date
                </label>
                <input
                  type="date"
                  required
                  min={startDate}
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-border bg-background text-xs"
                />
              </div>
            </div>

            <div className="flex justify-between items-center text-xs text-muted-foreground p-3 rounded-lg bg-secondary/50 font-mono">
              <span>Current Waitlist Length:</span>
              <span className="font-bold text-foreground">{waitlistCount} people</span>
            </div>

            <DialogFooter className="pt-2">
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full h-11 rounded-full bg-blue-600 text-white text-xs font-medium hover:bg-blue-700 transition-colors flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="size-4 animate-spin" />
                    <span>Adding to queue...</span>
                  </>
                ) : (
                  <span>Join Waitlist Queue</span>
                )}
              </button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* GUEST AUTHENTICATION PROMPT MODAL */}
      <Dialog open={isAuthPromptOpen} onOpenChange={setIsAuthPromptOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <div className="size-10 rounded-full bg-secondary flex items-center justify-center text-foreground mb-2">
              <ShieldCheck className="size-5" />
            </div>
            <DialogTitle className="text-lg font-semibold text-foreground">
              Sign In to Borrow Resources
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              ResourceX is a trusted community platform. All borrowing requests and waitlists are linked to verified member profiles.
            </DialogDescription>
          </DialogHeader>

          <div className="p-4 rounded-xl bg-muted/60 border border-border text-xs text-muted-foreground space-y-2">
            <p>
              By signing in as a verified Borrower, you unlock:
            </p>
            <ul className="list-disc list-inside space-y-1 text-foreground font-medium">
              <li>Instant booking request submissions</li>
              <li>Direct calendar availability tracking</li>
              <li>Waitlist FIFO queue alerts</li>
              <li>Zero rental deposit waiver tiers</li>
            </ul>
          </div>

          <DialogFooter className="pt-2 flex flex-col sm:flex-row gap-2">
            <Link
              href="/login"
              className="w-full sm:w-auto flex-1 inline-flex items-center justify-center h-10 px-4 rounded-full bg-foreground text-background text-xs font-medium hover:opacity-90 transition-opacity"
            >
              Sign In Now
            </Link>
            <Link
              href="/register"
              className="w-full sm:w-auto flex-1 inline-flex items-center justify-center h-10 px-4 rounded-full border border-border text-foreground text-xs font-medium hover:bg-muted transition-colors"
            >
              Create Free Account
            </Link>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <FooterSection />
    </main>
  );
}