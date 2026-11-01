"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Users,
  Package,
  CalendarCheck,
  AlertTriangle,
  Flag,
  ShieldCheck,
  Clock,
  ArrowRight,
  TrendingUp,
  FileText,
  RefreshCw,
  Loader2,
  CheckCircle2,
  XCircle,
  Tag
} from "lucide-react";
import { toast } from "sonner";

interface AdminMetrics {
  totalUsers: number;
  activeUsers: number;
  suspendedUsers: number;
  totalResources: number;
  pendingReviewResources: number;
  approvedResources: number;
  suspendedResources: number;
  totalBookings: number;
  activeDisputes: number;
  openReports: number;
  categoriesCount: number;
  categoryDistribution: { category: string; count: number }[];
  userRoleDistribution: { role: string; count: number }[];
  bookingStatusDistribution: { status: string; count: number }[];
  recentAuditLogs: {
    id: string;
    actorId: string;
    action: string;
    entityType: string;
    entityId: string;
    details: string;
    timestamp: string;
  }[];
}

export default function AdminDashboardPage() {
  const [metrics, setMetrics] = useState<AdminMetrics | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchMetrics = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/admin/dashboard");
      const data = await res.json();
      if (data.success && data.metrics) {
        setMetrics(data.metrics);
      } else {
        toast.error(data.error || "Failed to load dashboard metrics");
      }
    } catch {
      toast.error("Failed to connect to administrative metrics service");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMetrics();
  }, []);

  if (loading && !metrics) {
    return (
      <div className="p-12 flex flex-col items-center justify-center text-center">
        <Loader2 className="size-8 animate-spin text-muted-foreground mb-3" />
        <p className="text-xs text-muted-foreground font-mono">Loading operations console...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Platform Overview</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            ResourceX operations, community activity, and real-time moderation status.
          </p>
        </div>
        <button
          type="button"
          onClick={fetchMetrics}
          disabled={loading}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-medium border border-border bg-card hover:bg-muted transition-colors cursor-pointer self-start sm:self-auto"
        >
          <RefreshCw className={`size-3.5 ${loading ? "animate-spin" : ""}`} />
          <span>Refresh</span>
        </button>
      </div>

      {/* Top Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {/* Users Card */}
        <div className="p-5 rounded-2xl bg-card border border-border shadow-xs">
          <div className="flex items-center justify-between text-muted-foreground mb-3">
            <span className="text-xs font-semibold uppercase tracking-wider">Total Members</span>
            <Users className="size-4" />
          </div>
          <div className="text-3xl font-bold tracking-tight text-foreground font-mono">
            {metrics?.totalUsers ?? 0}
          </div>
          <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
            <span className="inline-flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-medium">
              <span className="size-1.5 rounded-full bg-emerald-500" />
              {metrics?.activeUsers ?? 0} active
            </span>
            <span>•</span>
            <span className="text-amber-600 dark:text-amber-400 font-medium">
              {metrics?.suspendedUsers ?? 0} suspended
            </span>
          </div>
        </div>

        {/* Resources Card */}
        <div className="p-5 rounded-2xl bg-card border border-border shadow-xs">
          <div className="flex items-center justify-between text-muted-foreground mb-3">
            <span className="text-xs font-semibold uppercase tracking-wider">Catalog Listings</span>
            <Package className="size-4" />
          </div>
          <div className="text-3xl font-bold tracking-tight text-foreground font-mono">
            {metrics?.totalResources ?? 0}
          </div>
          <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
            <span className="text-emerald-600 dark:text-emerald-400 font-medium">
              {metrics?.approvedResources ?? 0} live
            </span>
            <span>•</span>
            <span className="text-amber-600 dark:text-amber-400 font-medium">
              {metrics?.pendingReviewResources ?? 0} pending review
            </span>
          </div>
        </div>

        {/* Bookings Card */}
        <div className="p-5 rounded-2xl bg-card border border-border shadow-xs">
          <div className="flex items-center justify-between text-muted-foreground mb-3">
            <span className="text-xs font-semibold uppercase tracking-wider">Total Bookings</span>
            <CalendarCheck className="size-4" />
          </div>
          <div className="text-3xl font-bold tracking-tight text-foreground font-mono">
            {metrics?.totalBookings ?? 0}
          </div>
          <div className="mt-2 text-xs text-muted-foreground">
            Community resource sharing cycles facilitated
          </div>
        </div>

        {/* Safety & Moderation Card */}
        <div className="p-5 rounded-2xl bg-card border border-border shadow-xs">
          <div className="flex items-center justify-between text-muted-foreground mb-3">
            <span className="text-xs font-semibold uppercase tracking-wider">Community Safety</span>
            <Flag className="size-4" />
          </div>
          <div className="flex items-baseline gap-2">
            <div className="text-3xl font-bold tracking-tight text-foreground font-mono">
              {(metrics?.activeDisputes ?? 0) + (metrics?.openReports ?? 0)}
            </div>
            <span className="text-xs text-muted-foreground font-mono">open items</span>
          </div>
          <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
            <span className="text-rose-600 dark:text-rose-400 font-medium">
              {metrics?.activeDisputes ?? 0} disputes
            </span>
            <span>•</span>
            <span className="text-amber-600 dark:text-amber-400 font-medium">
              {metrics?.openReports ?? 0} reports
            </span>
          </div>
        </div>
      </div>

      {/* Action Shortcuts Banner */}
      {((metrics?.pendingReviewResources ?? 0) > 0 || (metrics?.activeDisputes ?? 0) > 0 || (metrics?.openReports ?? 0) > 0) && (
        <div className="p-4 rounded-2xl bg-muted/40 border border-border flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="size-9 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
              <AlertTriangle className="size-5" />
            </div>
            <div>
              <p className="text-sm font-semibold text-foreground">Action Required in Moderation Queue</p>
              <p className="text-xs text-muted-foreground">
                There are items pending administrative attention and review.
              </p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {(metrics?.pendingReviewResources ?? 0) > 0 && (
              <Link
                href="/dashboard/admin/resources?moderationStatus=pending"
                className="px-3 py-1.5 rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 text-xs font-medium hover:bg-amber-500/20 transition-colors"
              >
                Review {metrics?.pendingReviewResources} Listings
              </Link>
            )}
            {(metrics?.activeDisputes ?? 0) > 0 && (
              <Link
                href="/dashboard/admin/bookings"
                className="px-3 py-1.5 rounded-lg bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20 text-xs font-medium hover:bg-rose-500/20 transition-colors"
              >
                Inspect {metrics?.activeDisputes} Disputes
              </Link>
            )}
            {(metrics?.openReports ?? 0) > 0 && (
              <Link
                href="/dashboard/admin/reports"
                className="px-3 py-1.5 rounded-lg bg-foreground text-background text-xs font-medium hover:opacity-90 transition-opacity"
              >
                View {metrics?.openReports} Reports
              </Link>
            )}
          </div>
        </div>
      )}

      {/* Distribution Analytics Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Category Breakdown */}
        <div className="p-6 rounded-2xl bg-card border border-border shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-foreground flex items-center gap-2">
              <Tag className="size-4 text-muted-foreground" />
              <span>Category Distribution</span>
            </h2>
            <Link
              href="/dashboard/admin/settings"
              className="text-xs text-muted-foreground hover:text-foreground underline font-mono"
            >
              Manage
            </Link>
          </div>
          <div className="space-y-3">
            {metrics?.categoryDistribution && metrics.categoryDistribution.length > 0 ? (
              metrics.categoryDistribution.map((item) => {
                const max = Math.max(...metrics.categoryDistribution.map((c) => c.count), 1);
                const percent = Math.round((item.count / max) * 100);
                return (
                  <div key={item.category} className="space-y-1">
                    <div className="flex justify-between text-xs">
                      <span className="font-medium text-foreground truncate">{item.category}</span>
                      <span className="font-mono text-muted-foreground">{item.count}</span>
                    </div>
                    <div className="w-full h-1.5 rounded-full bg-muted overflow-hidden">
                      <div
                        className="h-full bg-foreground rounded-full transition-all duration-500"
                        style={{ width: `${percent}%` }}
                      />
                    </div>
                  </div>
                );
              })
            ) : (
              <p className="text-xs text-muted-foreground py-6 text-center font-mono">
                No active resources categorized yet.
              </p>
            )}
          </div>
        </div>

        {/* Member Roles */}
        <div className="p-6 rounded-2xl bg-card border border-border shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-foreground flex items-center gap-2">
              <Users className="size-4 text-muted-foreground" />
              <span>Member Roles</span>
            </h2>
            <Link
              href="/dashboard/admin/users"
              className="text-xs text-muted-foreground hover:text-foreground underline font-mono"
            >
              All Users
            </Link>
          </div>
          <div className="space-y-3">
            {metrics?.userRoleDistribution && metrics.userRoleDistribution.length > 0 ? (
              metrics.userRoleDistribution.map((role) => {
                const total = metrics.totalUsers || 1;
                const percent = Math.round((role.count / total) * 100);
                return (
                  <div key={role.role} className="p-3 rounded-xl bg-muted/40 border border-border/60">
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span className="font-mono uppercase font-semibold text-foreground">
                        {role.role}
                      </span>
                      <span className="font-mono font-bold text-foreground">{role.count}</span>
                    </div>
                    <div className="w-full h-1.5 rounded-full bg-muted overflow-hidden mt-2">
                      <div
                        className="h-full bg-foreground rounded-full"
                        style={{ width: `${percent}%` }}
                      />
                    </div>
                    <div className="text-[10px] text-muted-foreground text-right mt-1 font-mono">
                      {percent}% of total
                    </div>
                  </div>
                );
              })
            ) : (
              <p className="text-xs text-muted-foreground py-6 text-center font-mono">
                No users found.
              </p>
            )}
          </div>
        </div>

        {/* Booking Status Distribution */}
        <div className="p-6 rounded-2xl bg-card border border-border shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-foreground flex items-center gap-2">
              <CalendarCheck className="size-4 text-muted-foreground" />
              <span>Booking Pipeline</span>
            </h2>
            <Link
              href="/dashboard/admin/bookings"
              className="text-xs text-muted-foreground hover:text-foreground underline font-mono"
            >
              Bookings
            </Link>
          </div>
          <div className="space-y-2.5">
            {metrics?.bookingStatusDistribution && metrics.bookingStatusDistribution.length > 0 ? (
              metrics.bookingStatusDistribution.map((st) => (
                <div
                  key={st.status}
                  className="flex items-center justify-between p-2.5 rounded-xl border border-border/60 bg-muted/30 text-xs"
                >
                  <span className="capitalize font-medium text-foreground">{st.status}</span>
                  <span className="font-mono font-bold px-2 py-0.5 rounded-md bg-background border border-border">
                    {st.count}
                  </span>
                </div>
              ))
            ) : (
              <p className="text-xs text-muted-foreground py-6 text-center font-mono">
                No bookings recorded yet.
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Recent Audit Logs Section */}
      <div className="p-6 rounded-2xl bg-card border border-border shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-sm font-semibold text-foreground flex items-center gap-2">
              <FileText className="size-4 text-muted-foreground" />
              <span>Recent Immutable Audit Logs</span>
            </h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              Chronological ledger of security and operational events.
            </p>
          </div>
          <Link
            href="/dashboard/admin/audit-logs"
            className="inline-flex items-center gap-1.5 text-xs text-foreground font-medium hover:underline"
          >
            <span>View All Logs</span>
            <ArrowRight className="size-3.5" />
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-muted/50 text-muted-foreground font-mono uppercase text-[10px] border-b border-border">
              <tr>
                <th className="py-2.5 px-3">Timestamp</th>
                <th className="py-2.5 px-3">Action</th>
                <th className="py-2.5 px-3">Entity</th>
                <th className="py-2.5 px-3">Entity ID</th>
                <th className="py-2.5 px-3">Actor ID</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60">
              {metrics?.recentAuditLogs && metrics.recentAuditLogs.length > 0 ? (
                metrics.recentAuditLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-muted/30 transition-colors">
                    <td className="py-2.5 px-3 font-mono text-muted-foreground text-[11px] whitespace-nowrap">
                      {new Date(log.timestamp).toLocaleString()}
                    </td>
                    <td className="py-2.5 px-3">
                      <span className="font-mono text-[10px] font-bold px-2 py-0.5 rounded bg-muted text-foreground border border-border">
                        {log.action}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 font-mono text-muted-foreground capitalize">
                      {log.entityType}
                    </td>
                    <td className="py-2.5 px-3 font-mono text-[11px] text-muted-foreground">
                      {log.entityId}
                    </td>
                    <td className="py-2.5 px-3 font-mono text-[11px] text-muted-foreground">
                      {log.actorId}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-xs text-muted-foreground font-mono">
                    No audit records available.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
