"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/use-auth";
import { Header } from "@/components/header";
import { FooterSection } from "@/components/sections/footer-section";
import { toast } from "sonner";
import {
  User as UserIcon,
  ShieldCheck,
  Package,
  Calendar,
  Lock,
  Phone,
  Mail,
  Edit3,
  CheckCircle2,
  Clock,
  Sparkles,
  ArrowRight,
  LogOut,
  Loader2,
  Activity,
  AlertCircle,
  Eye,
  EyeOff,
  Compass,
  FileCheck,
  Star,
  XCircle,
  Check,
  Ban,
  Users,
  MapPin,
  CalendarCheck,
  CreditCard
} from "lucide-react";
import { DepositPaymentDialog } from "@/components/deposit-payment-dialog";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";

interface AuditLogItem {
  id: string;
  actorId: string;
  action: string;
  entityType: string;
  entityId: string;
  details: string;
  timestamp: string;
}

interface ProfileStats {
  resourcesBorrowed?: number;
  resourcesShared?: number;
  approvedBookings?: number;
  completedTransactions?: number;
  activeWaitlist?: number;
  incomingRequests?: number;
  activeResources?: number;
  communityRating?: number;
  completionRate?: string;
}

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
  depositStatus?: string;
  depositPaidAt?: string | null;
  status: "pending" | "approved" | "rejected" | "cancelled" | "completed";
  rejectionReason?: string;
  createdAt: string;
  borrowerName?: string;
  borrowerEmail?: string;
  borrowerPhone?: string;
  ownerName?: string;
  ownerEmail?: string;
  resourceTitle?: string;
  resourceImage?: string;
  resourceLocation?: string;
  deposit?: string;
}

interface WaitlistItem {
  id: string;
  resourceId: string;
  borrowerId: string;
  startDate: string;
  endDate: string;
  status: string;
  position: number;
  createdAt: string;
  resourceTitle?: string;
  resourceImage?: string;
  resourceLocation?: string;
}

