"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/use-auth";
import { Header } from "@/components/header";
import { FooterSection } from "@/components/sections/footer-section";
import { toast } from "sonner";
import {
  Package,
  PlusCircle,
  Calendar,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Star,
  MapPin,
  TrendingUp,
  ShieldCheck,
  Pause,
  Play,
  Edit3,
  Trash2,
  ExternalLink,
  Upload,
  ArrowRight,
  Layers,
  Sparkles,
  Loader2,
  Check,
  RefreshCw,
  Search,
  Filter
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

const CATEGORIES = [
  "Tools & Equipment",
  "Outdoor & Camping",
  "Electronics",
  "Sports & Fitness",
  "Photography",
  "Books & Education",
  "Industrial Machinery",
  "General Laboratory Equipment",
  "Medical Laboratory Equipment",
  "Construction & Workshop Equipment",
  "Educational & Research Equipment",
];

const CONDITIONS = ["Like New", "Excellent", "Good", "Fair"];

interface ResourceItem {
  id: string;
  title: string;
  category: string;
  condition: string;
  location: string;
  description: string;
  images: string[];
  maxDuration: string;
  deposit: number;
  status: "active" | "paused" | "deleted";
  specs: string[];
  createdAt: string;
}

interface BookingItem {
  id: string;
  resourceId: string;
  borrowerId: string;
  borrowerName?: string;
  borrowerEmail?: string;
  ownerId: string;
  startDate: string;
  endDate: string;
  purpose: string;
  message?: string;
  pickupPreference?: string;
  status: "pending" | "approved" | "rejected" | "cancelled" | "completed";
  createdAt: string;
}

interface AnalyticsData {
  totalResources: number;
  activeListings: number;
  totalRequests: number;
  approvedBookings: number;
  completedLendings: number;
  rejectedCancelled: number;
  utilizationPercentage: number;
  averageRating: number;
  reviewCount: number;
  mostRequestedResources: {
    id: string;
    title: string;
    category: string;
    requestCount: number;
  }[];
}

interface TrustBadge {
  id: string;
  name: string;
  description: string;
  category: "reputation" | "verification";
  icon: string;
}

export default function OwnerDashboardPage() {
  const { user, isLoading: authLoading } = useAuth();
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("resources");

  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [resources, setResources] = useState<ResourceItem[]>([]);
  const [bookings, setBookings] = useState<BookingItem[]>([]);
  const [trustBadges, setTrustBadges] = useState<TrustBadge[]>([]);

  // Search & filter for resources
  const [resourceSearch, setResourceSearch] = useState("");
  const [resourceFilter, setResourceFilter] = useState("all");

  // Create Resource Modal
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newCategory, setNewCategory] = useState(CATEGORIES[0]);
  const [newCondition, setNewCondition] = useState(CONDITIONS[0]);
  const [newLocation, setNewLocation] = useState("");
  const [newDescription, setNewDescription] = useState("");
  const [newMaxDuration, setNewMaxDuration] = useState("7 days");
  const [newDeposit, setNewDeposit] = useState(50);
  const [newSpecs, setNewSpecs] = useState("");
  const [newImageUrl, setNewImageUrl] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [isSubmittingResource, setIsSubmittingResource] = useState(false);

  // Edit Resource Modal
  const [editingResource, setEditingResource] = useState<ResourceItem | null>(null);
  const [isEditOpen, setIsEditOpen] = useState(false);

  // Delete Confirmation Modal
  const [deletingResource, setDeletingResource] = useState<ResourceItem | null>(null);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Booking Action Modal
  const [actionBooking, setActionBooking] = useState<BookingItem | null>(null);
  const [actionType, setActionType] = useState<"approve" | "reject" | "complete" | null>(null);
  const [isActionSubmitting, setIsActionSubmitting] = useState(false);

  // Fetch Dashboard Data
  const loadDashboardData = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/dashboard/owner");
      if (res.status === 401) {
        router.push("/login?callbackUrl=/dashboard/owner");
        return;
      }
      if (res.status === 403) {
        router.push("/dashboard/borrower");
        return;
      }
      if (!res.ok) {
        throw new Error("Failed to load dashboard data");
      }
      const data = await res.json();
      setAnalytics(data.analytics);
      setResources(data.resources || []);
      setBookings(data.bookings || []);
      setTrustBadges(data.trustProfile?.badges || []);
    } catch (err: any) {
      toast.error(err.message || "Failed to load owner dashboard");
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    if (!authLoading) {
      if (!user) {
        router.push("/login?callbackUrl=/dashboard/owner");
      } else if (user.role === "borrower") {
        router.push("/dashboard/borrower");
      } else {
        loadDashboardData();
      }
    }
  }, [user, authLoading, router, loadDashboardData]);

  // Image Upload handler
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsUploading(true);
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Upload failed");
      }

      setNewImageUrl(data.url);
      toast.success("Image uploaded successfully!");
    } catch (err: any) {
      toast.error(err.message || "Image upload failed");
    } finally {
      setIsUploading(false);
    }
  };

  // Create Resource Submit
  const handleCreateResource = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newDescription.trim() || !newLocation.trim()) {
      toast.error("Please fill in all required fields.");
      return;
    }

    try {
      setIsSubmittingResource(true);
      const specsList = newSpecs
        .split("\n")
        .map((s) => s.trim())
        .filter(Boolean);

      const payload = {
        title: newTitle.trim(),
        category: newCategory,
        condition: newCondition,
        location: newLocation.trim(),
        description: newDescription.trim(),
        maxDuration: newMaxDuration.trim() || "7 days",
        deposit: Number(newDeposit) || 0,
        specs: specsList,
        images: newImageUrl ? [newImageUrl] : [],
      };

      const res = await fetch("/api/resources", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to create resource");
      }

      toast.success("Equipment listed successfully!");
      setIsCreateOpen(false);
      resetCreateForm();
      loadDashboardData();
    } catch (err: any) {
      toast.error(err.message || "Could not list resource");
    } finally {
      setIsSubmittingResource(false);
    }
  };

  const resetCreateForm = () => {
    setNewTitle("");
    setNewCategory(CATEGORIES[0]);
    setNewCondition(CONDITIONS[0]);
    setNewLocation("");
    setNewDescription("");
    setNewMaxDuration("7 days");
    setNewDeposit(50);
    setNewSpecs("");
    setNewImageUrl("");
  };

  // Toggle Resource Status (Active / Paused)
  const handleToggleStatus = async (resource: ResourceItem) => {
    const nextStatus = resource.status === "active" ? "paused" : "active";
    try {
      const res = await fetch(`/api/resources/${resource.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: nextStatus }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to update status");
      }

      toast.success(
        `Resource ${nextStatus === "active" ? "resumed" : "paused"} successfully.`
      );
      loadDashboardData();
    } catch (err: any) {
      toast.error(err.message || "Failed to update resource");
    }
  };

  // Open Edit Dialog
  const openEditDialog = (res: ResourceItem) => {
    setEditingResource({ ...res });
    setIsEditOpen(true);
  };

  // Save Edit
  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingResource) return;

    try {
      setIsSubmittingResource(true);
      const res = await fetch(`/api/resources/${editingResource.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: editingResource.title,
          category: editingResource.category,
          condition: editingResource.condition,
          location: editingResource.location,
          description: editingResource.description,
          maxDuration: editingResource.maxDuration,
          deposit: editingResource.deposit,
          specs: editingResource.specs,
          images: editingResource.images,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to update resource");
      }

      toast.success("Listing updated successfully!");
      setIsEditOpen(false);
      setEditingResource(null);
      loadDashboardData();
    } catch (err: any) {
      toast.error(err.message || "Update failed");
    } finally {
      setIsSubmittingResource(false);
    }
  };

  // Delete Resource
  const handleDeleteResource = async () => {
    if (!deletingResource) return;
    try {
      setIsDeleting(true);
      const res = await fetch(`/api/resources/${deletingResource.id}`, {
        method: "DELETE",
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to delete resource");
      }

      toast.success("Listing deleted successfully.");
      setIsDeleteOpen(false);
      setDeletingResource(null);
      loadDashboardData();
    } catch (err: any) {
      toast.error(err.message || "Deletion failed");
    } finally {
      setIsDeleting(false);
    }
  };

  // Booking Actions: Approve / Reject / Complete
  const handleBookingAction = async () => {
    if (!actionBooking || !actionType) return;
    try {
      setIsActionSubmitting(true);
      let res;
      if (actionType === "complete") {
        res = await fetch(`/api/bookings/${actionBooking.id}/complete`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
        });
      } else {
        res = await fetch(`/api/bookings/${actionBooking.id}/${actionType}`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
        });
      }

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || `Failed to ${actionType} booking`);
      }

      toast.success(
        actionType === "approve"
          ? "Booking reservation approved!"
          : actionType === "reject"
          ? "Booking reservation declined."
          : "Lending completed and returned! Review unlocked."
      );
      setActionBooking(null);
      setActionType(null);
      loadDashboardData();
    } catch (err: any) {
      toast.error(err.message || "Operation failed");
    } finally {
      setIsActionSubmitting(false);
    }
  };

  if (authLoading || (loading && !analytics)) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center">
        <Loader2 className="size-8 animate-spin text-muted-foreground" />
        <p className="mt-3 text-xs font-mono text-muted-foreground">Loading Owner Dashboard...</p>
      </div>
    );
  }

  // Filtered resources
  const filteredResources = resources.filter((r) => {
    const matchesSearch =
      r.title.toLowerCase().includes(resourceSearch.toLowerCase()) ||
      r.category.toLowerCase().includes(resourceSearch.toLowerCase()) ||
      r.location.toLowerCase().includes(resourceSearch.toLowerCase());
    const matchesStatus =
      resourceFilter === "all" ? true : r.status === resourceFilter;
    return matchesSearch && matchesStatus;
  });

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
                  Owner Portal
                </span>
                <span className="inline-flex items-center gap-1 text-xs text-emerald-500 font-mono font-medium">
                  <ShieldCheck className="size-3.5" />
                  Verified Lender
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
                Equipment Hub & Analytics
              </h1>
              <p className="text-sm text-muted-foreground mt-1">
                Manage inventory, approve borrow requests, track asset utilization, and build neighborhood trust.
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

              <button
                type="button"
                onClick={() => setIsCreateOpen(true)}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-foreground text-background text-xs font-medium hover:opacity-90 transition-opacity shadow-sm"
              >
                <PlusCircle className="size-4" />
                <span>List New Resource</span>
              </button>
            </div>
          </div>

          {/* Metric Stats Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-6 gap-3.5 my-8">
            <div className="p-4 rounded-xl border border-border bg-card">
              <span className="text-[11px] font-mono uppercase tracking-wider text-muted-foreground">
                Utilization Rate
              </span>
              <div className="mt-2 flex items-baseline gap-2">
                <span className="text-2xl font-bold font-mono tracking-tight">
                  {analytics?.utilizationPercentage || 0}%
                </span>
                <TrendingUp className="size-3.5 text-emerald-500" />
              </div>
              <span className="text-[10px] text-muted-foreground mt-1 block">
                Loans vs total demand
              </span>
            </div>

            <div className="p-4 rounded-xl border border-border bg-card">
              <span className="text-[11px] font-mono uppercase tracking-wider text-muted-foreground">
                Active Listings
              </span>
              <div className="mt-2 flex items-baseline gap-2">
                <span className="text-2xl font-bold font-mono tracking-tight">
                  {analytics?.activeListings || 0}
                </span>
                <span className="text-xs text-muted-foreground font-mono">
                  / {analytics?.totalResources || 0}
                </span>
              </div>
              <span className="text-[10px] text-muted-foreground mt-1 block">
                Visible to community
              </span>
            </div>

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
                Active & upcoming loans
              </span>
            </div>

            <div className="p-4 rounded-xl border border-border bg-card">
              <span className="text-[11px] font-mono uppercase tracking-wider text-muted-foreground">
                Completed Loans
              </span>
              <div className="mt-2 text-2xl font-bold font-mono tracking-tight">
                {analytics?.completedLendings || 0}
              </div>
              <span className="text-[10px] text-muted-foreground mt-1 block">
                Successfully returned
              </span>
            </div>

            <div className="p-4 rounded-xl border border-border bg-card">
              <span className="text-[11px] font-mono uppercase tracking-wider text-muted-foreground">
                Owner Rating
              </span>
              <div className="mt-2 flex items-center gap-1.5">
                <Star className="size-4 fill-amber-400 text-amber-400" />
                <span className="text-2xl font-bold font-mono tracking-tight">
                  {analytics?.averageRating ? analytics.averageRating.toFixed(1) : "5.0"}
                </span>
              </div>
              <span className="text-[10px] text-muted-foreground mt-1 block">
                {analytics?.reviewCount || 0} verified reviews
              </span>
            </div>
          </div>

          {/* Main Dashboard Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="bg-muted/60 p-1 border border-border rounded-xl">
              <TabsTrigger value="resources" className="gap-2 text-xs font-medium">
                <Package className="size-3.5" />
                <span>My Resources ({resources.length})</span>
              </TabsTrigger>
              <TabsTrigger value="requests" className="gap-2 text-xs font-medium">
                <Calendar className="size-3.5" />
                <span>Bookings & Requests ({bookings.length})</span>
              </TabsTrigger>
              <TabsTrigger value="analytics" className="gap-2 text-xs font-medium">
                <TrendingUp className="size-3.5" />
                <span>Utilization & Analytics</span>
              </TabsTrigger>
              <TabsTrigger value="trust" className="gap-2 text-xs font-medium">
                <ShieldCheck className="size-3.5" />
                <span>Reputation & Badges ({trustBadges.length})</span>
              </TabsTrigger>
            </TabsList>

            {/* TAB 1: MY RESOURCES */}
            <TabsContent value="resources" className="space-y-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="relative flex-1 max-w-sm">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground" />
                  <input
                    type="text"
                    placeholder="Search by title, category, neighborhood..."
                    value={resourceSearch}
                    onChange={(e) => setResourceSearch(e.target.value)}
                    className="w-full pl-9 pr-3 py-1.5 rounded-lg border border-border bg-card text-xs text-foreground placeholder:text-muted-foreground focus:outline-hidden focus:ring-1 focus:ring-foreground"
                  />
                </div>

                <div className="flex items-center gap-2">
                  <Filter className="size-3.5 text-muted-foreground" />
                  <select
                    value={resourceFilter}
                    onChange={(e) => setResourceFilter(e.target.value)}
                    className="px-3 py-1.5 rounded-lg border border-border bg-card text-xs text-foreground focus:outline-hidden"
                  >
                    <option value="all">All Statuses</option>
                    <option value="active">Active (Available)</option>
                    <option value="paused">Paused</option>
                  </select>
                </div>
              </div>

              {filteredResources.length === 0 ? (
                <div className="py-16 text-center rounded-xl border border-dashed border-border bg-card/50">
                  <Package className="size-10 mx-auto text-muted-foreground/60 mb-3" />
                  <h3 className="text-sm font-semibold text-foreground">No resources listed yet</h3>
                  <p className="text-xs text-muted-foreground max-w-sm mx-auto mt-1">
                    Start sharing equipment with your community. List cameras, power tools, tents, or electronics.
                  </p>
                  <button
                    type="button"
                    onClick={() => setIsCreateOpen(true)}
                    className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-foreground text-background text-xs font-medium hover:opacity-90"
                  >
                    <PlusCircle className="size-4" />
                    <span>Create Your First Listing</span>
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                  {filteredResources.map((res) => {
                    const isPaused = res.status === "paused";
                    return (
                      <div
                        key={res.id}
                        className={`rounded-xl border border-border bg-card overflow-hidden flex flex-col justify-between transition-all ${
                          isPaused ? "opacity-75 bg-muted/20" : "hover:border-foreground/30 shadow-xs"
                        }`}
                      >
                        <div>
                          {/* Image preview */}
                          <div className="relative aspect-[16/9] w-full bg-secondary overflow-hidden">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                              src={resolveResourceImage(res)}
                              alt={res.title}
                              className="size-full object-cover"
                            />
                            <div className="absolute top-2.5 left-2.5 right-2.5 flex items-center justify-between">
                              <span
                                className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-medium backdrop-blur-md ${
                                  !isPaused
                                    ? "bg-emerald-950/80 text-emerald-200 border border-emerald-500/30"
                                    : "bg-amber-950/80 text-amber-200 border border-amber-500/30"
                                }`}
                              >
                                <span
                                  className={`size-1.5 rounded-full ${
                                    !isPaused ? "bg-emerald-400" : "bg-amber-400"
                                  }`}
                                />
                                {res.status.toUpperCase()}
                              </span>
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-mono uppercase bg-black/60 text-white backdrop-blur-md">
                                {res.condition}
                              </span>
                            </div>
                          </div>

                          {/* Content */}
                          <div className="p-4">
                            <div className="flex items-center justify-between text-[11px] text-muted-foreground mb-1">
                              <span className="font-mono uppercase tracking-wider">{res.category}</span>
                              <span className="inline-flex items-center gap-1 truncate max-w-[120px]">
                                <MapPin className="size-3" />
                                <span className="truncate">{res.location}</span>
                              </span>
                            </div>

                            <h3 className="text-sm font-semibold text-foreground line-clamp-1">
                              {res.title}
                            </h3>

                            <p className="mt-1 text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                              {res.description}
                            </p>

                            <div className="mt-3 pt-3 border-t border-border flex items-center justify-between text-xs font-mono text-muted-foreground">
                              <span>Max: {res.maxDuration}</span>
                              <span>Deposit: ${res.deposit}</span>
                            </div>
                          </div>
                        </div>

                        {/* Actions Toolbar */}
                        <div className="p-3 bg-muted/30 border-t border-border flex items-center justify-between gap-1.5">
                          <Link
                            href={`/resources/${res.id}`}
                            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-md border border-border text-[11px] font-medium hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
                            title="View public page"
                          >
                            <ExternalLink className="size-3" />
                            <span>View</span>
                          </Link>

                          <div className="flex items-center gap-1">
                            <button
                              type="button"
                              onClick={() => handleToggleStatus(res)}
                              className="inline-flex items-center gap-1 px-2 py-1.5 rounded-md border border-border text-[11px] font-medium hover:bg-muted transition-colors"
                              title={isPaused ? "Resume Listing" : "Pause Listing"}
                            >
                              {isPaused ? (
                                <>
                                  <Play className="size-3 text-emerald-500" />
                                  <span>Resume</span>
                                </>
                              ) : (
                                <>
                                  <Pause className="size-3 text-amber-500" />
                                  <span>Pause</span>
                                </>
                              )}
                            </button>

                            <button
                              type="button"
                              onClick={() => openEditDialog(res)}
                              className="p-1.5 rounded-md border border-border text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                              title="Edit listing details"
                            >
                              <Edit3 className="size-3.5" />
                            </button>

                            <button
                              type="button"
                              onClick={() => {
                                setDeletingResource(res);
                                setIsDeleteOpen(true);
                              }}
                              className="p-1.5 rounded-md border border-border text-red-500 hover:bg-red-500/10 transition-colors"
                              title="Delete listing"
                            >
                              <Trash2 className="size-3.5" />
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </TabsContent>

            {/* TAB 2: BOOKINGS & REQUESTS */}
            <TabsContent value="requests" className="space-y-4">
              {bookings.length === 0 ? (
                <div className="py-16 text-center rounded-xl border border-dashed border-border bg-card/50">
                  <Calendar className="size-10 mx-auto text-muted-foreground/60 mb-3" />
                  <h3 className="text-sm font-semibold text-foreground">No bookings recorded yet</h3>
                  <p className="text-xs text-muted-foreground max-w-sm mx-auto mt-1">
                    When neighborhood borrowers request your equipment, their reservations and pickup preferences appear here.
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {bookings.map((b) => {
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
                              ID: {b.id}
                            </span>
                          </div>

                          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
                            <span>
                              <strong className="text-foreground">Borrower:</strong>{" "}
                              {b.borrowerName || b.borrowerEmail || b.borrowerId}
                            </span>
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

                        {/* Action buttons */}
                        <div className="flex items-center gap-2 self-end md:self-center shrink-0">
                          {isPending && (
                            <>
                              <button
                                type="button"
                                onClick={() => {
                                  setActionBooking(b);
                                  setActionType("approve");
                                }}
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 text-white text-xs font-medium hover:bg-emerald-700 transition-colors"
                              >
                                <Check className="size-3.5" />
                                <span>Approve</span>
                              </button>
                              <button
                                type="button"
                                onClick={() => {
                                  setActionBooking(b);
                                  setActionType("reject");
                                }}
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border text-xs font-medium hover:bg-muted text-red-500 transition-colors"
                              >
                                <XCircle className="size-3.5" />
                                <span>Decline</span>
                              </button>
                            </>
                          )}

                          {isApproved && (
                            <button
                              type="button"
                              onClick={() => {
                                setActionBooking(b);
                                setActionType("complete");
                              }}
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-600 text-white text-xs font-medium hover:bg-blue-700 transition-colors"
                            >
                              <CheckCircle2 className="size-3.5" />
                              <span>Complete Return</span>
                            </button>
                          )}

                          {isCompleted && (
                            <span className="inline-flex items-center gap-1 text-xs text-muted-foreground font-mono">
                              <CheckCircle2 className="size-3.5 text-blue-500" />
                              Returned & Finalized
                            </span>
                          )}

                          {isCancelled && (
                            <span className="text-xs text-muted-foreground font-mono">
                              Closed
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </TabsContent>

            {/* TAB 3: UTILIZATION & ANALYTICS */}
            <TabsContent value="analytics" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="p-5 rounded-xl border border-border bg-card space-y-4">
                  <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
                    <TrendingUp className="size-4 text-emerald-500" />
                    Demand & Conversion Funnel
                  </h3>
                  <div className="space-y-3">
                    <div>
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-muted-foreground">Approved Bookings</span>
                        <span className="font-mono font-medium">{analytics?.approvedBookings} of {analytics?.totalRequests} requests</span>
                      </div>
                      <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
                        <div
                          className="h-full bg-emerald-500 rounded-full"
                          style={{
                            width: `${
                              analytics?.totalRequests
                                ? Math.min(100, (analytics.approvedBookings / analytics.totalRequests) * 100)
                                : 0
                            }%`,
                          }}
                        />
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-muted-foreground">Successful Returns</span>
                        <span className="font-mono font-medium">{analytics?.completedLendings} completed</span>
                      </div>
                      <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
                        <div
                          className="h-full bg-blue-500 rounded-full"
                          style={{
                            width: `${
                              analytics?.approvedBookings
                                ? Math.min(100, (analytics.completedLendings / (analytics.approvedBookings + analytics.completedLendings || 1)) * 100)
                                : 0
                            }%`,
                          }}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="p-5 rounded-xl border border-border bg-card space-y-3">
                  <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
                    <Star className="size-4 text-amber-500" />
                    Top Requested Resources
                  </h3>
                  {analytics?.mostRequestedResources.length === 0 ? (
                    <p className="text-xs text-muted-foreground">No booking requests recorded yet.</p>
                  ) : (
                    <div className="divide-y divide-border/60">
                      {analytics?.mostRequestedResources.map((item) => (
                        <div key={item.id} className="py-2.5 flex items-center justify-between text-xs">
                          <div>
                            <span className="font-medium text-foreground block truncate max-w-[200px]">
                              {item.title}
                            </span>
                            <span className="text-[11px] font-mono text-muted-foreground">{item.category}</span>
                          </div>
                          <span className="font-mono px-2 py-0.5 rounded bg-muted text-foreground font-semibold">
                            {item.requestCount} borrows
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </TabsContent>

            {/* TAB 4: REPUTATION & BADGES */}
            <TabsContent value="trust" className="space-y-6">
              <div className="p-6 rounded-xl border border-border bg-card space-y-6">
                <div>
                  <h3 className="text-base font-semibold text-foreground flex items-center gap-2">
                    <ShieldCheck className="size-5 text-emerald-500" />
                    Community Trust & Credential Badges
                  </h3>
                  <p className="text-xs text-muted-foreground mt-1">
                    Badges are dynamically unlocked based on identity verification and real lending transactions recorded in the SQLite ledger.
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
              </div>
            </TabsContent>
          </Tabs>

        </div>
      </main>

      {/* CREATE RESOURCE DIALOG */}
      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-card border-border">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold">List New Resource</DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              Add a piece of equipment to the community catalog for safe neighborhood sharing.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleCreateResource} className="space-y-4 py-2">
            <div>
              <label className="text-xs font-medium text-foreground block mb-1">
                Equipment Title *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. DeWalt 20V MAX Cordless Drill Kit"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-border bg-background text-xs text-foreground focus:outline-hidden"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-medium text-foreground block mb-1">
                  Category *
                </label>
                <select
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-border bg-background text-xs text-foreground focus:outline-hidden"
                >
                  {CATEGORIES.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-medium text-foreground block mb-1">
                  Condition *
                </label>
                <select
                  value={newCondition}
                  onChange={(e) => setNewCondition(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-border bg-background text-xs text-foreground focus:outline-hidden"
                >
                  {CONDITIONS.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="text-xs font-medium text-foreground block mb-1">
                  Neighborhood / Location *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Downtown Central"
                  value={newLocation}
                  onChange={(e) => setNewLocation(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-border bg-background text-xs text-foreground focus:outline-hidden"
                />
              </div>

              <div>
                <label className="text-xs font-medium text-foreground block mb-1">
                  Max Borrow Duration
                </label>
                <input
                  type="text"
                  placeholder="e.g. 7 days"
                  value={newMaxDuration}
                  onChange={(e) => setNewMaxDuration(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-border bg-background text-xs text-foreground focus:outline-hidden"
                />
              </div>

              <div>
                <label className="text-xs font-medium text-foreground block mb-1">
                  Security Deposit ($)
                </label>
                <input
                  type="number"
                  min="0"
                  value={newDeposit}
                  onChange={(e) => setNewDeposit(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-lg border border-border bg-background text-xs text-foreground focus:outline-hidden"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-medium text-foreground block mb-1">
                Description & Usage Guidelines *
              </label>
              <textarea
                required
                rows={3}
                placeholder="Describe what is included, state of blades/batteries, handling instructions..."
                value={newDescription}
                onChange={(e) => setNewDescription(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-border bg-background text-xs text-foreground focus:outline-hidden"
              />
            </div>

            <div>
              <label className="text-xs font-medium text-foreground block mb-1">
                Specifications (one per line)
              </label>
              <textarea
                rows={2}
                placeholder="2x 20V 2.0Ah Batteries&#10;Hard carrying case&#10;Includes 14 drill bits"
                value={newSpecs}
                onChange={(e) => setNewSpecs(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-border bg-background text-xs text-foreground focus:outline-hidden"
              />
            </div>

            {/* Photo Upload */}
            <div>
              <label className="text-xs font-medium text-foreground block mb-1">
                Equipment Photo (JPEG, PNG, WebP &le; 5MB)
              </label>
              <div className="flex items-center gap-3">
                <label className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-border bg-secondary hover:bg-muted cursor-pointer text-xs font-medium transition-colors">
                  <Upload className="size-3.5" />
                  <span>{isUploading ? "Uploading..." : "Upload Photo"}</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    disabled={isUploading}
                    className="hidden"
                  />
                </label>
                {newImageUrl && (
                  <span className="text-xs text-emerald-500 font-mono truncate max-w-xs">
                    Uploaded: {newImageUrl}
                  </span>
                )}
              </div>
            </div>

            <DialogFooter className="pt-2">
              <button
                type="button"
                onClick={() => setIsCreateOpen(false)}
                className="px-4 py-2 rounded-lg border border-border text-xs font-medium hover:bg-muted"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmittingResource || isUploading}
                className="px-4 py-2 rounded-lg bg-foreground text-background text-xs font-medium hover:opacity-90 disabled:opacity-50 inline-flex items-center gap-1.5"
              >
                {isSubmittingResource ? (
                  <>
                    <Loader2 className="size-3.5 animate-spin" />
                    <span>Listing...</span>
                  </>
                ) : (
                  <span>Publish Listing</span>
                )}
              </button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* EDIT RESOURCE DIALOG */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-card border-border">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold">Edit Listing Details</DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              Update details, availability conditions, or specifications.
            </DialogDescription>
          </DialogHeader>

          {editingResource && (
            <form onSubmit={handleSaveEdit} className="space-y-4 py-2">
              <div>
                <label className="text-xs font-medium text-foreground block mb-1">
                  Equipment Title
                </label>
                <input
                  type="text"
                  required
                  value={editingResource.title}
                  onChange={(e) =>
                    setEditingResource({ ...editingResource, title: e.target.value })
                  }
                  className="w-full px-3 py-2 rounded-lg border border-border bg-background text-xs text-foreground focus:outline-hidden"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-foreground block mb-1">
                    Category
                  </label>
                  <select
                    value={editingResource.category}
                    onChange={(e) =>
                      setEditingResource({ ...editingResource, category: e.target.value })
                    }
                    className="w-full px-3 py-2 rounded-lg border border-border bg-background text-xs text-foreground focus:outline-hidden"
                  >
                    {CATEGORIES.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-xs font-medium text-foreground block mb-1">
                    Condition
                  </label>
                  <select
                    value={editingResource.condition}
                    onChange={(e) =>
                      setEditingResource({ ...editingResource, condition: e.target.value })
                    }
                    className="w-full px-3 py-2 rounded-lg border border-border bg-background text-xs text-foreground focus:outline-hidden"
                  >
                    {CONDITIONS.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="text-xs font-medium text-foreground block mb-1">
                    Location
                  </label>
                  <input
                    type="text"
                    required
                    value={editingResource.location}
                    onChange={(e) =>
                      setEditingResource({ ...editingResource, location: e.target.value })
                    }
                    className="w-full px-3 py-2 rounded-lg border border-border bg-background text-xs text-foreground focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="text-xs font-medium text-foreground block mb-1">
                    Max Duration
                  </label>
                  <input
                    type="text"
                    value={editingResource.maxDuration}
                    onChange={(e) =>
                      setEditingResource({ ...editingResource, maxDuration: e.target.value })
                    }
                    className="w-full px-3 py-2 rounded-lg border border-border bg-background text-xs text-foreground focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="text-xs font-medium text-foreground block mb-1">
                    Deposit ($)
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={editingResource.deposit}
                    onChange={(e) =>
                      setEditingResource({ ...editingResource, deposit: Number(e.target.value) })
                    }
                    className="w-full px-3 py-2 rounded-lg border border-border bg-background text-xs text-foreground focus:outline-hidden"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-medium text-foreground block mb-1">
                  Description
                </label>
                <textarea
                  rows={3}
                  value={editingResource.description}
                  onChange={(e) =>
                    setEditingResource({ ...editingResource, description: e.target.value })
                  }
                  className="w-full px-3 py-2 rounded-lg border border-border bg-background text-xs text-foreground focus:outline-hidden"
                />
              </div>

              <DialogFooter className="pt-2">
                <button
                  type="button"
                  onClick={() => setIsEditOpen(false)}
                  className="px-4 py-2 rounded-lg border border-border text-xs font-medium hover:bg-muted"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingResource}
                  className="px-4 py-2 rounded-lg bg-foreground text-background text-xs font-medium hover:opacity-90 disabled:opacity-50 inline-flex items-center gap-1.5"
                >
                  {isSubmittingResource ? (
                    <>
                      <Loader2 className="size-3.5 animate-spin" />
                      <span>Saving...</span>
                    </>
                  ) : (
                    <span>Save Changes</span>
                  )}
                </button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>

      {/* DELETE RESOURCE CONFIRMATION */}
      <Dialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <DialogContent className="max-w-md bg-card border-border">
          <DialogHeader>
            <DialogTitle className="text-base font-bold text-red-600 flex items-center gap-2">
              <AlertCircle className="size-4" />
              Delete Resource Listing
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              Are you sure you want to remove &quot;{deletingResource?.title}&quot;?
              If active approved bookings exist, deletion will be safely rejected by database integrity checks.
            </DialogDescription>
          </DialogHeader>

          <DialogFooter className="gap-2 sm:gap-0">
            <button
              type="button"
              onClick={() => setIsDeleteOpen(false)}
              className="px-4 py-2 rounded-lg border border-border text-xs font-medium hover:bg-muted"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleDeleteResource}
              disabled={isDeleting}
              className="px-4 py-2 rounded-lg bg-red-600 text-white text-xs font-medium hover:bg-red-700 disabled:opacity-50 inline-flex items-center gap-1.5"
            >
              {isDeleting ? (
                <>
                  <Loader2 className="size-3.5 animate-spin" />
                  <span>Deleting...</span>
                </>
              ) : (
                <span>Confirm Deletion</span>
              )}
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* BOOKING ACTION CONFIRMATION (APPROVE / REJECT / COMPLETE) */}
      <Dialog open={!!actionBooking} onOpenChange={() => setActionBooking(null)}>
        <DialogContent className="max-w-md bg-card border-border">
          <DialogHeader>
            <DialogTitle className="text-base font-bold capitalize">
              {actionType === "approve"
                ? "Approve Borrow Request"
                : actionType === "reject"
                ? "Decline Request"
                : "Complete Equipment Loan"}
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              {actionType === "approve" &&
                "Approving this request confirms the borrowing dates. The borrower will receive an automated notification."}
              {actionType === "reject" &&
                "Declining will cancel this request and release the schedule for other community members."}
              {actionType === "complete" &&
                "Confirm that the equipment has been safely inspected and returned. This will unlock peer community reviews!"}
            </DialogDescription>
          </DialogHeader>

          <DialogFooter className="gap-2 sm:gap-0">
            <button
              type="button"
              onClick={() => setActionBooking(null)}
              className="px-4 py-2 rounded-lg border border-border text-xs font-medium hover:bg-muted"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleBookingAction}
              disabled={isActionSubmitting}
              className={`px-4 py-2 rounded-lg text-xs font-medium text-white disabled:opacity-50 inline-flex items-center gap-1.5 ${
                actionType === "reject"
                  ? "bg-red-600 hover:bg-red-700"
                  : actionType === "approve"
                  ? "bg-emerald-600 hover:bg-emerald-700"
                  : "bg-blue-600 hover:bg-blue-700"
              }`}
            >
              {isActionSubmitting ? (
                <Loader2 className="size-3.5 animate-spin" />
              ) : (
                <span className="capitalize">Confirm {actionType}</span>
              )}
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <FooterSection />
    </div>
  );
}
