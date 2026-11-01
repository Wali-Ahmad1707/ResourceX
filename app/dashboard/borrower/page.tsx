"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/use-auth";
import { Header } from "@/components/header";
import { FooterSection } from "@/components/sections/footer-section";
import { toast } from "sonner";
import {
  Calendar,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Star,
  MapPin,
  TrendingUp,
  ShieldCheck,
  Bookmark,
  Trash2,
  ExternalLink,
  MessageSquare,
  Sparkles,
  Loader2,
  RefreshCw,
  Search,
  Filter,
  ArrowRight,
  PackageCheck,
  Users
} from "lucide-react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { resolveResourceImage } from "@/lib/image-mapping";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";

interface BookingItem {
  id: string;
  resourceId: string;
  borrowerId: string;
  ownerId: string;
  startDate: string;
  endDate: string;
  purpose: string;
  message?: string;
  pickupPreference?: string;
  status: "pending" | "approved" | "rejected" | "cancelled" | "completed";
  createdAt: string;
  resourceTitle?: string;
  resourceLocation?: string;
  resourceCategory?: string;
  ownerName?: string;
}

interface WaitlistItem {
  id: string;
  resourceId: string;
  borrowerId: string;
  startDate: string;
  endDate: string;
  position: number;
  status: "active" | "cancelled" | "converted";
  createdAt: string;
}

interface SavedResourceItem {
  id: string;
  resourceId: string;
  title: string;
  category: string;
  condition: string;
  location: string;
  images: string;
  deposit: number;
  maxDuration: string;
  savedAt: string;
}

interface ReviewItem {
  id: string;
  bookingId: string;
  reviewerId: string;
  reviewerName?: string;
  revieweeId: string;
  resourceId: string;
  rating: number;
  comment: string;
  createdAt: string;
}

interface AnalyticsData {
  totalRequests: number;
  approvedBookings: number;
  completedBorrowings: number;
  activeWaitlist: number;
  savedCount: number;
  averageRating: number;
  reviewCount: number;
  favoriteCategories: {
    category: string;
    borrowCount: number;
  }[];
}

interface TrustBadge {
  id: string;
  name: string;
  description: string;
  category: "reputation" | "verification";
  icon: string;
}

