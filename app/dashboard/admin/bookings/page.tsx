"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  CalendarCheck,
  Search,
  Filter,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Eye,
  Loader2,
  RefreshCw,
  Scale,
  MessageSquare,
  FileText,
  User,
  ShieldCheck,
  Clock
} from "lucide-react";
import { toast } from "sonner";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
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
  resourceTitle?: string;
  borrowerId: string;
  borrowerName?: string;
  borrowerEmail?: string;
  ownerId: string;
  ownerName?: string;
  ownerEmail?: string;
  startDate: string;
  endDate: string;
  purpose: string;
  status: "pending" | "approved" | "rejected" | "cancelled" | "completed";
  createdAt: string;
}

interface DisputeItem {
  id: string;
  bookingId: string;
  bookingResourceId?: string;
  resourceTitle?: string;
  initiatorId: string;
  initiatorName?: string;
  initiatorEmail?: string;
  respondentId: string;
  respondentName?: string;
  respondentEmail?: string;
  reason: string;
  description: string;
  evidence?: string | null;
  status: "open" | "under_review" | "resolved" | "rejected" | "closed";
  assignedAdminId?: string | null;
  assignedAdminName?: string | null;
  adminNotes?: string | null;
  resolution?: string | null;
  actionTaken?: string | null;
  resolvedAt?: string | null;
  createdAt: string;
  updatedAt: string;
}

