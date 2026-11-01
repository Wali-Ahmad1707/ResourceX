"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  Flag,
  Search,
  Filter,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Eye,
  Loader2,
  RefreshCw,
  User,
  Package,
  ShieldCheck,
  ShieldAlert,
  ArrowRight
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

interface ReportItem {
  id: string;
  reporterId: string;
  reporterName?: string;
  reporterEmail?: string;
  targetType: "user" | "resource" | "booking";
  targetId: string;
  targetTitleOrName?: string;
  reason: string;
  details: string;
  evidence?: string | null;
  status: "open" | "investigating" | "resolved" | "dismissed";
  assignedAdminId?: string | null;
  assignedAdminName?: string | null;
  adminNotes?: string | null;
  resolution?: string | null;
  actionTaken?: string | null;
  resolvedAt?: string | null;
  createdAt: string;
  updatedAt: string;
}

export default function AdminReportsPage() {
  const [reports, setReports] = useState<ReportItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("all");
  const [targetTypeFilter, setTargetTypeFilter] = useState("all");

  // Investigation Modal
  const [selectedReport, setSelectedReport] = useState<ReportItem | null>(null);
  const [modalStatus, setModalStatus] = useState<ReportItem["status"]>("investigating");
  const [modalAdminNotes, setModalAdminNotes] = useState("");
  const [modalResolution, setModalResolution] = useState("");
  const [modalActionTaken, setModalActionTaken] = useState("");
  const [savingReport, setSavingReport] = useState(false);

  const fetchReports = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (statusFilter !== "all") params.append("status", statusFilter);
      if (targetTypeFilter !== "all") params.append("targetType", targetTypeFilter);

      const res = await fetch(`/api/admin/reports?${params.toString()}`);
      const data = await res.json();
      if (data.success && data.reports) {
        setReports(data.reports);
      } else {
        toast.error(data.error || "Failed to fetch reports");
      }
    } catch {
      toast.error("Failed to connect to reports service");
    } finally {
      setLoading(false);
    }
  }, [statusFilter, targetTypeFilter]);

  useEffect(() => {
    fetchReports();
  }, [fetchReports]);

  const openInvestigation = (rep: ReportItem) => {
    setSelectedReport(rep);
    setModalStatus(rep.status);
    setModalAdminNotes(rep.adminNotes || "");
    setModalResolution(rep.resolution || "");
    setModalActionTaken(rep.actionTaken || "");
  };

  const handleSaveReport = async () => {
    if (!selectedReport) return;
    try {
      setSavingReport(true);
      const res = await fetch(`/api/admin/reports/${selectedReport.id}`, {
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
        toast.success("Community report investigation updated.");
        setSelectedReport(null);
        fetchReports();
      } else {
        toast.error(data.error || "Failed to update report");
      }
    } catch {
      toast.error("Error communicating with moderation service");
    } finally {
      setSavingReport(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Community Safety & Reports</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Review user-submitted reports on suspicious listings, damages, or policy violations.
          </p>
        </div>
        <button
          type="button"
          onClick={fetchReports}
          disabled={loading}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-medium border border-border bg-card hover:bg-muted transition-colors cursor-pointer self-start sm:self-auto"
        >
          <RefreshCw className={`size-3.5 ${loading ? "animate-spin" : ""}`} />
          <span>Refresh</span>
        </button>
      </div>

      {/* Filter Bar */}
      <div className="p-4 rounded-2xl bg-card border border-border shadow-xs flex flex-wrap gap-3 items-center justify-between">
        <div className="flex items-center gap-2">
          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 text-xs rounded-xl bg-muted/40 border border-border text-foreground focus:outline-hidden focus:ring-1 focus:ring-foreground"
          >
            <option value="all">All Statuses</option>
            <option value="open">Open</option>
            <option value="investigating">Under Investigation</option>
            <option value="resolved">Resolved</option>
            <option value="dismissed">Dismissed</option>
          </select>

          {/* Target Type Filter */}
          <select
            value={targetTypeFilter}
            onChange={(e) => setTargetTypeFilter(e.target.value)}
            className="px-3 py-2 text-xs rounded-xl bg-muted/40 border border-border text-foreground focus:outline-hidden focus:ring-1 focus:ring-foreground"
          >
            <option value="all">All Targets</option>
            <option value="user">User Reports</option>
            <option value="resource">Resource Reports</option>
            <option value="booking">Booking Reports</option>
          </select>
        </div>

        <div className="text-xs text-muted-foreground font-mono">
          Showing {reports.length} report(s)
        </div>
      </div>

      {/* Reports Table */}
      <div className="rounded-2xl bg-card border border-border shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-muted/50 text-muted-foreground font-mono uppercase text-[10px] border-b border-border">
              <tr>
                <th className="py-3 px-4">Report ID</th>
                <th className="py-3 px-4">Target Entity</th>
                <th className="py-3 px-4">Reporter</th>
                <th className="py-3 px-4">Reason & Details</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Investigate</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60">
              {loading && reports.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-muted-foreground font-mono">
                    <Loader2 className="size-6 animate-spin mx-auto mb-2 text-muted-foreground" />
                    Loading community reports...
                  </td>
                </tr>
              ) : reports.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-muted-foreground font-mono">
                    No community reports found.
                  </td>
                </tr>
              ) : (
                reports.map((rep) => (
                  <tr key={rep.id} className="hover:bg-muted/30 transition-colors">
                    <td className="py-3 px-4 font-mono font-bold text-foreground">
                      {rep.id.slice(0, 10)}
                    </td>

                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        {rep.targetType === "resource" ? (
                          <Package className="size-3.5 text-blue-500 shrink-0" />
                        ) : rep.targetType === "user" ? (
                          <User className="size-3.5 text-purple-500 shrink-0" />
                        ) : (
                          <Flag className="size-3.5 text-amber-500 shrink-0" />
                        )}
                        <div className="min-w-0">
                          <div className="font-semibold text-foreground truncate max-w-[160px]">
                            {rep.targetTitleOrName || rep.targetId}
                          </div>
                          <span className="font-mono text-[10px] text-muted-foreground uppercase">
                            {rep.targetType}
                          </span>
                        </div>
                      </div>
                    </td>

                    <td className="py-3 px-4">
                      <div className="font-medium text-foreground">{rep.reporterName || "Member"}</div>
                      <div className="text-[10px] text-muted-foreground font-mono truncate max-w-[140px]">
                        {rep.reporterEmail || rep.reporterId}
                      </div>
                    </td>

                    <td className="py-3 px-4">
                      <div className="font-semibold text-foreground max-w-[200px] truncate">{rep.reason}</div>
                      <div className="text-[11px] text-muted-foreground line-clamp-1 max-w-[220px]">
                        {rep.details}
                      </div>
                    </td>

                    <td className="py-3 px-4">
                      <span
                        className={`inline-flex items-center gap-1 font-mono text-[10px] uppercase font-bold px-2 py-0.5 rounded-full border ${
                          rep.status === "open"
                            ? "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20"
                            : rep.status === "investigating"
                            ? "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20"
                            : rep.status === "resolved"
                            ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20"
                            : "bg-muted text-muted-foreground border-border"
                        }`}
                      >
                        {rep.status}
                      </span>
                    </td>

                    <td className="py-3 px-4 text-right">
                      <button
                        type="button"
                        onClick={() => openInvestigation(rep)}
                        className="px-3 py-1.5 rounded-lg border border-border bg-card hover:bg-muted text-xs font-medium text-foreground transition-colors cursor-pointer"
                      >
                        Review
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Report Investigation Modal */}
      <Dialog open={!!selectedReport} onOpenChange={(open) => !open && setSelectedReport(null)}>
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-base font-bold text-foreground">
              <ShieldAlert className="size-4" />
              <span>Investigate Safety Report</span>
            </DialogTitle>
            <DialogDescription className="text-xs font-mono">
              Report #{selectedReport?.id} • Target Type: {selectedReport?.targetType}
            </DialogDescription>
          </DialogHeader>

          {selectedReport && (
            <div className="space-y-4 pt-2 text-xs">
              <div className="p-3 rounded-xl bg-muted/40 border border-border space-y-2">
                <div className="flex justify-between font-medium">
                  <span className="text-muted-foreground">Target Entity:</span>
                  <span className="font-semibold text-foreground">
                    {selectedReport.targetTitleOrName} ({selectedReport.targetId})
                  </span>
                </div>
                <div className="flex justify-between font-medium">
                  <span className="text-muted-foreground">Submitted By:</span>
                  <span className="font-semibold text-foreground">{selectedReport.reporterName}</span>
                </div>
                <div className="border-t border-border/60 pt-2">
                  <div className="font-semibold text-foreground">Allegation: {selectedReport.reason}</div>
                  <p className="text-muted-foreground text-[11px] mt-1 leading-relaxed">
                    {selectedReport.details}
                  </p>
                </div>
              </div>

              {/* Status Selector */}
              <div>
                <label className="block text-xs font-semibold text-foreground mb-1">Investigation Status:</label>
                <select
                  value={modalStatus}
                  onChange={(e) => setModalStatus(e.target.value as any)}
                  className="w-full px-3 py-2 text-xs rounded-xl bg-muted/30 border border-border text-foreground font-mono"
                >
                  <option value="open">Open</option>
                  <option value="investigating">Under Investigation</option>
                  <option value="resolved">Resolved (Action Taken)</option>
                  <option value="dismissed">Dismissed (No Violation Found)</option>
                </select>
              </div>

              {/* Internal Notes */}
              <div>
                <label className="block text-xs font-semibold text-foreground mb-1">
                  Confidential Administrative Notes (Not shared with reporter):
                </label>
                <textarea
                  rows={2}
                  placeholder="Record verification notes, moderator conclusions, or internal audit trail..."
                  value={modalAdminNotes}
                  onChange={(e) => setModalAdminNotes(e.target.value)}
                  className="w-full p-2.5 text-xs rounded-xl bg-muted/30 border border-border text-foreground"
                />
              </div>

              {/* Resolution Summary */}
              <div>
                <label className="block text-xs font-semibold text-foreground mb-1">
                  Resolution Summary (Sent to reporter):
                </label>
                <textarea
                  rows={2}
                  placeholder="E.g. Listing removed for safety policy violation; user issued formal warning; report closed."
                  value={modalResolution}
                  onChange={(e) => setModalResolution(e.target.value)}
                  className="w-full p-2.5 text-xs rounded-xl bg-muted/30 border border-border text-foreground"
                />
              </div>

              {/* Action Taken */}
              <div>
                <label className="block text-xs font-semibold text-foreground mb-1">
                  Action Taken (e.g. listing_suspended, user_suspended, warning_issued, dismissed):
                </label>
                <input
                  type="text"
                  placeholder="E.g. listing_suspended"
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
              onClick={() => setSelectedReport(null)}
              className="px-4 py-2 rounded-xl text-xs font-medium border border-border bg-card hover:bg-muted text-foreground transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSaveReport}
              disabled={savingReport}
              className="px-4 py-2 rounded-xl text-xs font-medium bg-foreground text-background hover:opacity-90 transition-opacity cursor-pointer disabled:opacity-50"
            >
              {savingReport ? "Saving..." : "Save Report Decision"}
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
