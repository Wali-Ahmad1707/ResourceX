"use client";

import React, { useState, useEffect, useCallback, use } from "react";
import Image from "next/image";
import { resolveResourceImage } from "@/lib/image-mapping";
import {
  Package,
  Search,
  Filter,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  RotateCcw,
  Eye,
  Loader2,
  RefreshCw,
  ExternalLink,
  ShieldCheck,
  Tag
} from "lucide-react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";

interface AdminResource {
  id: string;
  ownerId: string;
  ownerName?: string;
  title: string;
  tagline?: string;
  description: string;
  longDescription?: string;
  category: string;
  images: string[];
  condition: string;
  location: string;
  deposit: string;
  maxDuration: string;
  borrowingTerms?: string;
  availabilityStatus: string;
  status: string;
  moderationStatus?: "pending" | "approved" | "rejected" | "suspended" | "removed";
  moderationReason?: string;
  moderatedBy?: string;
  moderatedAt?: string;
  createdAt: string;
}

export default function AdminResourcesPage({
  searchParams,
}: {
  searchParams?: Promise<{ moderationStatus?: string }>;
}) {
  const unwrappedParams = searchParams ? use(searchParams) : undefined;
  const initialStatus = unwrappedParams?.moderationStatus || "all";

  const [resources, setResources] = useState<AdminResource[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [moderationFilter, setModerationFilter] = useState(initialStatus);
  const [categoryFilter, setCategoryFilter] = useState("all");

  // Inspection Modal
  const [selectedResource, setSelectedResource] = useState<AdminResource | null>(null);

  // Rejection Dialog
  const [rejectingResource, setRejectingResource] = useState<AdminResource | null>(null);
  const [rejectionReason, setRejectionReason] = useState("");
  const [actionLoading, setActionLoading] = useState(false);

  const fetchResources = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (moderationFilter !== "all") params.append("moderationStatus", moderationFilter);
      if (categoryFilter !== "all") params.append("category", categoryFilter);
      if (searchTerm.trim()) params.append("search", searchTerm.trim());

      const res = await fetch(`/api/admin/resources?${params.toString()}`);
      const data = await res.json();
      if (data.success && data.resources) {
        setResources(data.resources);
      } else {
        toast.error(data.error || "Failed to fetch resources");
      }
    } catch {
      toast.error("Failed to connect to resources service");
    } finally {
      setLoading(false);
    }
  }, [moderationFilter, categoryFilter, searchTerm]);

  useEffect(() => {
    fetchResources();
  }, [fetchResources]);

  const handleModerate = async (
    resourceId: string,
    action: "approve" | "reject" | "suspend" | "restore",
    reason?: string
  ) => {
    try {
      setActionLoading(true);
      const res = await fetch(`/api/admin/resources/${resourceId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, reason }),
      });

      const data = await res.json();
      if (data.success) {
        toast.success(data.message || `Resource successfully ${action}d`);
        setRejectingResource(null);
        setRejectionReason("");
        fetchResources();
        if (selectedResource?.id === resourceId) {
          setSelectedResource(data.resource);
        }
      } else {
        toast.error(data.error || `Failed to ${action} resource`);
      }
    } catch {
      toast.error("Error communicating with moderation service");
    } finally {
      setActionLoading(false);
    }
  };

  const handleConfirmReject = () => {
    if (!rejectingResource) return;
    if (!rejectionReason.trim()) {
      toast.error("Please provide a mandatory reason for rejecting this listing.");
      return;
    }
    handleModerate(rejectingResource.id, "reject", rejectionReason.trim());
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Resource Moderation</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Audit, verify safety terms, and approve or restrict community equipment listings.
          </p>
        </div>
        <button
          type="button"
          onClick={fetchResources}
          disabled={loading}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-medium border border-border bg-card hover:bg-muted transition-colors cursor-pointer self-start sm:self-auto"
        >
          <RefreshCw className={`size-3.5 ${loading ? "animate-spin" : ""}`} />
          <span>Refresh</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 rounded-2xl bg-card border border-border shadow-xs flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search listings by title, description, or owner..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs rounded-xl bg-muted/40 border border-border text-foreground placeholder:text-muted-foreground focus:outline-hidden focus:ring-1 focus:ring-foreground"
          />
        </div>

        <div className="flex items-center gap-2">
          {/* Moderation Status Filter */}
          <select
            value={moderationFilter}
            onChange={(e) => setModerationFilter(e.target.value)}
            className="px-3 py-2 text-xs rounded-xl bg-muted/40 border border-border text-foreground focus:outline-hidden focus:ring-1 focus:ring-foreground"
          >
            <option value="all">All Moderation Statuses</option>
            <option value="pending">Pending Review</option>
            <option value="approved">Approved / Live</option>
            <option value="rejected">Rejected</option>
            <option value="suspended">Suspended</option>
          </select>

          {/* Category Filter */}
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-3 py-2 text-xs rounded-xl bg-muted/40 border border-border text-foreground focus:outline-hidden focus:ring-1 focus:ring-foreground"
          >
            <option value="all">All Categories</option>
            <option value="Tools & Equipment">Tools & Equipment</option>
            <option value="Outdoor & Camping">Outdoor & Camping</option>
            <option value="Electronics">Electronics</option>
            <option value="Sports & Fitness">Sports & Fitness</option>
            <option value="Photography">Photography</option>
            <option value="Books & Education">Books & Education</option>
          </select>
        </div>
      </div>

      {/* Resources Table */}
      <div className="rounded-2xl bg-card border border-border shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-muted/50 text-muted-foreground font-mono uppercase text-[10px] border-b border-border">
              <tr>
                <th className="py-3 px-4">Resource</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4">Owner</th>
                <th className="py-3 px-4">Moderation</th>
                <th className="py-3 px-4">Deposit / Dur</th>
                <th className="py-3 px-4 text-right">Review Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60">
              {loading && resources.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-muted-foreground font-mono">
                    <Loader2 className="size-6 animate-spin mx-auto mb-2 text-muted-foreground" />
                    Loading catalog listings...
                  </td>
                </tr>
              ) : resources.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-muted-foreground font-mono">
                    No resources matching moderation criteria found.
                  </td>
                </tr>
              ) : (
                resources.map((r) => {
                  const modStatus = r.moderationStatus || "approved";
                  return (
                    <tr key={r.id} className="hover:bg-muted/30 transition-colors">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <div className="relative size-10 rounded-lg overflow-hidden bg-muted shrink-0 border border-border">
                            <Image
                              src={resolveResourceImage(r)}
                              alt={r.title}
                              fill
                              className="object-cover"
                              sizes="40px"
                            />
                          </div>
                          <div className="min-w-0 max-w-[220px]">
                            <div className="font-semibold text-foreground truncate">{r.title}</div>
                            <div className="text-[10px] text-muted-foreground font-mono truncate">
                              ID: {r.id} • {r.condition}
                            </div>
                          </div>
                        </div>
                      </td>

                      <td className="py-3 px-4">
                        <span className="font-mono text-[11px] text-foreground">{r.category}</span>
                      </td>

                      <td className="py-3 px-4">
                        <div className="space-y-0.5">
                          <span className="font-medium text-foreground truncate max-w-[120px] block">
                            {r.ownerName || "Owner"}
                          </span>
                          <span className="font-mono text-[10px] text-muted-foreground">{r.location}</span>
                        </div>
                      </td>

                      <td className="py-3 px-4">
                        <div className="space-y-1">
                          <span
                            className={`inline-flex items-center gap-1 font-mono text-[10px] uppercase font-bold px-2 py-0.5 rounded-full border ${
                              modStatus === "approved"
                                ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20"
                                : modStatus === "pending"
                                ? "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20"
                                : modStatus === "rejected"
                                ? "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20"
                                : "bg-muted text-muted-foreground border-border"
                            }`}
                          >
                            <span
                              className={`size-1.5 rounded-full ${
                                modStatus === "approved"
                                  ? "bg-emerald-500"
                                  : modStatus === "pending"
                                  ? "bg-amber-500"
                                  : "bg-rose-500"
                              }`}
                            />
                            {modStatus}
                          </span>
                          {modStatus === "rejected" && r.moderationReason && (
                            <p className="text-[10px] text-rose-600 dark:text-rose-400 truncate max-w-[130px]" title={r.moderationReason}>
                              {r.moderationReason}
                            </p>
                          )}
                        </div>
                      </td>

                      <td className="py-3 px-4 font-mono text-[11px] text-muted-foreground">
                        <div>{r.deposit}</div>
                        <div className="text-[10px]">{r.maxDuration}</div>
                      </td>

                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            type="button"
                            onClick={() => setSelectedResource(r)}
                            title="Inspect details"
                            className="p-1.5 rounded-lg border border-border bg-card hover:bg-muted text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                          >
                            <Eye className="size-3.5" />
                          </button>

                          {modStatus !== "approved" && (
                            <button
                              type="button"
                              onClick={() => handleModerate(r.id, "approve")}
                              title="Approve Listing"
                              className="p-1.5 rounded-lg border border-emerald-500/20 bg-emerald-500/5 hover:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 transition-colors cursor-pointer"
                            >
                              <CheckCircle2 className="size-3.5" />
                            </button>
                          )}

                          {modStatus !== "rejected" && (
                            <button
                              type="button"
                              onClick={() => {
                                setRejectingResource(r);
                                setRejectionReason("");
                              }}
                              title="Reject with Reason"
                              className="p-1.5 rounded-lg border border-rose-500/20 bg-rose-500/5 hover:bg-rose-500/10 text-rose-600 dark:text-rose-400 transition-colors cursor-pointer"
                            >
                              <XCircle className="size-3.5" />
                            </button>
                          )}

                          {modStatus === "approved" ? (
                            <button
                              type="button"
                              onClick={() => handleModerate(r.id, "suspend", "Suspended by platform administrator")}
                              title="Suspend Listing"
                              className="p-1.5 rounded-lg border border-amber-500/20 bg-amber-500/5 hover:bg-amber-500/10 text-amber-600 dark:text-amber-400 transition-colors cursor-pointer"
                            >
                              <AlertTriangle className="size-3.5" />
                            </button>
                          ) : modStatus === "suspended" ? (
                            <button
                              type="button"
                              onClick={() => handleModerate(r.id, "restore")}
                              title="Restore Listing"
                              className="p-1.5 rounded-lg border border-border bg-card hover:bg-muted text-foreground transition-colors cursor-pointer"
                            >
                              <RotateCcw className="size-3.5" />
                            </button>
                          ) : null}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Resource Inspection Dialog */}
      <Dialog open={!!selectedResource} onOpenChange={(open) => !open && setSelectedResource(null)}>
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-base font-bold text-foreground">
              <Package className="size-4" />
              <span>Listing Moderation Preview</span>
            </DialogTitle>
            <DialogDescription className="text-xs font-mono">
              ID: {selectedResource?.id}
            </DialogDescription>
          </DialogHeader>

          {selectedResource && (
            <div className="space-y-4 pt-2 text-xs">
              <div className="relative w-full h-48 rounded-xl overflow-hidden bg-muted border border-border">
                <Image
                  src={resolveResourceImage(selectedResource)}
                  alt={selectedResource.title}
                  fill
                  className="object-cover"
                />
              </div>

              <div>
                <h3 className="text-base font-bold text-foreground">{selectedResource.title}</h3>
                <p className="text-muted-foreground text-xs">{selectedResource.tagline || selectedResource.description}</p>
              </div>

              <div className="p-3 rounded-xl bg-muted/30 border border-border grid grid-cols-2 sm:grid-cols-4 gap-3 text-[11px]">
                <div>
                  <span className="text-muted-foreground font-mono text-[10px] uppercase">Category</span>
                  <div className="font-semibold text-foreground">{selectedResource.category}</div>
                </div>
                <div>
                  <span className="text-muted-foreground font-mono text-[10px] uppercase">Condition</span>
                  <div className="font-semibold text-foreground">{selectedResource.condition}</div>
                </div>
                <div>
                  <span className="text-muted-foreground font-mono text-[10px] uppercase">Deposit</span>
                  <div className="font-semibold text-foreground">{selectedResource.deposit}</div>
                </div>
                <div>
                  <span className="text-muted-foreground font-mono text-[10px] uppercase">Max Loan</span>
                  <div className="font-semibold text-foreground">{selectedResource.maxDuration}</div>
                </div>
              </div>

              <div className="space-y-1">
                <span className="font-semibold text-foreground">Terms & Borrowing Rules:</span>
                <p className="p-3 rounded-xl bg-muted/20 border border-border text-muted-foreground leading-relaxed">
                  {selectedResource.borrowingTerms || "Standard community loan terms apply."}
                </p>
              </div>

              {selectedResource.moderationReason && (
                <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400">
                  <div className="font-bold mb-1">Rejection Reason:</div>
                  <p>{selectedResource.moderationReason}</p>
                </div>
              )}
            </div>
          )}

          <DialogFooter className="pt-3 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => setSelectedResource(null)}
              className="px-4 py-2 rounded-xl text-xs font-medium border border-border bg-card hover:bg-muted text-foreground transition-colors"
            >
              Close
            </button>
            {selectedResource?.moderationStatus !== "approved" && (
              <button
                type="button"
                onClick={() => handleModerate(selectedResource!.id, "approve")}
                disabled={actionLoading}
                className="px-4 py-2 rounded-xl text-xs font-medium bg-emerald-600 text-white hover:bg-emerald-700 transition-colors"
              >
                Approve Listing
              </button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Mandatory Rejection Dialog */}
      <Dialog open={!!rejectingResource} onOpenChange={(open) => !open && setRejectingResource(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-base font-bold text-rose-600 dark:text-rose-400">
              <XCircle className="size-4" />
              <span>Reject Resource Listing</span>
            </DialogTitle>
            <DialogDescription className="text-xs">
              A clear reason is required so the lender understands what safety or description guidelines to correct.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3 pt-2 text-xs">
            <div className="p-3 rounded-xl bg-muted/40 border border-border">
              <div className="font-semibold text-foreground">{rejectingResource?.title}</div>
              <div className="text-muted-foreground text-[11px] font-mono">ID: {rejectingResource?.id}</div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-foreground mb-1">
                Mandatory Rejection Reason:
              </label>
              <textarea
                rows={3}
                placeholder="E.g. Incomplete safety instructions, hazardous equipment prohibited, unclear photos..."
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                className="w-full p-2.5 text-xs rounded-xl bg-muted/30 border border-border text-foreground focus:outline-hidden focus:ring-1 focus:ring-foreground"
              />
            </div>
          </div>

          <DialogFooter className="pt-3">
            <button
              type="button"
              onClick={() => setRejectingResource(null)}
              disabled={actionLoading}
              className="px-4 py-2 rounded-xl text-xs font-medium border border-border bg-card hover:bg-muted text-foreground transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleConfirmReject}
              disabled={actionLoading || !rejectionReason.trim()}
              className="px-4 py-2 rounded-xl text-xs font-medium bg-rose-600 text-white hover:bg-rose-700 transition-colors disabled:opacity-50 cursor-pointer"
            >
              {actionLoading ? "Rejecting..." : "Confirm Rejection"}
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