export default function BorrowerDashboardPage() {
  const { user, isLoading: authLoading } = useAuth();
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("borrowings");

  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [bookings, setBookings] = useState<BookingItem[]>([]);
  const [waitlists, setWaitlists] = useState<WaitlistItem[]>([]);
  const [saved, setSaved] = useState<SavedResourceItem[]>([]);
  const [reviews, setReviews] = useState<ReviewItem[]>([]);
  const [trustBadges, setTrustBadges] = useState<TrustBadge[]>([]);

  // Filter for borrowings
  const [statusFilter, setStatusFilter] = useState("all");

  // Cancel Booking Modal
  const [cancellingBooking, setCancellingBooking] = useState<BookingItem | null>(null);
  const [isCancelSubmitting, setIsCancelSubmitting] = useState(false);

  // Review Modal
  const [reviewBooking, setReviewBooking] = useState<BookingItem | null>(null);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState("");
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);

  // Leave Waitlist Modal
  const [leavingWaitlist, setLeavingWaitlist] = useState<WaitlistItem | null>(null);
  const [isLeavingWaitlist, setIsLeavingWaitlist] = useState(false);

  // Fetch Dashboard Data
  const loadDashboardData = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/dashboard/borrower");
      if (res.status === 401) {
        router.push("/login?callbackUrl=/dashboard/borrower");
        return;
      }
      if (res.status === 403) {
        router.push("/dashboard/owner");
        return;
      }
      if (!res.ok) {
        throw new Error("Failed to load borrower dashboard");
      }
      const data = await res.json();
      setAnalytics(data.analytics);
      setBookings(data.bookings || []);
      setWaitlists(data.waitlists || []);
      setSaved(data.saved || []);
      setReviews(data.reviews || []);
      setTrustBadges(data.trustProfile?.badges || []);
    } catch (err: any) {
      toast.error(err.message || "Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    if (!authLoading) {
      if (!user) {
        router.push("/login?callbackUrl=/dashboard/borrower");
      } else if (user.role === "owner") {
        router.push("/dashboard/owner");
      } else {
        loadDashboardData();
      }
    }
  }, [user, authLoading, router, loadDashboardData]);

  // Cancel Booking
  const handleCancelBooking = async () => {
    if (!cancellingBooking) return;
    try {
      setIsCancelSubmitting(true);
      const res = await fetch(`/api/bookings/${cancellingBooking.id}/cancel`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reason: "Borrower requested cancellation" }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to cancel booking");
      }

      toast.success("Booking reservation cancelled.");
      setCancellingBooking(null);
      loadDashboardData();
    } catch (err: any) {
      toast.error(err.message || "Could not cancel booking");
    } finally {
      setIsCancelSubmitting(false);
    }
  };

  // Submit Review
  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewBooking) return;

    try {
      setIsSubmittingReview(true);
      const res = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          bookingId: reviewBooking.id,
          rating: reviewRating,
          comment: reviewComment.trim(),
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to submit review");
      }

      toast.success("Thank you! Your community review has been posted.");
      setReviewBooking(null);
      setReviewComment("");
      setReviewRating(5);
      loadDashboardData();
    } catch (err: any) {
      toast.error(err.message || "Could not post review");
    } finally {
      setIsSubmittingReview(false);
    }
  };

  // Remove from Saved / Wishlist
  const handleRemoveSaved = async (savedId: string) => {
    try {
      const res = await fetch(`/api/saved/${savedId}`, {
        method: "DELETE",
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to remove saved resource");
      }

      toast.success("Resource removed from your saved list.");
      setSaved((prev) => prev.filter((s) => s.id !== savedId));
      if (analytics) {
        setAnalytics({ ...analytics, savedCount: Math.max(0, analytics.savedCount - 1) });
      }
    } catch (err: any) {
      toast.error(err.message || "Could not update saved items");
    }
  };

  // Leave Waitlist
  const handleLeaveWaitlist = async () => {
    if (!leavingWaitlist) return;
    try {
      setIsLeavingWaitlist(true);
      const res = await fetch(`/api/waitlist/${leavingWaitlist.id}`, {
        method: "DELETE",
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to leave waitlist");
      }

      toast.success("You have left the waitlist queue.");
      setLeavingWaitlist(null);
      loadDashboardData();
    } catch (err: any) {
      toast.error(err.message || "Failed to leave waitlist");
    } finally {
      setIsLeavingWaitlist(false);
    }
  };

  if (authLoading || (loading && !analytics)) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center">
        <Loader2 className="size-8 animate-spin text-muted-foreground" />
        <p className="mt-3 text-xs font-mono text-muted-foreground">Loading Borrower Dashboard...</p>
      </div>
    );
  }

  // Filtered borrowings
  const filteredBookings = bookings.filter((b) => {
    if (statusFilter === "all") return true;
    return b.status === statusFilter;
  });

  // Upcoming approved bookings
  const upcomingPickups = bookings.filter((b) => b.status === "approved");

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <Header />

      <main className="flex-1 pt-24 pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

          {/* Top Header & Overview Bar */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 pb-8 border-b border-border">
            <div>
              <div className="flex items-center gap-2 mb-1.5">
                <span className="font-mono text-xs uppercase tracking-widest px-2 py-0.5 rounded bg-muted text-muted-foreground border border-border">
                  Borrower Hub
                </span>
                <span className="inline-flex items-center gap-1 text-xs text-blue-500 font-mono font-medium">
                  <ShieldCheck className="size-3.5" />
                  Verified Member
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
                My Equipment Loans & Requests
              </h1>
              <p className="text-sm text-muted-foreground mt-1">
                Track your active reservations, upcoming pickups, waitlist queues, and community ratings.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={loadDashboardData}
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border border-border bg-card text-xs font-medium hover:bg-muted transition-colors"
                title="Refresh dashboard"
              >
                <RefreshCw className="size-3.5" />
                <span>Sync</span>
              </button>

              <Link
                href="/resources"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-foreground text-background text-xs font-medium hover:opacity-90 transition-opacity shadow-sm"
              >
                <span>Browse Catalog</span>
                <ArrowRight className="size-3.5" />
              </Link>
            </div>
          </div>

          {/* Metric Stats Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-6 gap-3.5 my-8">
            <div className="p-4 rounded-xl border border-border bg-card">
              <span className="text-[11px] font-mono uppercase tracking-wider text-muted-foreground">
                Total Requests
              </span>
              <div className="mt-2 text-2xl font-bold font-mono tracking-tight">
                {analytics?.totalRequests || 0}
              </div>
              <span className="text-[10px] text-muted-foreground mt-1 block">
                Lifetime reservations
              </span>
            </div>

            <div className="p-4 rounded-xl border border-border bg-card">
              <span className="text-[11px] font-mono uppercase tracking-wider text-muted-foreground">
                Approved Bookings
              </span>
              <div className="mt-2 text-2xl font-bold font-mono tracking-tight text-emerald-600 dark:text-emerald-400">
                {analytics?.approvedBookings || 0}
              </div>
              <span className="text-[10px] text-muted-foreground mt-1 block">
                Upcoming & active
              </span>
            </div>

            <div className="p-4 rounded-xl border border-border bg-card">
              <span className="text-[11px] font-mono uppercase tracking-wider text-muted-foreground">
                Completed Borrows
              </span>
              <div className="mt-2 text-2xl font-bold font-mono tracking-tight text-blue-600 dark:text-blue-400">
                {analytics?.completedBorrowings || 0}
              </div>
              <span className="text-[10px] text-muted-foreground mt-1 block">
                Returned on time
              </span>
            </div>

            <div className="p-4 rounded-xl border border-border bg-card">
              <span className="text-[11px] font-mono uppercase tracking-wider text-muted-foreground">
                Active Waitlist
              </span>
              <div className="mt-2 text-2xl font-bold font-mono tracking-tight">
                {analytics?.activeWaitlist || 0}
              </div>
              <span className="text-[10px] text-muted-foreground mt-1 block">
                Queued reservations
              </span>
            </div>

            <div className="p-4 rounded-xl border border-border bg-card">
              <span className="text-[11px] font-mono uppercase tracking-wider text-muted-foreground">
                Saved Items
              </span>
              <div className="mt-2 text-2xl font-bold font-mono tracking-tight">
                {analytics?.savedCount || 0}
              </div>
              <span className="text-[10px] text-muted-foreground mt-1 block">
                Bookmarked gear
              </span>
            </div>

            <div className="p-4 rounded-xl border border-border bg-card">
              <span className="text-[11px] font-mono uppercase tracking-wider text-muted-foreground">
                Community Rating
              </span>
              <div className="mt-2 flex items-center gap-1.5">
                <Star className="size-4 fill-amber-400 text-amber-400" />
                <span className="text-2xl font-bold font-mono tracking-tight">
                  {analytics?.averageRating ? analytics.averageRating.toFixed(1) : "5.0"}
                </span>
              </div>
              <span className="text-[10px] text-muted-foreground mt-1 block">
                {analytics?.reviewCount || 0} peer reviews
              </span>
            </div>
          </div>

          {/* Main Dashboard Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="bg-muted/60 p-1 border border-border rounded-xl">
              <TabsTrigger value="borrowings" className="gap-2 text-xs font-medium">
                <Calendar className="size-3.5" />
                <span>My Borrowings ({bookings.length})</span>
              </TabsTrigger>
              <TabsTrigger value="pickups" className="gap-2 text-xs font-medium">
                <PackageCheck className="size-3.5" />
                <span>Upcoming Pickups ({upcomingPickups.length})</span>
              </TabsTrigger>
              <TabsTrigger value="waitlist" className="gap-2 text-xs font-medium">
                <Clock className="size-3.5" />
                <span>Waitlists ({waitlists.length})</span>
              </TabsTrigger>
              <TabsTrigger value="saved" className="gap-2 text-xs font-medium">
                <Bookmark className="size-3.5" />
                <span>Saved Wishlist ({saved.length})</span>
              </TabsTrigger>
              <TabsTrigger value="trust" className="gap-2 text-xs font-medium">
                <ShieldCheck className="size-3.5" />
                <span>Reputation & Badges ({trustBadges.length})</span>
              </TabsTrigger>
            </TabsList>

            {/* TAB 1: MY BORROWINGS */}
            <TabsContent value="borrowings" className="space-y-4">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <Filter className="size-3.5 text-muted-foreground" />
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="px-3 py-1.5 rounded-lg border border-border bg-card text-xs text-foreground focus:outline-hidden"
                  >
                    <option value="all">All Statuses ({bookings.length})</option>
                    <option value="approved">Approved</option>
                    <option value="pending">Pending</option>
                    <option value="completed">Completed</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>
              </div>

              {filteredBookings.length === 0 ? (
                <div className="py-16 text-center rounded-xl border border-dashed border-border bg-card/50">
                  <Calendar className="size-10 mx-auto text-muted-foreground/60 mb-3" />
                  <h3 className="text-sm font-semibold text-foreground">No bookings found</h3>
                  <p className="text-xs text-muted-foreground max-w-sm mx-auto mt-1">
                    Explore available gear in your community and submit your first borrow request.
                  </p>
                  <Link
                    href="/resources"
                    className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-foreground text-background text-xs font-medium hover:opacity-90"
                  >
                    <span>Browse Equipment</span>
                    <ArrowRight className="size-3.5" />
                  </Link>
                </div>
              ) : (
                <div className="space-y-3">
                  {filteredBookings.map((b) => {
                    const isPending = b.status === "pending";
                    const isApproved = b.status === "approved";
                    const isCompleted = b.status === "completed";
                    const isCancelled = b.status === "cancelled" || b.status === "rejected";

                    return (
                      <div
                        key={b.id}
                        className="p-4 rounded-xl border border-border bg-card flex flex-col md:flex-row md:items-center justify-between gap-4"
                      >
                        <div className="space-y-1.5">
                          <div className="flex items-center gap-2">
                            <span
                              className={`px-2 py-0.5 rounded-full text-[10px] font-mono uppercase tracking-wider ${
                                isApproved
                                  ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20"
                                  : isPending
                                  ? "bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20"
                                  : isCompleted
                                  ? "bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20"
                                  : "bg-muted text-muted-foreground border border-border"
                              }`}
                            >
                              {b.status}
                            </span>
                            <span className="text-xs font-mono text-muted-foreground">
                              Resource: {b.resourceTitle || b.resourceId}
                            </span>
                          </div>

                          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
                            <span>
                              <strong className="text-foreground">Dates:</strong> {b.startDate} to {b.endDate}
                            </span>
                            <span>
                              <strong className="text-foreground">Pickup:</strong> {b.pickupPreference || "Standard Hub"}
                            </span>
                          </div>

                          <p className="text-xs text-foreground/80 italic">
                            &quot;{b.purpose}&quot;
                          </p>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-2 self-end md:self-center shrink-0">
                          <Link
                            href={`/resources/${b.resourceId}`}
                            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-border text-xs font-medium hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
                          >
                            <ExternalLink className="size-3" />
                            <span>Details</span>
                          </Link>

                          {/* Completed bookings: Leave Review */}
                          {isCompleted && (
                            <button
                              type="button"
                              onClick={() => {
                                setReviewBooking(b);
                                setReviewRating(5);
                                setReviewComment("");
                              }}
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/30 text-xs font-medium hover:bg-amber-500/20 transition-colors"
                            >
                              <Star className="size-3.5 fill-amber-400 text-amber-400" />
                              <span>Leave Review</span>
                            </button>
                          )}

                          {/* Pending or Approved bookings: Cancel */}
                          {(isPending || isApproved) && (
                            <button
                              type="button"
                              onClick={() => setCancellingBooking(b)}
                              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-border text-xs font-medium text-red-500 hover:bg-red-500/10 transition-colors"
                            >
                              <XCircle className="size-3.5" />
                              <span>Cancel</span>
                            </button>
                          )}

                          {isCancelled && (
                            <span className="text-xs text-muted-foreground font-mono">
                              Cancelled
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </TabsContent>

            {/* TAB 2: UPCOMING PICKUPS */}
            <TabsContent value="pickups" className="space-y-4">
              {upcomingPickups.length === 0 ? (
                <div className="py-16 text-center rounded-xl border border-dashed border-border bg-card/50">
                  <PackageCheck className="size-10 mx-auto text-muted-foreground/60 mb-3" />
                  <h3 className="text-sm font-semibold text-foreground">No upcoming equipment pickups</h3>
                  <p className="text-xs text-muted-foreground max-w-sm mx-auto mt-1">
                    When owners approve your reservation requests, your scheduled pickup times and instructions appear here.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {upcomingPickups.map((b) => (
                    <div
                      key={b.id}
                      className="p-5 rounded-xl border border-border bg-card space-y-3"
                    >
                      <div className="flex items-center justify-between">
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                          <CheckCircle2 className="size-3.5" />
                          Confirmed Reservation
                        </span>
                        <span className="text-xs font-mono text-muted-foreground">
                          {b.startDate}
                        </span>
                      </div>

                      <h4 className="text-sm font-semibold text-foreground">
                        {b.resourceTitle || `Resource ${b.resourceId}`}
                      </h4>

                      <div className="space-y-1 text-xs text-muted-foreground">
                        <div className="flex items-center gap-2">
                          <Calendar className="size-3.5 text-foreground" />
                          <span>Period: {b.startDate} to {b.endDate}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <MapPin className="size-3.5 text-foreground" />
                          <span>Pickup: {b.pickupPreference || "Standard Neighborhood Hub"}</span>
                        </div>
                      </div>

                      <div className="pt-3 border-t border-border flex items-center justify-between">
                        <Link
                          href={`/resources/${b.resourceId}`}
                          className="text-xs font-medium text-foreground hover:underline inline-flex items-center gap-1"
                        >
                          <span>View Equipment Page</span>
                          <ArrowRight className="size-3" />
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </TabsContent>

            {/* TAB 3: ACTIVE WAITLIST */}
            <TabsContent value="waitlist" className="space-y-4">
              {waitlists.length === 0 ? (
                <div className="py-16 text-center rounded-xl border border-dashed border-border bg-card/50">
                  <Clock className="size-10 mx-auto text-muted-foreground/60 mb-3" />
                  <h3 className="text-sm font-semibold text-foreground">No active waitlist queues</h3>
                  <p className="text-xs text-muted-foreground max-w-sm mx-auto mt-1">
                    When gear is in use, joining the waitlist holds your place. If dates become available, you are automatically notified!
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {waitlists.map((w) => (
                    <div
                      key={w.id}
                      className="p-4 rounded-xl border border-border bg-card flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-mono font-semibold bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20">
                            Queue Position #{w.position}
                          </span>
                          <span className="text-xs font-mono text-muted-foreground">
                            Resource: {w.resourceId}
                          </span>
                        </div>
                        <div className="text-xs text-muted-foreground">
                          Requested timeframe: <strong className="text-foreground">{w.startDate}</strong> to <strong className="text-foreground">{w.endDate}</strong>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <Link
                          href={`/resources/${w.resourceId}`}
                          className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-border text-xs font-medium hover:bg-muted text-muted-foreground hover:text-foreground"
                        >
                          <ExternalLink className="size-3" />
                          <span>View Listing</span>
                        </Link>
                        <button
                          type="button"
                          onClick={() => setLeavingWaitlist(w)}
                          className="px-3 py-1.5 rounded-lg border border-border text-xs font-medium text-red-500 hover:bg-red-500/10 transition-colors"
                        >
                          Leave Queue
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </TabsContent>

            {/* TAB 4: SAVED WISHLIST */}
            <TabsContent value="saved" className="space-y-4">
              {saved.length === 0 ? (
                <div className="py-16 text-center rounded-xl border border-dashed border-border bg-card/50">
                  <Bookmark className="size-10 mx-auto text-muted-foreground/60 mb-3" />
                  <h3 className="text-sm font-semibold text-foreground">Your wishlist is empty</h3>
                  <p className="text-xs text-muted-foreground max-w-sm mx-auto mt-1">
                    Bookmark equipment while browsing the catalog to easily track availability and plan future projects.
                  </p>
                  <Link
                    href="/resources"
                    className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-foreground text-background text-xs font-medium hover:opacity-90"
                  >
                    <span>Discover Resources</span>
                    <ArrowRight className="size-3.5" />
                  </Link>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                  {saved.map((item) => {
                    const imageSrc = resolveResourceImage({
                      id: item.resourceId || item.id,
                      title: item.title,
                      category: item.category,
                      images: item.images,
                    });

                    return (
                      <div
                        key={item.id}
                        className="rounded-xl border border-border bg-card overflow-hidden flex flex-col justify-between hover:border-foreground/30 transition-all shadow-xs"
                      >
                        <div>
                          <div className="relative aspect-[16/9] w-full bg-secondary overflow-hidden">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                              src={imageSrc}
                              alt={item.title}
                              className="size-full object-cover"
                            />
                            <div className="absolute top-2.5 right-2.5">
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-mono uppercase bg-black/60 text-white backdrop-blur-md">
                                {item.condition}
                              </span>
                            </div>
                          </div>

                          <div className="p-4">
                            <span className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground block mb-1">
                              {item.category}
                            </span>
                            <h3 className="text-sm font-semibold text-foreground line-clamp-1">
                              {item.title}
                            </h3>
                            <div className="mt-2 flex items-center justify-between text-xs font-mono text-muted-foreground">
                              <span>Max: {item.maxDuration}</span>
                              <span>Deposit: ${item.deposit}</span>
                            </div>
                          </div>
                        </div>

                        <div className="p-3 bg-muted/30 border-t border-border flex items-center justify-between gap-2">
                          <Link
                            href={`/resources/${item.resourceId}`}
                            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-foreground text-background text-xs font-medium hover:opacity-90"
                          >
                            <span>Borrow</span>
                            <ArrowRight className="size-3" />
                          </Link>

                          <button
                            type="button"
                            onClick={() => handleRemoveSaved(item.id)}
                            className="p-1.5 rounded-lg border border-border text-muted-foreground hover:text-red-500 hover:bg-red-500/10 transition-colors"
                            title="Remove from wishlist"
                          >
                            <Trash2 className="size-3.5" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </TabsContent>

            {/* TAB 5: REPUTATION & BADGES */}
            <TabsContent value="trust" className="space-y-6">
              <div className="p-6 rounded-xl border border-border bg-card space-y-6">
                <div>
                  <h3 className="text-base font-semibold text-foreground flex items-center gap-2">
                    <ShieldCheck className="size-5 text-emerald-500" />
                    Borrower Trust & Credential Badges
                  </h3>
                  <p className="text-xs text-muted-foreground mt-1">
                    Reputation badges reflect your verified identity, on-time equipment returns, and peer community ratings.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {trustBadges.map((badge) => (
                    <div
                      key={badge.id}
                      className="p-4 rounded-xl border border-border bg-muted/20 flex items-start gap-3.5"
                    >
                      <div className="p-2.5 rounded-lg bg-foreground/10 text-foreground shrink-0">
                        <Sparkles className="size-4" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="text-xs font-semibold text-foreground">{badge.name}</h4>
                          <span className="text-[10px] font-mono uppercase px-1.5 py-0.2 rounded bg-muted border border-border text-muted-foreground">
                            {badge.category}
                          </span>
                        </div>
                        <p className="text-[11px] text-muted-foreground mt-1 leading-relaxed">
                          {badge.description}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                {reviews.length > 0 && (
                  <div className="pt-4 border-t border-border space-y-3">
                    <h4 className="text-xs font-semibold text-foreground uppercase tracking-wider font-mono">
                      Reviews from Resource Owners
                    </h4>
                    <div className="divide-y divide-border/60">
                      {reviews.map((rev) => (
                        <div key={rev.id} className="py-3 text-xs space-y-1">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-1.5">
                              <div className="flex items-center">
                                {[...Array(5)].map((_, i) => (
                                  <Star
                                    key={i}
                                    className={`size-3 ${
                                      i < rev.rating
                                        ? "fill-amber-400 text-amber-400"
                                        : "text-muted-foreground/30"
                                    }`}
                                  />
                                ))}
                              </div>
                              <span className="font-semibold text-foreground">
                                {rev.reviewerName || "Owner"}
                              </span>
                            </div>
                            <span className="text-[10px] font-mono text-muted-foreground">
                              {new Date(rev.createdAt).toLocaleDateString()}
                            </span>
                          </div>
                          <p className="text-muted-foreground italic">&quot;{rev.comment}&quot;</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </TabsContent>
          </Tabs>

        </div>
      </main>

      {/* CANCEL BOOKING DIALOG */}
      <Dialog open={!!cancellingBooking} onOpenChange={() => setCancellingBooking(null)}>
        <DialogContent className="max-w-md bg-card border-border">
          <DialogHeader>
            <DialogTitle className="text-base font-bold text-red-600 flex items-center gap-2">
              <AlertCircle className="size-4" />
              Cancel Borrow Reservation
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              Are you sure you want to cancel this booking? The equipment schedule will be immediately freed up for waitlisted community members.
            </DialogDescription>
          </DialogHeader>

          <DialogFooter className="gap-2 sm:gap-0">
            <button
              type="button"
              onClick={() => setCancellingBooking(null)}
              className="px-4 py-2 rounded-lg border border-border text-xs font-medium hover:bg-muted"
            >
              Keep Reservation
            </button>
            <button
              type="button"
              onClick={handleCancelBooking}
              disabled={isCancelSubmitting}
              className="px-4 py-2 rounded-lg bg-red-600 text-white text-xs font-medium hover:bg-red-700 disabled:opacity-50 inline-flex items-center gap-1.5"
            >
              {isCancelSubmitting ? (
                <>
                  <Loader2 className="size-3.5 animate-spin" />
                  <span>Cancelling...</span>
                </>
              ) : (
                <span>Confirm Cancellation</span>
              )}
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* LEAVE WAITLIST DIALOG */}
      <Dialog open={!!leavingWaitlist} onOpenChange={() => setLeavingWaitlist(null)}>
        <DialogContent className="max-w-md bg-card border-border">
          <DialogHeader>
            <DialogTitle className="text-base font-bold">Leave Waitlist Queue</DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              You are currently in Position #{leavingWaitlist?.position}. If you leave, subsequent members will advance forward in the queue.
            </DialogDescription>
          </DialogHeader>

          <DialogFooter className="gap-2 sm:gap-0">
            <button
              type="button"
              onClick={() => setLeavingWaitlist(null)}
              className="px-4 py-2 rounded-lg border border-border text-xs font-medium hover:bg-muted"
            >
              Stay in Queue
            </button>
            <button
              type="button"
              onClick={handleLeaveWaitlist}
              disabled={isLeavingWaitlist}
              className="px-4 py-2 rounded-lg bg-red-600 text-white text-xs font-medium hover:bg-red-700 disabled:opacity-50 inline-flex items-center gap-1.5"
            >
              {isLeavingWaitlist ? (
                <Loader2 className="size-3.5 animate-spin" />
              ) : (
                <span>Leave Queue</span>
              )}
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* SUBMIT REVIEW DIALOG */}
      <Dialog open={!!reviewBooking} onOpenChange={() => setReviewBooking(null)}>
        <DialogContent className="max-w-md bg-card border-border">
          <DialogHeader>
            <DialogTitle className="text-base font-bold flex items-center gap-2">
              <Star className="size-4 fill-amber-400 text-amber-400" />
              Leave Community Review
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              Share your lending experience. Honest ratings build neighborhood trust and ensure equipment reliability.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmitReview} className="space-y-4 py-2">
            <div>
              <label className="text-xs font-medium text-foreground block mb-1.5">
                Rating (1 - 5 Stars)
              </label>
              <div className="flex items-center gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setReviewRating(star)}
                    className="p-1 hover:scale-110 transition-transform"
                  >
                    <Star
                      className={`size-6 ${
                        star <= reviewRating
                          ? "fill-amber-400 text-amber-400"
                          : "text-muted-foreground/30"
                      }`}
                    />
                  </button>
                ))}
                <span className="ml-2 text-xs font-mono font-semibold text-foreground">
                  {reviewRating} of 5 Stars
                </span>
              </div>
            </div>

            <div>
              <label className="text-xs font-medium text-foreground block mb-1">
                Your Feedback & Experience *
              </label>
              <textarea
                required
                rows={4}
                placeholder="How was the equipment condition? Was the owner helpful with pickup and safety instructions?"
                value={reviewComment}
                onChange={(e) => setReviewComment(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-border bg-background text-xs text-foreground focus:outline-hidden"
              />
            </div>

            <DialogFooter className="pt-2">
              <button
                type="button"
                onClick={() => setReviewBooking(null)}
                className="px-4 py-2 rounded-lg border border-border text-xs font-medium hover:bg-muted"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmittingReview || reviewComment.trim().length < 5}
                className="px-4 py-2 rounded-lg bg-foreground text-background text-xs font-medium hover:opacity-90 disabled:opacity-50 inline-flex items-center gap-1.5"
              >
                {isSubmittingReview ? (
                  <>
                    <Loader2 className="size-3.5 animate-spin" />
                    <span>Submitting...</span>
                  </>
                ) : (
                  <span>Post Review</span>
                )}
              </button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <FooterSection />
    </div>
  );
}
