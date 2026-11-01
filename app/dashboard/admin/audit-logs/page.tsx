"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  FileText,
  Search,
  Filter,
  RefreshCw,
  Loader2,
  Calendar,
  User,
  ShieldCheck,
  Code
} from "lucide-react";
import { toast } from "sonner";

interface AuditLogItem {
  id: string;
  actorId: string;
  actorName?: string;
  actorEmail?: string;
  actorRole?: string;
  action: string;
  entityType: string;
  entityId: string;
  details: string;
  timestamp: string;
}

export default function AdminAuditLogsPage() {
  const [logs, setLogs] = useState<AuditLogItem[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [entityFilter, setEntityFilter] = useState("all");
  const [actionFilter, setActionFilter] = useState("all");
  const [actorIdFilter, setActorIdFilter] = useState("");

  const fetchLogs = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (entityFilter !== "all") params.append("entityType", entityFilter);
      if (actionFilter !== "all") params.append("action", actionFilter);
      if (actorIdFilter.trim()) params.append("actorId", actorIdFilter.trim());
      params.append("limit", "100");

      const res = await fetch(`/api/admin/audit-logs?${params.toString()}`);
      const data = await res.json();
      if (data.success && data.logs) {
        setLogs(data.logs);
        setTotal(data.total || 0);
      } else {
        toast.error(data.error || "Failed to fetch audit logs");
      }
    } catch {
      toast.error("Failed to connect to audit logging service");
    } finally {
      setLoading(false);
    }
  }, [entityFilter, actionFilter, actorIdFilter]);

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Immutable Audit Trail</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Cryptographically sealed, append-only ledger of platform events and moderator interventions.
          </p>
        </div>
        <button
          type="button"
          onClick={fetchLogs}
          disabled={loading}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-medium border border-border bg-card hover:bg-muted transition-colors cursor-pointer self-start sm:self-auto"
        >
          <RefreshCw className={`size-3.5 ${loading ? "animate-spin" : ""}`} />
          <span>Refresh</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 rounded-2xl bg-card border border-border shadow-xs flex flex-wrap gap-3 items-center justify-between">
        <div className="flex flex-wrap items-center gap-2 flex-1">
          {/* Entity Type Filter */}
          <select
            value={entityFilter}
            onChange={(e) => setEntityFilter(e.target.value)}
            className="px-3 py-2 text-xs rounded-xl bg-muted/40 border border-border text-foreground focus:outline-hidden focus:ring-1 focus:ring-foreground"
          >
            <option value="all">All Entity Types</option>
            <option value="users">Users</option>
            <option value="resources">Resources</option>
            <option value="bookings">Bookings</option>
            <option value="booking_disputes">Booking Disputes</option>
            <option value="user_reports">User Reports</option>
            <option value="platform_categories">Platform Categories</option>
            <option value="platform_settings">Platform Settings</option>
          </select>

          {/* Action Filter */}
          <select
            value={actionFilter}
            onChange={(e) => setActionFilter(e.target.value)}
            className="px-3 py-2 text-xs rounded-xl bg-muted/40 border border-border text-foreground focus:outline-hidden focus:ring-1 focus:ring-foreground"
          >
            <option value="all">All Actions</option>
            <option value="USER_REGISTERED">USER_REGISTERED</option>
            <option value="USER_SUSPENDED">USER_SUSPENDED</option>
            <option value="USER_ACTIVATED">USER_ACTIVATED</option>
            <option value="USER_ROLE_CHANGED">USER_ROLE_CHANGED</option>
            <option value="RESOURCE_CREATED">RESOURCE_CREATED</option>
            <option value="RESOURCE_APPROVED">RESOURCE_APPROVED</option>
            <option value="RESOURCE_REJECTED">RESOURCE_REJECTED</option>
            <option value="RESOURCE_SUSPENDED">RESOURCE_SUSPENDED</option>
            <option value="RESOURCE_RESTORED">RESOURCE_RESTORED</option>
            <option value="BOOKING_CREATED">BOOKING_CREATED</option>
            <option value="BOOKING_APPROVED">BOOKING_APPROVED</option>
            <option value="BOOKING_CANCELLED">BOOKING_CANCELLED</option>
            <option value="DISPUTE_OPENED">DISPUTE_OPENED</option>
            <option value="DISPUTE_RESOLVED">DISPUTE_RESOLVED</option>
            <option value="REPORT_SUBMITTED">REPORT_SUBMITTED</option>
            <option value="REPORT_RESOLVED">REPORT_RESOLVED</option>
            <option value="CATEGORY_CREATED">CATEGORY_CREATED</option>
            <option value="CATEGORY_DELETED">CATEGORY_DELETED</option>
            <option value="SETTINGS_UPDATED">SETTINGS_UPDATED</option>
          </select>

          {/* Search Actor ID */}
          <div className="relative min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground" />
            <input
              type="text"
              placeholder="Filter by Actor ID..."
              value={actorIdFilter}
              onChange={(e) => setActorIdFilter(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 text-xs rounded-xl bg-muted/40 border border-border text-foreground font-mono focus:outline-hidden focus:ring-1 focus:ring-foreground"
            />
          </div>
        </div>

        <div className="text-xs text-muted-foreground font-mono">
          Total records: {total}
        </div>
      </div>

      {/* Logs Table */}
      <div className="rounded-2xl bg-card border border-border shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-muted/50 text-muted-foreground font-mono uppercase text-[10px] border-b border-border">
              <tr>
                <th className="py-3 px-4">Timestamp</th>
                <th className="py-3 px-4">Action</th>
                <th className="py-3 px-4">Entity</th>
                <th className="py-3 px-4">Actor</th>
                <th className="py-3 px-4">Event Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60">
              {loading && logs.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-muted-foreground font-mono">
                    <Loader2 className="size-6 animate-spin mx-auto mb-2 text-muted-foreground" />
                    Querying audit trail...
                  </td>
                </tr>
              ) : logs.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-muted-foreground font-mono">
                    No audit records matching query criteria.
                  </td>
                </tr>
              ) : (
                logs.map((log) => {
                  let parsedDetails = log.details;
                  try {
                    const obj = JSON.parse(log.details);
                    parsedDetails = JSON.stringify(obj, null, 1);
                  } catch {}

                  return (
                    <tr key={log.id} className="hover:bg-muted/30 transition-colors align-top">
                      <td className="py-3 px-4 font-mono text-muted-foreground text-[11px] whitespace-nowrap">
                        {new Date(log.timestamp).toLocaleString()}
                      </td>

                      <td className="py-3 px-4">
                        <span className="font-mono text-[10px] font-bold px-2 py-0.5 rounded bg-foreground text-background whitespace-nowrap">
                          {log.action}
                        </span>
                      </td>

                      <td className="py-3 px-4">
                        <div className="font-medium text-foreground capitalize">{log.entityType}</div>
                        <div className="text-[10px] font-mono text-muted-foreground truncate max-w-[130px]">
                          {log.entityId}
                        </div>
                      </td>

                      <td className="py-3 px-4">
                        <div className="font-medium text-foreground">
                          {log.actorName || log.actorId}
                        </div>
                        {log.actorRole && (
                          <div className="text-[10px] font-mono uppercase text-muted-foreground">
                            {log.actorRole}
                          </div>
                        )}
                      </td>

                      <td className="py-3 px-4">
                        <pre className="font-mono text-[10px] bg-muted/40 p-2 rounded-lg text-muted-foreground overflow-x-auto max-w-[320px] whitespace-pre-wrap leading-tight">
                          {parsedDetails}
                        </pre>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