export default function ProfilePage() {
  const router = useRouter();
  const { user, isLoading: authLoading, logout, updateProfile, refreshUser } = useAuth();

  // Stats & Activity
  const [stats, setStats] = useState<ProfileStats | null>(null);
  const [activityLogs, setActivityLogs] = useState<AuditLogItem[]>([]);
  const [isDataLoading, setIsDataLoading] = useState(true);

  // Phase 4 Bookings & Waitlist
  const [bookings, setBookings] = useState<BookingItem[]>([]);
  const [waitlistEntries, setWaitlistEntries] = useState<WaitlistItem[]>([]);
  const [bookingsLoading, setBookingsLoading] = useState(false);
  const [bookingFilter, setBookingFilter] = useState<string>("all");

  // Rejection modal
  const [rejectingBookingId, setRejectingBookingId] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState("");
  const [actionLoading, setActionLoading] = useState(false);

  // Phase 7 Payment modal
  const [payingBooking, setPayingBooking] = useState<BookingItem | null>(null);

  // Edit Profile Form state
  const [editFullName, setEditFullName] = useState("");
  const [editPhone, setEditPhone] = useState("");
  const [editAvatar, setEditAvatar] = useState("");
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);

  // Password Change Form state
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  // Redirect if guest
  useEffect(() => {
    if (!authLoading && !user) {
      router.replace("/login");
    }
  }, [user, authLoading, router]);

  // Sync user details to form
  useEffect(() => {
    if (user) {
      setEditFullName(user.fullName || "");
      setEditPhone(user.phone || "");
      setEditAvatar(user.avatar || "");
    }
  }, [user]);

  // Fetch full stats and audit logs
  const fetchProfileData = useCallback(async () => {
    if (!user) return;
    try {
      const res = await fetch("/api/auth/me", { cache: "no-store" });
      if (res.ok) {
        const data = await res.json();
        if (data.stats) setStats(data.stats);
        if (data.recentActivity) setActivityLogs(data.recentActivity);
      }
    } catch (err) {
      console.error("Error fetching profile data:", err);
    } finally {
      setIsDataLoading(false);
    }
  }, [user]);

  // Fetch Bookings & Waitlist
  const fetchBookingsAndWaitlist = useCallback(async () => {
    if (!user) return;
    setBookingsLoading(true);
    try {
      const [bookRes, waitRes] = await Promise.all([
        fetch("/api/bookings", { cache: "no-store" }),
        user.role === "borrower" ? fetch("/api/waitlist", { cache: "no-store" }) : Promise.resolve(null),
      ]);

      if (bookRes.ok) {
        const bookData = await bookRes.json();
        setBookings(bookData.bookings || []);
      }

      if (waitRes && waitRes.ok) {
        const waitData = await waitRes.json();
        setWaitlistEntries(waitData.waitlist || []);
      }
    } catch (err) {
      console.error("Error loading bookings:", err);
    } finally {
      setBookingsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (user) {
      fetchProfileData();
      fetchBookingsAndWaitlist();
    }
  }, [user, fetchProfileData, fetchBookingsAndWaitlist]);

  // Owner Approve Booking
  const handleApprove = async (bookingId: string) => {
    setActionLoading(true);
    try {
      const res = await fetch(`/api/bookings/${bookingId}/approve`, {
        method: "POST",
      });
      const data = await res.json();
      if (res.ok) {
        toast.success("Booking request approved! Dates reserved.");
        await fetchBookingsAndWaitlist();
        await fetchProfileData();
      } else {
        toast.error(data.error || "Failed to approve booking.");
      }
    } catch {
      toast.error("Network error");
    } finally {
      setActionLoading(false);
    }
  };

  // Owner Reject Booking
  const handleRejectConfirm = async () => {
    if (!rejectingBookingId) return;
    setActionLoading(true);
    try {
      const res = await fetch(`/api/bookings/${rejectingBookingId}/reject`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reason: rejectReason.trim() || undefined }),
      });
      const data = await res.json();
      if (res.ok) {
        toast.info("Booking request declined.");
        setRejectingBookingId(null);
        setRejectReason("");
        await fetchBookingsAndWaitlist();
        await fetchProfileData();
      } else {
        toast.error(data.error || "Failed to decline booking.");
      }
    } catch {
      toast.error("Network error");
    } finally {
      setActionLoading(false);
    }
  };

  // Cancel Booking (Borrower or Owner)
  const handleCancelBooking = async (bookingId: string) => {
    if (!confirm("Are you sure you want to cancel this booking?")) return;
    setActionLoading(true);
    try {
      const res = await fetch(`/api/bookings/${bookingId}/cancel`, {
        method: "POST",
      });
      const data = await res.json();
      if (res.ok) {
        toast.info("Booking cancelled.");
        await fetchBookingsAndWaitlist();
        await fetchProfileData();
      } else {
        toast.error(data.error || "Failed to cancel booking.");
      }
    } catch {
      toast.error("Network error");
    } finally {
      setActionLoading(false);
    }
  };

  // Leave Waitlist
  const handleLeaveWaitlist = async (waitlistId: string) => {
    try {
      const res = await fetch(`/api/waitlist/${waitlistId}`, {
        method: "DELETE",
      });
      if (res.ok) {
        toast.info("You have left the waitlist.");
        await fetchBookingsAndWaitlist();
        await fetchProfileData();
      }
    } catch {
      toast.error("Failed to leave waitlist.");
    }
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editFullName.trim()) {
      toast.error("Full name cannot be empty");
      return;
    }
    if (!editPhone.trim()) {
      toast.error("Phone number cannot be empty");
      return;
    }

    setIsUpdatingProfile(true);
    const res = await updateProfile({
      fullName: editFullName.trim(),
      phone: editPhone.trim(),
      avatar: editAvatar.trim() || undefined,
    });
    setIsUpdatingProfile(false);

    if (res.success) {
      toast.success("Profile updated successfully!");
      await refreshUser();
    } else {
      toast.error(res.error || "Failed to update profile");
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentPassword) {
      toast.error("Please enter your current password");
      return;
    }
    if (newPassword.length < 8) {
      toast.error("New password must be at least 8 characters");
      return;
    }
    if (newPassword !== confirmNewPassword) {
      toast.error("New passwords do not match");
      return;
    }

    setIsChangingPassword(true);
    const res = await updateProfile({
      currentPassword,
      newPassword,
    });
    setIsChangingPassword(false);

    if (res.success) {
      toast.success("Password changed successfully!");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmNewPassword("");
    } else {
      toast.error(res.error || "Failed to update password");
    }
  };

  const handleLogout = async () => {
    await logout();
    router.push("/login");
  };

  if (authLoading || (!user && isDataLoading)) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center">
        <Loader2 className="size-8 animate-spin text-foreground mb-4" />
        <p className="text-sm font-mono text-muted-foreground">Authenticating session...</p>
      </div>
    );
  }

  if (!user) return null;

  const isOwner = user.role === "owner";

  // Filter bookings
  const filteredBookings = bookings.filter((b) => {
    if (bookingFilter === "all") return true;
    return b.status === bookingFilter;
  });

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col selection:bg-foreground selection:text-background">
      <Header />

      <main className="flex-1 pt-28 pb-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Top Banner / Identity Header */}
          <div className="relative rounded-3xl border border-border/80 bg-card p-6 sm:p-10 shadow-sm overflow-hidden mb-8">
            <div className="absolute top-0 right-0 w-96 h-96 bg-foreground/[0.02] dark:bg-white/[0.02] rounded-full blur-3xl pointer-events-none" />

            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
              <div className="flex items-center gap-5">
                <div className="size-20 sm:size-24 rounded-2xl bg-foreground text-background dark:bg-white dark:text-black flex items-center justify-center font-bold text-2xl sm:text-3xl shadow-md shrink-0">
                  {user.fullName ? user.fullName.charAt(0).toUpperCase() : "U"}
                </div>

                <div className="space-y-1.5">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
                      {user.fullName}
                    </h1>
                    <span className="font-mono text-xs uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-foreground text-background font-semibold">
                      {user.role}
                    </span>
                    {user.verified && (
                      <span className="inline-flex items-center gap-1 font-mono text-[11px] text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                        <CheckCircle2 className="size-3" />
                        <span>Verified ID</span>
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-4 text-xs text-muted-foreground flex-wrap">
                    <span className="inline-flex items-center gap-1">
                      <Mail className="size-3.5" />
                      <span>{user.email}</span>
                    </span>
                    <span className="inline-flex items-center gap-1">
                      <Phone className="size-3.5" />
                      <span>{user.phone || "No phone added"}</span>
                    </span>
                    <span className="inline-flex items-center gap-1 font-mono">
                      <Calendar className="size-3.5" />
                      <span>Joined {new Date(user.createdAt).toLocaleDateString("en-US", { month: "short", year: "numeric" })}</span>
                    </span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-3 pt-2 md:pt-0">
                <Link
                  href={isOwner ? "/dashboard/owner/payments" : "/dashboard/borrower/payments"}
                  className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-medium rounded-full border border-border text-foreground hover:bg-muted transition-colors cursor-pointer"
                >
                  <CreditCard className="size-3.5" />
                  <span>{isOwner ? "Security Deposits" : "Payments & Deposits"}</span>
                </Link>
                <Link
                  href="/resources"
                  className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-medium rounded-full bg-foreground text-background hover:opacity-90 transition-opacity"
                >
                  <Compass className="size-3.5" />
                  <span>Browse Gear</span>
                </Link>
                <button
                  type="button"
                  onClick={handleLogout}
                  className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-medium rounded-full border border-border text-foreground hover:bg-muted transition-colors cursor-pointer"
                >
                  <LogOut className="size-3.5" />
                  <span>Sign Out</span>
                </button>
              </div>
            </div>
          </div>

          {/* REAL STATS METRICS ROW (PERSISTENT FROM SQLITE) */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <div className="p-5 rounded-2xl border border-border/70 bg-card/60">
              <div className="flex items-center justify-between text-muted-foreground mb-2">
                <span className="text-xs font-mono uppercase tracking-wider">
                  {isOwner ? "Incoming Requests" : "Total Requests"}
                </span>
                <Package className="size-4" />
              </div>
              <div className="text-2xl font-bold font-mono">
                {isOwner ? (stats?.incomingRequests ?? 0) : (stats?.resourcesBorrowed ?? 0)}
              </div>
              <p className="text-[11px] text-muted-foreground mt-1">
                {isOwner ? "Pending borrower reviews" : "Total requests submitted"}
              </p>
            </div>

            <div className="p-5 rounded-2xl border border-border/70 bg-card/60">
              <div className="flex items-center justify-between text-muted-foreground mb-2">
                <span className="text-xs font-mono uppercase tracking-wider">Approved Bookings</span>
                <CalendarCheck className="size-4" />
              </div>
              <div className="text-2xl font-bold font-mono">
                {stats?.approvedBookings ?? 0}
              </div>
              <p className="text-[11px] text-muted-foreground mt-1">Confirmed calendar reservations</p>
            </div>

            <div className="p-5 rounded-2xl border border-border/70 bg-card/60">
              <div className="flex items-center justify-between text-muted-foreground mb-2">
                <span className="text-xs font-mono uppercase tracking-wider">
                  {isOwner ? "Completed Lendings" : "Active Waitlists"}
                </span>
                {isOwner ? <Activity className="size-4" /> : <Users className="size-4" />}
              </div>
              <div className="text-2xl font-bold font-mono">
                {isOwner ? (stats?.completedTransactions ?? 0) : (stats?.activeWaitlist ?? 0)}
              </div>
              <p className="text-[11px] text-muted-foreground mt-1">
                {isOwner ? "Returned & inspected deals" : "Active queue alerts"}
              </p>
            </div>

            <div className="p-5 rounded-2xl border border-border/70 bg-card/60">
              <div className="flex items-center justify-between text-muted-foreground mb-2">
                <span className="text-xs font-mono uppercase tracking-wider">Community Standing</span>
                <ShieldCheck className="size-4 text-emerald-500" />
              </div>
              <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 capitalize">
                {user.status}
              </div>
              <p className="text-[11px] text-muted-foreground mt-1">Verified community rating</p>
            </div>
          </div>

          {/* Tab Navigation */}
          <Tabs defaultValue="bookings" className="w-full">
            <TabsList className="w-full max-w-xl bg-muted/70 p-1 mb-8 rounded-xl grid grid-cols-5">
              <TabsTrigger value="bookings" className="text-xs">
                {isOwner ? "Incoming" : "My Bookings"}
              </TabsTrigger>
              <TabsTrigger value="overview" className="text-xs">Overview</TabsTrigger>
              <TabsTrigger value="edit" className="text-xs">Edit Profile</TabsTrigger>
              <TabsTrigger value="security" className="text-xs">Security</TabsTrigger>
              <TabsTrigger value="trust" className="text-xs">Badges</TabsTrigger>
            </TabsList>

            {/* TAB 1: BOOKINGS & WAITLISTS (PHASE 4 CORE) */}
            <TabsContent value="bookings" className="space-y-6">
              {/* Header & Filter Controls */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl border border-border bg-card">
                <div>
                  <h2 className="text-base font-bold">
                    {isOwner ? "Incoming Equipment Requests" : "Your Resource Bookings"}
                  </h2>
                  <p className="text-xs text-muted-foreground">
                    {isOwner 
                      ? "Review, approve, or decline borrowing requests for your listed tools and gear."
                      : "Track your active reservations, pending reviews, and past borrowing history."}
                  </p>
                </div>

                <div className="flex items-center gap-2 overflow-x-auto">
                  {["all", "pending", "approved", "completed", "cancelled"].map((st) => (
                    <button
                      key={st}
                      type="button"
                      onClick={() => setBookingFilter(st)}
                      className={`text-[11px] font-mono uppercase px-3 py-1.5 rounded-lg border transition-all cursor-pointer ${
                        bookingFilter === st
                          ? "bg-foreground text-background border-foreground font-semibold"
                          : "border-border text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      {st}
                    </button>
                  ))}
                </div>
              </div>

              {/* Bookings List */}
              {bookingsLoading ? (
                <div className="p-12 text-center text-xs text-muted-foreground font-mono">
                  <Loader2 className="size-6 animate-spin mx-auto mb-2 text-foreground" />
                  Loading bookings from database...
                </div>
              ) : filteredBookings.length === 0 ? (
                <div className="p-12 rounded-2xl border border-dashed border-border text-center space-y-3 bg-card/40">
                  <Package className="size-8 text-muted-foreground mx-auto" />
                  <div className="text-sm font-medium">No bookings found in this view</div>
                  <p className="text-xs text-muted-foreground max-w-sm mx-auto">
                    {isOwner
                      ? "When borrowers request your resources, their requests will appear here for your approval."
                      : "You haven't requested any resources in this category yet. Explore the catalog to borrow equipment!"}
                  </p>
                  {!isOwner && (
                    <Link
                      href="/resources"
                      className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-foreground text-background text-xs font-medium"
                    >
                      <Compass className="size-3.5" />
                      <span>Explore Equipment</span>
                    </Link>
                  )}
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-4">
                  {filteredBookings.map((b) => {
                    const isPending = b.status === "pending";
                    const isApproved = b.status === "approved";
                    const isRejected = b.status === "rejected";
                    const isCancelled = b.status === "cancelled";
                    const isCompleted = b.status === "completed";

                    return (
                      <div
                        key={b.id}
                        className="p-5 rounded-2xl border border-border bg-card shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-5"
                      >
                        {/* Resource and details */}
                        <div className="flex items-start gap-4">
                          <div className="size-16 rounded-xl overflow-hidden bg-secondary border border-border shrink-0">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                              src={b.resourceImage || "/placeholder.jpg"}
                              alt={b.resourceTitle || "Resource"}
                              className="size-full object-cover"
                            />
                          </div>

                          <div className="space-y-1">
                            <div className="flex items-center gap-2 flex-wrap">
                              <h3 className="font-semibold text-sm text-foreground">
                                {b.resourceTitle}
                              </h3>
                              <span
                                className={`text-[10px] font-mono uppercase tracking-wider px-2 py-0.5 rounded-full ${
                                  isPending
                                    ? "bg-amber-500/10 text-amber-600 border border-amber-500/20"
                                    : isApproved
                                    ? "bg-emerald-500/10 text-emerald-600 border border-emerald-500/20"
                                    : isRejected
                                    ? "bg-destructive/10 text-destructive border border-destructive/20"
                                    : isCancelled
                                    ? "bg-muted text-muted-foreground border border-border"
                                    : "bg-blue-500/10 text-blue-600 border border-blue-500/20"
                                }`}
                              >
                                {b.status}
                              </span>
                              {b.depositStatus && (
                                <span
                                  className={`text-[10px] font-mono capitalize px-2 py-0.5 rounded-full border ${
                                    b.depositStatus === "paid"
                                      ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20"
                                      : b.depositStatus === "refunded"
                                      ? "bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20"
                                      : b.depositStatus === "partially_refunded"
                                      ? "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20"
                                      : "bg-muted text-muted-foreground border-border"
                                  }`}
                                >
                                  Deposit: {b.depositStatus.replace(/_/g, " ")}
                                </span>
                              )}
                              <span className="font-mono text-[10px] text-muted-foreground">
                                {b.id}
                              </span>
                            </div>

                            <div className="text-xs text-muted-foreground flex items-center gap-3 flex-wrap">
                              <span className="inline-flex items-center gap-1 font-medium text-foreground">
                                <Calendar className="size-3" />
                                <span>{b.startDate} → {b.endDate}</span>
                              </span>
                              <span>•</span>
                              <span>
                                {isOwner ? `Borrower: ${b.borrowerName || "Community Member"}` : `Owner: ${b.ownerName || "Lender"}`}
                              </span>
                              {b.pickupPreference && (
                                <>
                                  <span>•</span>
                                  <span className="text-muted-foreground">{b.pickupPreference}</span>
                                </>
                              )}
                            </div>

                            <p className="text-xs text-muted-foreground italic pt-1">
                              Purpose: "{b.purpose}"
                            </p>

                            {b.rejectionReason && (
                              <p className="text-xs text-destructive pt-0.5">
                                Reason for decline: {b.rejectionReason}
                              </p>
                            )}
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-2 shrink-0 pt-2 md:pt-0">
                          {isOwner && isPending && (
                            <>
                              <button
                                type="button"
                                disabled={actionLoading}
                                onClick={() => handleApprove(b.id)}
                                className="px-3.5 py-2 rounded-xl bg-emerald-600 text-white text-xs font-medium hover:bg-emerald-700 transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs disabled:opacity-50"
                              >
                                <Check className="size-3.5" />
                                <span>Approve</span>
                              </button>
                              <button
                                type="button"
                                disabled={actionLoading}
                                onClick={() => {
                                  setRejectingBookingId(b.id);
                                  setRejectReason("");
                                }}
                                className="px-3.5 py-2 rounded-xl border border-destructive/40 text-destructive text-xs font-medium hover:bg-destructive/10 transition-colors flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                              >
                                <Ban className="size-3.5" />
                                <span>Decline</span>
                              </button>
                            </>
                          )}

                          {/* Payment Actions for Borrowers */}
                          {!isOwner && (isPending || isApproved) && b.depositStatus !== "paid" && (
                            <button
                              type="button"
                              onClick={() => setPayingBooking(b)}
                              className="px-3.5 py-2 rounded-xl bg-foreground text-background text-xs font-semibold hover:opacity-90 transition-opacity flex items-center gap-1.5 cursor-pointer shadow-xs"
                            >
                              <CreditCard className="size-3.5" />
                              <span>Pay Deposit</span>
                            </button>
                          )}
                          {!isOwner && b.depositStatus === "paid" && (
                            <Link
                              href="/dashboard/borrower/payments"
                              className="px-3 py-2 rounded-xl border border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 text-xs font-medium hover:bg-emerald-500/20 transition-colors flex items-center gap-1.5"
                            >
                              <CheckCircle2 className="size-3.5" />
                              <span>Receipt</span>
                            </Link>
                          )}

                          {/* Cancellation for Pending or Approved */}
                          {(isPending || isApproved) && (
                            <button
                              type="button"
                              disabled={actionLoading}
                              onClick={() => handleCancelBooking(b.id)}
                              className="px-3 py-2 rounded-xl border border-border text-muted-foreground hover:text-foreground text-xs font-medium hover:bg-muted transition-colors cursor-pointer disabled:opacity-50"
                            >
                              Cancel Booking
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Waitlist Section (For Borrowers) */}
              {!isOwner && waitlistEntries.length > 0 && (
                <div className="pt-6 border-t border-border space-y-4">
                  <div className="flex items-center gap-2">
                    <Users className="size-4 text-blue-500" />
                    <h3 className="text-sm font-semibold">Active Waitlist Positions</h3>
                  </div>

                  <div className="grid grid-cols-1 gap-3">
                    {waitlistEntries.map((w) => (
                      <div
                        key={w.id}
                        className="p-4 rounded-xl border border-blue-500/20 bg-blue-500/5 flex items-center justify-between gap-4"
                      >
                        <div className="space-y-0.5">
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-xs text-foreground">
                              {w.resourceTitle}
                            </span>
                            <span className="font-mono text-[10px] uppercase px-2 py-0.5 rounded-full bg-blue-500 text-white font-bold">
                              Position #{w.position}
                            </span>
                          </div>
                          <div className="text-[11px] text-muted-foreground">
                            Requested Dates: {w.startDate} to {w.endDate} · Status: {w.status}
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={() => handleLeaveWaitlist(w.id)}
                          className="text-xs text-muted-foreground hover:text-destructive underline cursor-pointer"
                        >
                          Leave Waitlist
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </TabsContent>

            {/* TAB 2: OVERVIEW & ACTIVITY */}
            <TabsContent value="overview" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left: Role Explanation Card */}
                <div className="lg:col-span-1 space-y-6">
                  <div className="p-6 rounded-2xl border border-border bg-card">
                    <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-muted border border-border text-[11px] font-mono uppercase tracking-wider text-muted-foreground mb-4">
                      <Sparkles className="size-3" />
                      <span>Role Profile</span>
                    </div>

                    <h2 className="text-lg font-bold">
                      {isOwner ? "Resource Owner" : "Community Borrower"}
                    </h2>
                    <p className="text-xs text-muted-foreground mt-2 leading-relaxed">
                      {isOwner
                        ? "As a verified Resource Owner, you can list high-value equipment, set daily rates and security deposits, and accept or decline requests from verified borrowers."
                        : "As an active Borrower, you have instant access to neighborhood tools and camping gear. You are protected by our damage waiver guidelines and clear borrowing terms."}
                    </p>

                    <div className="mt-5 pt-4 border-t border-border/60 space-y-2.5">
                      <div className="text-xs font-medium text-foreground">Active Role Benefits:</div>
                      <div className="text-xs text-muted-foreground flex items-center gap-2">
                        <CheckCircle2 className="size-3.5 text-emerald-500 shrink-0" />
                        <span>{isOwner ? "100% rental revenue retention" : "Zero ownership storage footprint"}</span>
                      </div>
                      <div className="text-xs text-muted-foreground flex items-center gap-2">
                        <CheckCircle2 className="size-3.5 text-emerald-500 shrink-0" />
                        <span>{isOwner ? "Refundable deposit protection" : "Fair condition inspection at pickup"}</span>
                      </div>
                      <div className="text-xs text-muted-foreground flex items-center gap-2">
                        <CheckCircle2 className="size-3.5 text-emerald-500 shrink-0" />
                        <span>{isOwner ? "Priority listing in catalog" : "Automated FIFO waitlist priority"}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right: Activity Log from SQLite */}
                <div className="lg:col-span-2">
                  <div className="p-6 rounded-2xl border border-border bg-card">
                    <div className="flex items-center justify-between mb-5">
                      <div>
                        <h2 className="text-base font-bold">Recent Account Activity</h2>
                        <p className="text-xs text-muted-foreground">Immutable audit entries logged for your profile</p>
                      </div>
                      <div className="size-8 rounded-full bg-muted flex items-center justify-center">
                        <Activity className="size-4 text-muted-foreground" />
                      </div>
                    </div>

                    {activityLogs.length === 0 ? (
                      <div className="p-8 text-center text-xs text-muted-foreground font-mono">
                        No activity records found.
                      </div>
                    ) : (
                      <div className="divide-y divide-border/60">
                        {activityLogs.map((log) => (
                          <div key={log.id} className="py-3.5 flex items-start justify-between gap-4">
                            <div className="flex items-start gap-3">
                              <div className="size-7 rounded-full bg-foreground/5 dark:bg-white/5 flex items-center justify-center mt-0.5 shrink-0">
                                <Clock className="size-3.5 text-foreground" />
                              </div>
                              <div>
                                <div className="text-xs font-semibold font-mono tracking-tight text-foreground">
                                  {log.action}
                                </div>
                                <div className="text-[11px] text-muted-foreground mt-0.5">
                                  {log.details ? log.details : `Entity: ${log.entityType}`}
                                </div>
                              </div>
                            </div>
                            <div className="text-[10px] font-mono text-muted-foreground shrink-0 pt-0.5">
                              {new Date(log.timestamp).toLocaleString("en-US", {
                                month: "short",
                                day: "numeric",
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </TabsContent>

            {/* TAB 3: EDIT PROFILE */}
            <TabsContent value="edit">
              <div className="max-w-xl p-6 sm:p-8 rounded-2xl border border-border bg-card">
                <h2 className="text-lg font-bold mb-1">Edit Account Profile</h2>
                <p className="text-xs text-muted-foreground mb-6">
                  Update your contact details and display preferences.
                </p>

                <form onSubmit={handleUpdateProfile} className="space-y-4">
                  <div>
                    <label className="block text-xs font-medium mb-1.5 text-foreground">
                      Full Name
                    </label>
                    <input
                      type="text"
                      required
                      value={editFullName}
                      onChange={(e) => setEditFullName(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-foreground/20 focus:border-foreground"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium mb-1.5 text-foreground">
                      Email Address (Permanent Identifier)
                    </label>
                    <input
                      type="email"
                      disabled
                      value={user.email}
                      className="w-full px-3.5 py-2.5 rounded-lg border border-border/50 bg-muted/50 text-muted-foreground text-sm cursor-not-allowed font-mono text-xs"
                    />
                    <p className="text-[11px] text-muted-foreground mt-1">
                      Email addresses are linked to verified security audits and cannot be edited.
                    </p>
                  </div>

                  <div>
                    <label className="block text-xs font-medium mb-1.5 text-foreground">
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      required
                      value={editPhone}
                      onChange={(e) => setEditPhone(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-foreground/20 focus:border-foreground"
                    />
                  </div>

                  <div className="pt-2">
                    <button
                      type="submit"
                      disabled={isUpdatingProfile}
                      className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-foreground text-background text-xs font-medium hover:opacity-90 transition-opacity disabled:opacity-50 cursor-pointer"
                    >
                      {isUpdatingProfile ? (
                        <>
                          <Loader2 className="size-3.5 animate-spin" />
                          <span>Saving Changes...</span>
                        </>
                      ) : (
                        <span>Save Profile Changes</span>
                      )}
                    </button>
                  </div>
                </form>
              </div>
            </TabsContent>

            {/* TAB 4: SECURITY & PASSWORD */}
            <TabsContent value="security">
              <div className="max-w-xl p-6 sm:p-8 rounded-2xl border border-border bg-card">
                <h2 className="text-lg font-bold mb-1">Security & Password</h2>
                <p className="text-xs text-muted-foreground mb-6">
                  Manage your credentials and password protection. Passwords are encrypted with Scrypt and salt.
                </p>

                <form onSubmit={handleChangePassword} className="space-y-4">
                  <div>
                    <label className="block text-xs font-medium mb-1.5 text-foreground">
                      Current Password
                    </label>
                    <div className="relative">
                      <input
                        type={showCurrentPassword ? "text" : "password"}
                        required
                        placeholder="Enter current password"
                        value={currentPassword}
                        onChange={(e) => setCurrentPassword(e.target.value)}
                        className="w-full pl-3.5 pr-10 py-2.5 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-foreground/20 focus:border-foreground"
                      />
                      <button
                        type="button"
                        onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                        className="absolute inset-y-0 right-0 pr-3 flex items-center text-muted-foreground hover:text-foreground"
                      >
                        {showCurrentPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-medium mb-1.5 text-foreground">
                      New Password
                    </label>
                    <div className="relative">
                      <input
                        type={showNewPassword ? "text" : "password"}
                        required
                        placeholder="At least 8 characters with upper, lower, and number"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        className="w-full pl-3.5 pr-10 py-2.5 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-foreground/20 focus:border-foreground"
                      />
                      <button
                        type="button"
                        onClick={() => setShowNewPassword(!showNewPassword)}
                        className="absolute inset-y-0 right-0 pr-3 flex items-center text-muted-foreground hover:text-foreground"
                      >
                        {showNewPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-medium mb-1.5 text-foreground">
                      Confirm New Password
                    </label>
                    <input
                      type="password"
                      required
                      placeholder="Repeat new password"
                      value={confirmNewPassword}
                      onChange={(e) => setConfirmNewPassword(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-foreground/20 focus:border-foreground"
                    />
                  </div>

                  <div className="pt-2">
                    <button
                      type="submit"
                      disabled={isChangingPassword}
                      className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-foreground text-background text-xs font-medium hover:opacity-90 transition-opacity disabled:opacity-50 cursor-pointer"
                    >
                      {isChangingPassword ? (
                        <>
                          <Loader2 className="size-3.5 animate-spin" />
                          <span>Updating Password...</span>
                        </>
                      ) : (
                        <span>Update Password</span>
                      )}
                    </button>
                  </div>
                </form>
              </div>
            </TabsContent>

            {/* TAB 5: TRUST & BADGES */}
            <TabsContent value="trust">
              <div className="max-w-2xl p-6 sm:p-8 rounded-2xl border border-border bg-card">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h2 className="text-lg font-bold">Community Trust & Verification</h2>
                    <p className="text-xs text-muted-foreground">
                      Verification badges increase lender confidence and unlock higher resource borrowing limits.
                    </p>
                  </div>
                  <div className="size-9 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                    <ShieldCheck className="size-5" />
                  </div>
                </div>

                <div className="divide-y divide-border/60">
                  <div className="py-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="size-8 rounded-full bg-emerald-500/10 text-emerald-600 flex items-center justify-center">
                        <CheckCircle2 className="size-4" />
                      </div>
                      <div>
                        <div className="text-xs font-semibold">Government ID Verification</div>
                        <div className="text-[11px] text-muted-foreground">Authenticated via cryptographic ledger</div>
                      </div>
                    </div>
                    <span className="font-mono text-[10px] text-emerald-600 dark:text-emerald-400 uppercase tracking-wider px-2 py-0.5 rounded bg-emerald-500/10">
                      Verified
                    </span>
                  </div>

                  <div className="py-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="size-8 rounded-full bg-emerald-500/10 text-emerald-600 flex items-center justify-center">
                        <CheckCircle2 className="size-4" />
                      </div>
                      <div>
                        <div className="text-xs font-semibold">Phone Number Validation</div>
                        <div className="text-[11px] text-muted-foreground">{user.phone}</div>
                      </div>
                    </div>
                    <span className="font-mono text-[10px] text-emerald-600 dark:text-emerald-400 uppercase tracking-wider px-2 py-0.5 rounded bg-emerald-500/10">
                      Verified
                    </span>
                  </div>

                  <div className="py-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="size-8 rounded-full bg-emerald-500/10 text-emerald-600 flex items-center justify-center">
                        <CheckCircle2 className="size-4" />
                      </div>
                      <div>
                        <div className="text-xs font-semibold">Community Peer Agreement</div>
                        <div className="text-[11px] text-muted-foreground">Signed at account onboarding</div>
                      </div>
                    </div>
                    <span className="font-mono text-[10px] text-emerald-600 dark:text-emerald-400 uppercase tracking-wider px-2 py-0.5 rounded bg-emerald-500/10">
                      Accepted
                    </span>
                  </div>

                  <div className="py-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="size-8 rounded-full bg-muted text-muted-foreground flex items-center justify-center">
                        <FileCheck className="size-4" />
                      </div>
                      <div>
                        <div className="text-xs font-semibold">Insurance & Damage Waiver Tier</div>
                        <div className="text-[11px] text-muted-foreground">Standard Community Protection ($2,000 coverage)</div>
                      </div>
                    </div>
                    <span className="font-mono text-[10px] text-foreground uppercase tracking-wider px-2 py-0.5 rounded bg-muted">
                      Active
                    </span>
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </main>

      {/* Phase 7 Deposit Payment Dialog */}
      {payingBooking && (
        <DepositPaymentDialog
          isOpen={Boolean(payingBooking)}
          onClose={() => setPayingBooking(null)}
          bookingId={payingBooking.id}
          resourceTitle={payingBooking.resourceTitle}
          onSuccess={() => {
            fetchBookingsAndWaitlist();
          }}
        />
      )}

      {/* Decline Reason Modal */}
      <Dialog open={Boolean(rejectingBookingId)} onOpenChange={(open) => !open && setRejectingBookingId(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-base font-semibold">Decline Booking Request</DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              Provide an optional reason to explain why you are declining this request (e.g. equipment undergoing maintenance, scheduling conflict).
            </DialogDescription>
          </DialogHeader>

          <div className="py-2">
            <textarea
              rows={3}
              placeholder="Reason for declining (optional)..."
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-border bg-background text-xs focus:ring-2 focus:ring-foreground/20 focus:outline-none resize-none"
            />
          </div>

          <DialogFooter className="flex gap-2">
            <button
              type="button"
              disabled={actionLoading}
              onClick={handleRejectConfirm}
              className="px-4 py-2 rounded-lg bg-destructive text-destructive-foreground text-xs font-medium hover:opacity-90 transition-opacity"
            >
              Confirm Decline
            </button>
            <button
              type="button"
              onClick={() => setRejectingBookingId(null)}
              className="px-4 py-2 rounded-lg border border-border text-foreground text-xs font-medium hover:bg-muted"
            >
              Back
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <FooterSection />
    </div>
  );
}