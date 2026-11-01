"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  Users,
  Search,
  Filter,
  ShieldCheck,
  ShieldAlert,
  UserX,
  UserCheck,
  KeyRound,
  Eye,
  Loader2,
  RefreshCw,
  Phone,
  Mail,
  Calendar,
  AlertTriangle,
  History
} from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/hooks/use-auth";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";

interface UserItem {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  role: "borrower" | "owner" | "admin";
  avatar: string;
  verified: boolean;
  status: "active" | "suspended" | "pending";
  suspendedReason?: string | null;
  suspendedAt?: string | null;
  suspendedBy?: string | null;
  createdAt: string;
  updatedAt: string;
}

interface UserDetailResponse {
  user: UserItem;
  stats: {
    bookingsAsBorrower: number;
    resourcesOwned: number;
    bookingsReceived: number;
    disputesInvolved: number;
    reportsAgainst: number;
    reportsFiled: number;
  };
  auditLogs: {
    id: string;
    action: string;
    entityType: string;
    entityId: string;
    details: string;
    timestamp: string;
  }[];
}

export default function AdminUsersPage() {
  const { user: currentAdmin } = useAuth();
  const [users, setUsers] = useState<UserItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");

  // Inspection Drawer / Modal
  const [selectedUser, setSelectedUser] = useState<UserDetailResponse | null>(null);
  const [loadingDetails, setLoadingDetails] = useState(false);

  // Suspend Dialog
  const [suspendingUser, setSuspendingUser] = useState<UserItem | null>(null);
  const [suspendReason, setSuspendReason] = useState("");
  const [actionLoading, setActionLoading] = useState(false);

  // Role Change Dialog
  const [roleChangingUser, setRoleChangingUser] = useState<UserItem | null>(null);
  const [targetRole, setTargetRole] = useState<"borrower" | "owner" | "admin">("borrower");

  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (roleFilter !== "all") params.append("role", roleFilter);
      if (statusFilter !== "all") params.append("status", statusFilter);
      if (searchTerm.trim()) params.append("search", searchTerm.trim());

      const res = await fetch(`/api/admin/users?${params.toString()}`);
      const data = await res.json();
      if (data.success && data.users) {
        setUsers(data.users);
      } else {
        toast.error(data.error || "Failed to fetch users");
      }
    } catch {
      toast.error("Failed to connect to users service");
    } finally {
      setLoading(false);
    }
  }, [roleFilter, statusFilter, searchTerm]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const viewUserDetails = async (userId: string) => {
    try {
      setLoadingDetails(true);
      const res = await fetch(`/api/admin/users/${userId}`);
      const data = await res.json();
      if (data.success) {
        setSelectedUser(data);
      } else {
        toast.error(data.error || "Failed to load user details");
      }
    } catch {
      toast.error("Failed to retrieve user details");
    } finally {
      setLoadingDetails(false);
    }
  };

  const handleSuspendUser = async () => {
    if (!suspendingUser) return;
    if (!suspendReason.trim()) {
      toast.error("Please provide a reason for the account suspension.");
      return;
    }

    try {
      setActionLoading(true);
      const res = await fetch(`/api/admin/users/${suspendingUser.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "update_status",
          status: "suspended",
          reason: suspendReason.trim(),
        }),
      });

      const data = await res.json();
      if (data.success) {
        toast.success(`Account for ${suspendingUser.fullName} has been suspended.`);
        setSuspendingUser(null);
        setSuspendReason("");
        fetchUsers();
        if (selectedUser?.user.id === suspendingUser.id) {
          viewUserDetails(suspendingUser.id);
        }
      } else {
        toast.error(data.error || "Failed to suspend account");
      }
    } catch {
      toast.error("Error communicating with user management service");
    } finally {
      setActionLoading(false);
    }
  };

  const handleReactivateUser = async (userToReactivate: UserItem) => {
    try {
      setActionLoading(true);
      const res = await fetch(`/api/admin/users/${userToReactivate.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "update_status",
          status: "active",
        }),
      });

      const data = await res.json();
      if (data.success) {
        toast.success(`Account for ${userToReactivate.fullName} has been reactivated.`);
        fetchUsers();
        if (selectedUser?.user.id === userToReactivate.id) {
          viewUserDetails(userToReactivate.id);
        }
      } else {
        toast.error(data.error || "Failed to reactivate account");
      }
    } catch {
      toast.error("Error reactivating user account");
    } finally {
      setActionLoading(false);
    }
  };

  const handleRoleChange = async () => {
    if (!roleChangingUser) return;
    try {
      setActionLoading(true);
      const res = await fetch(`/api/admin/users/${roleChangingUser.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "update_role",
          role: targetRole,
        }),
      });

      const data = await res.json();
      if (data.success) {
        toast.success(`Role for ${roleChangingUser.fullName} updated to ${targetRole}.`);
        setRoleChangingUser(null);
        fetchUsers();
        if (selectedUser?.user.id === roleChangingUser.id) {
          viewUserDetails(roleChangingUser.id);
        }
      } else {
        toast.error(data.error || "Failed to update role");
      }
    } catch {
      toast.error("Error updating user role");
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">User Management</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Audit, verify, inspect, and manage permissions for all community accounts.
          </p>
        </div>
        <button
          type="button"
          onClick={fetchUsers}
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
            placeholder="Search by full name, email, or phone..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs rounded-xl bg-muted/40 border border-border text-foreground placeholder:text-muted-foreground focus:outline-hidden focus:ring-1 focus:ring-foreground"
          />
        </div>

        <div className="flex items-center gap-2">
          {/* Role Filter */}
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="px-3 py-2 text-xs rounded-xl bg-muted/40 border border-border text-foreground focus:outline-hidden focus:ring-1 focus:ring-foreground"
          >
            <option value="all">All Roles</option>
            <option value="borrower">Borrowers</option>
            <option value="owner">Owners</option>
            <option value="admin">Administrators</option>
          </select>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 text-xs rounded-xl bg-muted/40 border border-border text-foreground focus:outline-hidden focus:ring-1 focus:ring-foreground"
          >
            <option value="all">All Statuses</option>
            <option value="active">Active</option>
            <option value="suspended">Suspended</option>
          </select>
        </div>
      </div>

      {/* Users Table */}
      <div className="rounded-2xl bg-card border border-border shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-muted/50 text-muted-foreground font-mono uppercase text-[10px] border-b border-border">
              <tr>
                <th className="py-3 px-4">Member</th>
                <th className="py-3 px-4">Contact</th>
                <th className="py-3 px-4">Role</th>
                <th className="py-3 px-4">Account Status</th>
                <th className="py-3 px-4">Joined</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60">
              {loading && users.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-muted-foreground font-mono">
                    <Loader2 className="size-6 animate-spin mx-auto mb-2 text-muted-foreground" />
                    Loading platform members...
                  </td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-muted-foreground font-mono">
                    No users matching criteria found.
                  </td>
                </tr>
              ) : (
                users.map((u) => {
                  const isCurrentAdmin = u.id === currentAdmin?.id;
                  return (
                    <tr key={u.id} className="hover:bg-muted/30 transition-colors">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <div className="size-8 rounded-full bg-foreground text-background flex items-center justify-center font-bold text-xs shrink-0">
                            {u.fullName.charAt(0).toUpperCase()}
                          </div>
                          <div className="min-w-0">
                            <div className="font-semibold text-foreground flex items-center gap-1.5">
                              <span className="truncate">{u.fullName}</span>
                              {isCurrentAdmin && (
                                <span className="font-mono text-[9px] px-1 rounded bg-muted text-muted-foreground">
                                  You
                                </span>
                              )}
                            </div>
                            <span className="text-[10px] font-mono text-muted-foreground">{u.id}</span>
                          </div>
                        </div>
                      </td>

                      <td className="py-3 px-4">
                        <div className="space-y-0.5">
                          <div className="text-foreground truncate max-w-[180px]">{u.email}</div>
                          <div className="text-muted-foreground text-[11px] font-mono">{u.phone}</div>
                        </div>
                      </td>

                      <td className="py-3 px-4">
                        <span
                          className={`font-mono text-[10px] uppercase font-bold px-2 py-0.5 rounded-md border ${
                            u.role === "admin"
                              ? "bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20"
                              : u.role === "owner"
                              ? "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20"
                              : "bg-muted text-foreground border-border"
                          }`}
                        >
                          {u.role}
                        </span>
                      </td>

                      <td className="py-3 px-4">
                        <div className="space-y-1">
                          <span
                            className={`inline-flex items-center gap-1.5 font-mono text-[10px] uppercase font-bold px-2 py-0.5 rounded-full border ${
                              u.status === "active"
                                ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20"
                                : "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20"
                            }`}
                          >
                            <span
                              className={`size-1.5 rounded-full ${
                                u.status === "active" ? "bg-emerald-500" : "bg-rose-500"
                              }`}
                            />
                            {u.status}
                          </span>
                          {u.status === "suspended" && u.suspendedReason && (
                            <p className="text-[10px] text-muted-foreground truncate max-w-[140px]" title={u.suspendedReason}>
                              {u.suspendedReason}
                            </p>
                          )}
                        </div>
                      </td>

                      <td className="py-3 px-4 font-mono text-muted-foreground text-[11px] whitespace-nowrap">
                        {new Date(u.createdAt).toLocaleDateString()}
                      </td>

                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            type="button"
                            onClick={() => viewUserDetails(u.id)}
                            title="Inspect details and history"
                            className="p-1.5 rounded-lg border border-border bg-card hover:bg-muted text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                          >
                            <Eye className="size-3.5" />
                          </button>

                          <button
                            type="button"
                            onClick={() => {
                              setRoleChangingUser(u);
                              setTargetRole(u.role);
                            }}
                            title="Modify role"
                            className="p-1.5 rounded-lg border border-border bg-card hover:bg-muted text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                          >
                            <KeyRound className="size-3.5" />
                          </button>

                          {u.status === "active" ? (
                            <button
                              type="button"
                              onClick={() => {
                                if (isCurrentAdmin) {
                                  toast.error("Administrators cannot suspend their own account.");
                                  return;
                                }
                                setSuspendingUser(u);
                                setSuspendReason("");
                              }}
                              title={isCurrentAdmin ? "Cannot suspend yourself" : "Suspend user"}
                              className={`p-1.5 rounded-lg border transition-colors cursor-pointer ${
                                isCurrentAdmin
                                  ? "border-border text-muted-foreground/40 cursor-not-allowed"
                                  : "border-rose-500/20 bg-rose-500/5 hover:bg-rose-500/10 text-rose-600 dark:text-rose-400"
                              }`}
                            >
                              <UserX className="size-3.5" />
                            </button>
                          ) : (
                            <button
                              type="button"
                              onClick={() => handleReactivateUser(u)}
                              title="Reactivate user"
                              className="p-1.5 rounded-lg border border-emerald-500/20 bg-emerald-500/5 hover:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 transition-colors cursor-pointer"
                            >
                              <UserCheck className="size-3.5" />
                            </button>
                          )}
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

      {/* User Details Inspection Dialog */}
      <Dialog open={!!selectedUser} onOpenChange={(open) => !open && setSelectedUser(null)}>
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-base font-bold text-foreground">
              <Users className="size-4" />
              <span>User Profile & Reputation Audit</span>
            </DialogTitle>
            <DialogDescription className="text-xs font-mono">
              ID: {selectedUser?.user.id}
            </DialogDescription>
          </DialogHeader>

          {selectedUser && (
            <div className="space-y-6 pt-2 text-xs">
              {/* Profile Card */}
              <div className="flex items-start gap-4 p-4 rounded-xl bg-muted/40 border border-border">
                <div className="size-12 rounded-full bg-foreground text-background flex items-center justify-center font-bold text-lg shrink-0">
                  {selectedUser.user.fullName.charAt(0).toUpperCase()}
                </div>
                <div className="space-y-1 min-w-0 flex-1">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-bold text-foreground">{selectedUser.user.fullName}</h3>
                    <span className="font-mono text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-foreground text-background">
                      {selectedUser.user.role}
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-x-4 gap-y-1 text-muted-foreground text-[11px]">
                    <span className="flex items-center gap-1">
                      <Mail className="size-3" />
                      {selectedUser.user.email}
                    </span>
                    <span className="flex items-center gap-1 font-mono">
                      <Phone className="size-3" />
                      {selectedUser.user.phone}
                    </span>
                  </div>
                  <div className="pt-1 flex items-center gap-2">
                    <span
                      className={`font-mono text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        selectedUser.user.status === "active"
                          ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                          : "bg-rose-500/10 text-rose-600 dark:text-rose-400"
                      }`}
                    >
                      Status: {selectedUser.user.status}
                    </span>
                    <span className="text-muted-foreground font-mono text-[10px]">
                      Member since {new Date(selectedUser.user.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </div>

              {/* Suspension Notice if suspended */}
              {selectedUser.user.status === "suspended" && (
                <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 text-xs">
                  <div className="font-bold flex items-center gap-1.5 mb-1">
                    <AlertTriangle className="size-3.5" />
                    <span>Account Suspended</span>
                  </div>
                  <p className="text-[11px] leading-relaxed">
                    <strong>Reason:</strong> {selectedUser.user.suspendedReason || "Platform policy violation"}
                  </p>
                  {selectedUser.user.suspendedAt && (
                    <p className="text-[10px] font-mono mt-1 opacity-80">
                      Suspended on: {new Date(selectedUser.user.suspendedAt).toLocaleString()}
                    </p>
                  )}
                </div>
              )}

              {/* Statistics Counters */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                <div className="p-3 rounded-xl border border-border bg-card">
                  <div className="text-muted-foreground text-[10px] uppercase font-mono">Borrowing Requests</div>
                  <div className="text-lg font-bold font-mono text-foreground mt-0.5">
                    {selectedUser.stats.bookingsAsBorrower}
                  </div>
                </div>
                <div className="p-3 rounded-xl border border-border bg-card">
                  <div className="text-muted-foreground text-[10px] uppercase font-mono">Resources Owned</div>
                  <div className="text-lg font-bold font-mono text-foreground mt-0.5">
                    {selectedUser.stats.resourcesOwned}
                  </div>
                </div>
                <div className="p-3 rounded-xl border border-border bg-card">
                  <div className="text-muted-foreground text-[10px] uppercase font-mono">Loans Facilitated</div>
                  <div className="text-lg font-bold font-mono text-foreground mt-0.5">
                    {selectedUser.stats.bookingsReceived}
                  </div>
                </div>
                <div className="p-3 rounded-xl border border-border bg-card">
                  <div className="text-muted-foreground text-[10px] uppercase font-mono">Disputes Involved</div>
                  <div className="text-lg font-bold font-mono text-foreground mt-0.5">
                    {selectedUser.stats.disputesInvolved}
                  </div>
                </div>
                <div className="p-3 rounded-xl border border-border bg-card">
                  <div className="text-muted-foreground text-[10px] uppercase font-mono">Reports Against</div>
                  <div className="text-lg font-bold font-mono text-foreground mt-0.5 text-rose-500">
                    {selectedUser.stats.reportsAgainst}
                  </div>
                </div>
                <div className="p-3 rounded-xl border border-border bg-card">
                  <div className="text-muted-foreground text-[10px] uppercase font-mono">Reports Filed</div>
                  <div className="text-lg font-bold font-mono text-foreground mt-0.5">
                    {selectedUser.stats.reportsFiled}
                  </div>
                </div>
              </div>

              {/* Audit History */}
              <div className="space-y-2">
                <h4 className="font-semibold text-foreground flex items-center gap-1.5">
                  <History className="size-3.5 text-muted-foreground" />
                  <span>Recent Security & Activity History</span>
                </h4>
                <div className="border border-border rounded-xl divide-y divide-border/60 max-h-48 overflow-y-auto">
                  {selectedUser.auditLogs.length === 0 ? (
                    <div className="p-4 text-center text-muted-foreground font-mono text-[11px]">
                      No audit history for this user.
                    </div>
                  ) : (
                    selectedUser.auditLogs.map((log) => (
                      <div key={log.id} className="p-2.5 flex items-center justify-between text-[11px]">
                        <div>
                          <span className="font-mono font-bold text-foreground mr-2">{log.action}</span>
                          <span className="text-muted-foreground font-mono text-[10px]">{log.entityType}</span>
                        </div>
                        <span className="text-muted-foreground font-mono text-[10px]">
                          {new Date(log.timestamp).toLocaleString()}
                        </span>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          )}

          <DialogFooter className="pt-2">
            <button
              type="button"
              onClick={() => setSelectedUser(null)}
              className="px-4 py-2 rounded-xl text-xs font-medium border border-border bg-card hover:bg-muted text-foreground transition-colors"
            >
              Close
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Suspend Confirmation Dialog */}
      <Dialog open={!!suspendingUser} onOpenChange={(open) => !open && setSuspendingUser(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-base font-bold text-rose-600 dark:text-rose-400">
              <UserX className="size-4" />
              <span>Suspend Member Account</span>
            </DialogTitle>
            <DialogDescription className="text-xs">
              Suspending this account will immediately revoke login sessions and conceal user listings.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3 pt-2 text-xs">
            <div className="p-3 rounded-xl bg-muted/40 border border-border">
              <div className="font-semibold text-foreground">{suspendingUser?.fullName}</div>
              <div className="text-muted-foreground text-[11px] font-mono">{suspendingUser?.email}</div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-foreground mb-1">
                Mandatory Suspension Reason:
              </label>
              <textarea
                rows={3}
                placeholder="Specify violation or operational reason (e.g. Terms violation, unreturned equipment, multiple disputes)..."
                value={suspendReason}
                onChange={(e) => setSuspendReason(e.target.value)}
                className="w-full p-2.5 text-xs rounded-xl bg-muted/30 border border-border text-foreground focus:outline-hidden focus:ring-1 focus:ring-foreground"
              />
            </div>
          </div>

          <DialogFooter className="pt-3">
            <button
              type="button"
              onClick={() => setSuspendingUser(null)}
              disabled={actionLoading}
              className="px-4 py-2 rounded-xl text-xs font-medium border border-border bg-card hover:bg-muted text-foreground transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSuspendUser}
              disabled={actionLoading || !suspendReason.trim()}
              className="px-4 py-2 rounded-xl text-xs font-medium bg-rose-600 text-white hover:bg-rose-700 transition-colors disabled:opacity-50 cursor-pointer"
            >
              {actionLoading ? "Suspending..." : "Confirm Suspension"}
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Role Change Dialog */}
      <Dialog open={!!roleChangingUser} onOpenChange={(open) => !open && setRoleChangingUser(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-base font-bold text-foreground">
              <KeyRound className="size-4" />
              <span>Modify User Role</span>
            </DialogTitle>
            <DialogDescription className="text-xs">
              Adjust account permissions across borrower, equipment owner, or administrator.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 pt-2 text-xs">
            <div className="p-3 rounded-xl bg-muted/40 border border-border">
              <div className="font-semibold text-foreground">{roleChangingUser?.fullName}</div>
              <div className="text-muted-foreground text-[11px]">
                Current Role: <span className="font-mono uppercase font-bold text-foreground">{roleChangingUser?.role}</span>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-foreground mb-1.5">
                Assign New Role:
              </label>
              <select
                value={targetRole}
                onChange={(e) => setTargetRole(e.target.value as any)}
                className="w-full px-3 py-2 text-xs rounded-xl bg-muted/30 border border-border text-foreground focus:outline-hidden focus:ring-1 focus:ring-foreground font-mono"
              >
                <option value="borrower">Borrower (Can borrow community gear)</option>
                <option value="owner">Owner (Can list resources and manage bookings)</option>
                <option value="admin">Administrator (Full operational & moderation control)</option>
              </select>
            </div>
          </div>

          <DialogFooter className="pt-3">
            <button
              type="button"
              onClick={() => setRoleChangingUser(null)}
              disabled={actionLoading}
              className="px-4 py-2 rounded-xl text-xs font-medium border border-border bg-card hover:bg-muted text-foreground transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleRoleChange}
              disabled={actionLoading || targetRole === roleChangingUser?.role}
              className="px-4 py-2 rounded-xl text-xs font-medium bg-foreground text-background hover:opacity-90 transition-opacity disabled:opacity-50 cursor-pointer"
            >
              {actionLoading ? "Updating..." : "Update Role"}
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