export default function AdminBookingsPage() {
  const [activeTab, setActiveTab] = useState("disputes");
  const [bookings, setBookings] = useState<BookingItem[]>([]);
  const [disputes, setDisputes] = useState<DisputeItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  // Dispute Resolution Modal
  const [selectedDispute, setSelectedDispute] = useState<DisputeItem | null>(null);
  const [modalStatus, setModalStatus] = useState<DisputeItem["status"]>("under_review");
  const [modalAdminNotes, setModalAdminNotes] = useState("");
  const [modalResolution, setModalResolution] = useState("");
  const [modalActionTaken, setModalActionTaken] = useState("");
  const [savingDispute, setSavingDispute] = useState(false);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      if (activeTab === "disputes") {
        const params = new URLSearchParams();
        if (statusFilter !== "all") params.append("status", statusFilter);
        const res = await fetch(`/api/admin/disputes?${params.toString()}`);
        const data = await res.json();
        if (data.success && data.disputes) {
          setDisputes(data.disputes);
        }
      } else {
        const params = new URLSearchParams();
        if (statusFilter !== "all") params.append("status", statusFilter);
        if (searchTerm.trim()) params.append("search", searchTerm.trim());
        const res = await fetch(`/api/admin/bookings?${params.toString()}`);
        const data = await res.json();
        if (data.success && data.bookings) {
          setBookings(data.bookings);
        }
      }
    } catch {
      toast.error("Failed to load records");
    } finally {
      setLoading(false);
    }
  }, [activeTab, statusFilter, searchTerm]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const openDisputeModal = (d: DisputeItem) => {
    setSelectedDispute(d);
    setModalStatus(d.status);
    setModalAdminNotes(d.adminNotes || "");
    setModalResolution(d.resolution || "");
    setModalActionTaken(d.actionTaken || "");
  };

  const handleSaveDispute = async () => {
    if (!selectedDispute) return;
    try {
      setSavingDispute(true);
      const res = await fetch(`/api/admin/disputes/${selectedDispute.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: modalStatus,
          adminNotes: modalAdminNotes.trim(),
          resolution: modalResolution.trim(),
          actionTaken: modalActionTaken.trim(),
        }),
      });

      const data = await res.json();
      if (data.success) {
        toast.success("Dispute case updated successfully.");
        setSelectedDispute(null);
        fetchData();
      } else {
        toast.error(data.error || "Failed to update dispute");
      }
    } catch {
      toast.error("Error communicating with dispute service");
    } finally {
      setSavingDispute(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Bookings & Dispute Resolution</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Oversee equipment borrowing transactions and mediate community conflicts.
          </p>
        </div>
        <button
          type="button"
          onClick={fetchData}
          disabled={loading}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-medium border border-border bg-card hover:bg-muted transition-colors cursor-pointer self-start sm:self-auto"
        >
          <RefreshCw className={`size-3.5 ${loading ? "animate-spin" : ""}`} />
          <span>Refresh</span>
        </button>
      </div>

      {/* Main Tabs */}
      <Tabs value={activeTab} onValueChange={(val) => { setActiveTab(val); setStatusFilter("all"); }}>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <TabsList className="bg-muted/50 p-1 rounded-xl">
            <TabsTrigger value="disputes" className="rounded-lg text-xs font-medium gap-2">
              <Scale className="size-3.5" />
              <span>Dispute Cases</span>
            </TabsTrigger>
            <TabsTrigger value="bookings" className="rounded-lg text-xs font-medium gap-2">
              <CalendarCheck className="size-3.5" />
              <span>All Platform Bookings</span>
            </TabsTrigger>
          </TabsList>

          {/* Status Filter */}
          <div className="flex items-center gap-2">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-1.5 text-xs rounded-xl bg-muted/40 border border-border text-foreground focus:outline-hidden focus:ring-1 focus:ring-foreground"
            >
              <option value="all">All Statuses</option>
              {activeTab === "disputes" ? (
                <>
                  <option value="open">Open</option>
                  <option value="under_review">Under Review</option>
                  <option value="resolved">Resolved</option>
                  <option value="rejected">Rejected</option>
                  <option value="closed">Closed</option>
                </>
              ) : (
                <>
                  <option value="pending">Pending</option>
                  <option value="approved">Approved</option>
                  <option value="completed">Completed</option>
                  <option value="cancelled">Cancelled</option>
                  <option value="rejected">Rejected</option>
                </>
              )}
            </select>
          </div>
        </div>

        {/* Disputes Content */}
        <TabsContent value="disputes" className="mt-4">
          <div className="rounded-2xl bg-card border border-border shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-muted/50 text-muted-foreground font-mono uppercase text-[10px] border-b border-border">
                  <tr>
                    <th className="py-3 px-4">Case ID</th>
                    <th className="py-3 px-4">Resource & Booking</th>
                    <th className="py-3 px-4">Parties Involved</th>
                    <th className="py-3 px-4">Reason</th>
                    <th className="py-3 px-4">Case Status</th>
                    <th className="py-3 px-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/60">
                  {loading && disputes.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-12 text-center text-muted-foreground font-mono">
                        <Loader2 className="size-6 animate-spin mx-auto mb-2 text-muted-foreground" />
                        Loading dispute records...
                      </td>
                    </tr>
                  ) : disputes.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-12 text-center text-muted-foreground font-mono">
                        No disputes matching criteria.
                      </td>
                    </tr>
                  ) : (
                    disputes.map((d) => (
                      <tr key={d.id} className="hover:bg-muted/30 transition-colors">
                        <td className="py-3 px-4 font-mono font-bold text-foreground">
                          {d.id.slice(0, 10)}
                        </td>
                        <td className="py-3 px-4">
                          <div className="font-semibold text-foreground truncate max-w-[200px]">
                            {d.resourceTitle || "Resource"}
                          </div>
                          <div className="text-[10px] font-mono text-muted-foreground">
                            Booking: #{d.bookingId.slice(0, 8)}
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <div className="space-y-0.5 text-[11px]">
                            <div>
                              <span className="text-muted-foreground">By: </span>
                              <span className="font-medium text-foreground">{d.initiatorName || d.initiatorId}</span>
                            </div>
                            <div>
                              <span className="text-muted-foreground">Against: </span>
                              <span className="font-medium text-foreground">{d.respondentName || d.respondentId}</span>
                            </div>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <div className="font-medium text-foreground max-w-[200px] truncate">{d.reason}</div>
                          <div className="text-[11px] text-muted-foreground line-clamp-1 max-w-[220px]">
                            {d.description}
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <span
                            className={`inline-flex items-center gap-1 font-mono text-[10px] uppercase font-bold px-2 py-0.5 rounded-full border ${
                              d.status === "open"
                                ? "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20"
                                : d.status === "under_review"
                                ? "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20"
                                : d.status === "resolved"
                                ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20"
                                : "bg-muted text-muted-foreground border-border"
                            }`}
                          >
                            {d.status.replace("_", " ")}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-right">
                          <button
                            type="button"
                            onClick={() => openDisputeModal(d)}
                            className="px-3 py-1.5 rounded-lg border border-border bg-card hover:bg-muted text-xs font-medium text-foreground transition-colors cursor-pointer"
                          >
                            Manage
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </TabsContent>

        {/* Bookings Content */}
        <TabsContent value="bookings" className="mt-4">
          <div className="rounded-2xl bg-card border border-border shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-muted/50 text-muted-foreground font-mono uppercase text-[10px] border-b border-border">
                  <tr>
                    <th className="py-3 px-4">Booking ID</th>
                    <th className="py-3 px-4">Resource</th>
                    <th className="py-3 px-4">Borrower</th>
                    <th className="py-3 px-4">Owner</th>
                    <th className="py-3 px-4">Dates</th>
                    <th className="py-3 px-4">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/60">
                  {loading && bookings.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-12 text-center text-muted-foreground font-mono">
                        <Loader2 className="size-6 animate-spin mx-auto mb-2 text-muted-foreground" />
                        Loading bookings...
                      </td>
                    </tr>
                  ) : bookings.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-12 text-center text-muted-foreground font-mono">
                        No bookings found.
                      </td>
                    </tr>
                  ) : (
                    bookings.map((b) => (
                      <tr key={b.id} className="hover:bg-muted/30 transition-colors">
                        <td className="py-3 px-4 font-mono font-bold text-foreground">
                          {b.id.slice(0, 10)}
                        </td>
                        <td className="py-3 px-4">
                          <span className="font-semibold text-foreground">{b.resourceTitle || b.resourceId}</span>
                        </td>
                        <td className="py-3 px-4">
                          <div className="font-medium text-foreground">{b.borrowerName || "Borrower"}</div>
                          <div className="text-[10px] text-muted-foreground font-mono">{b.borrowerEmail}</div>
                        </td>
                        <td className="py-3 px-4">
                          <div className="font-medium text-foreground">{b.ownerName || "Owner"}</div>
                          <div className="text-[10px] text-muted-foreground font-mono">{b.ownerEmail}</div>
                        </td>
                        <td className="py-3 px-4 font-mono text-[11px] text-muted-foreground">
                          {b.startDate} to {b.endDate}
                        </td>
                        <td className="py-3 px-4">
                          <span
                            className={`font-mono text-[10px] uppercase font-bold px-2 py-0.5 rounded-full border ${
                              b.status === "approved"
                                ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20"
                                : b.status === "completed"
                                ? "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20"
                                : b.status === "pending"
                                ? "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20"
                                : "bg-muted text-muted-foreground border-border"
                            }`}
                          >
                            {b.status}
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </TabsContent>
      </Tabs>

      {/* Dispute Management Modal */}
      <Dialog open={!!selectedDispute} onOpenChange={(open) => !open && setSelectedDispute(null)}>
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-base font-bold text-foreground">
              <Scale className="size-4" />
              <span>Manage Dispute Case</span>
            </DialogTitle>
            <DialogDescription className="text-xs font-mono">
              Case #{selectedDispute?.id} • Booking #{selectedDispute?.bookingId}
            </DialogDescription>
          </DialogHeader>

          {selectedDispute && (
            <div className="space-y-4 pt-2 text-xs">
              {/* Summary */}
              <div className="p-3 rounded-xl bg-muted/40 border border-border space-y-2">
                <div className="flex justify-between font-medium">
                  <span className="text-muted-foreground">Claimant:</span>
                  <span className="font-semibold text-foreground">{selectedDispute.initiatorName}</span>
                </div>
                <div className="flex justify-between font-medium">
                  <span className="text-muted-foreground">Respondent:</span>
                  <span className="font-semibold text-foreground">{selectedDispute.respondentName}</span>
                </div>
                <div className="border-t border-border/60 pt-2">
                  <div className="font-semibold text-foreground">Dispute Reason: {selectedDispute.reason}</div>
                  <p className="text-muted-foreground text-[11px] mt-1 leading-relaxed">
                    {selectedDispute.description}
                  </p>
                </div>
              </div>

              {/* Status Selector */}
              <div>
                <label className="block text-xs font-semibold text-foreground mb-1">Case Status:</label>
                <select
                  value={modalStatus}
                  onChange={(e) => setModalStatus(e.target.value as any)}
                  className="w-full px-3 py-2 text-xs rounded-xl bg-muted/30 border border-border text-foreground font-mono"
                >
                  <option value="open">Open</option>
                  <option value="under_review">Under Review</option>
                  <option value="resolved">Resolved</option>
                  <option value="rejected">Rejected</option>
                  <option value="closed">Closed</option>
                </select>
              </div>

              {/* Internal Admin Notes */}
              <div>
                <label className="block text-xs font-semibold text-foreground mb-1">
                  Internal Admin Notes (Private — Never shown to users):
                </label>
                <textarea
                  rows={2}
                  placeholder="Record confidential investigation notes, verification checks, or communications..."
                  value={modalAdminNotes}
                  onChange={(e) => setModalAdminNotes(e.target.value)}
                  className="w-full p-2.5 text-xs rounded-xl bg-muted/30 border border-border text-foreground"
                />
              </div>

              {/* Resolution Summary */}
              <div>
                <label className="block text-xs font-semibold text-foreground mb-1">
                  Resolution Summary (Sent to parties upon resolution):
                </label>
                <textarea
                  rows={2}
                  placeholder="Summarize outcome (e.g. Deposit refunded to borrower, replacement item provided, wear deemed standard)..."
                  value={modalResolution}
                  onChange={(e) => setModalResolution(e.target.value)}
                  className="w-full p-2.5 text-xs rounded-xl bg-muted/30 border border-border text-foreground"
                />
              </div>

              {/* Action Taken */}
              <div>
                <label className="block text-xs font-semibold text-foreground mb-1">
                  Action Taken (e.g. deposit_refunded, warning_issued, account_suspended, none):
                </label>
                <input
                  type="text"
                  placeholder="E.g. full_deposit_refund"
                  value={modalActionTaken}
                  onChange={(e) => setModalActionTaken(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl bg-muted/30 border border-border text-foreground font-mono"
                />
              </div>
            </div>
          )}

          <DialogFooter className="pt-3">
            <button
              type="button"
              onClick={() => setSelectedDispute(null)}
              className="px-4 py-2 rounded-xl text-xs font-medium border border-border bg-card hover:bg-muted text-foreground transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSaveDispute}
              disabled={savingDispute}
              className="px-4 py-2 rounded-xl text-xs font-medium bg-foreground text-background hover:opacity-90 transition-opacity cursor-pointer disabled:opacity-50"
            >
              {savingDispute ? "Saving..." : "Save Case Changes"}
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
