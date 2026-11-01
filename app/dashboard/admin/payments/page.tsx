"use client";

import React, { useState, useEffect } from "react";
import { AdminNav } from "@/components/admin-nav";
import {
  CreditCard,
  Search,
  Filter,
  RefreshCw,
  Loader2,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  RotateCcw,
  Eye,
  ArrowUpRight,
  ShieldCheck,
  Clock,
  DollarSign,
  ChevronRight,
  Radio,
  FileCode,
} from "lucide-react";
import { toast } from "sonner";
import { formatPaiseToINR } from "@/lib/currency";

interface DbPaymentWithDetails {
  id: string;
  userId: string;
  bookingId: string;
  resourceId: string;
  ownerId: string;
  amount: number;
  currency: string;
  paymentType: string;
  status: string;
  razorpayOrderId: string | null;
  razorpayPaymentId: string | null;
  razorpaySignature: string | null;
  failureReason: string | null;
  createdAt: string;
  updatedAt: string;
  paidAt: string | null;
  resourceTitle?: string;
  borrowerName?: string;
  borrowerEmail?: string;
  ownerName?: string;
  ownerEmail?: string;
  refundedAmount?: number;
}

interface AdminPaymentMetrics {
  totalVolumePaise: number;
  totalTransactions: number;
  successfulPayments: number;
  failedPayments: number;
  totalRefundsCount: number;
  totalRefundedPaise: number;
  pendingRefundsCount: number;
  statusDistribution: { status: string; count: number }[];
  recentPayments: DbPaymentWithDetails[];
}

interface WebhookEvent {
  id: string;
  eventId: string;
  eventType: string;
  payload: string;
  processingStatus: string;
  receivedAt: string;
  processedAt: string | null;
}

export default function AdminPaymentsPage() {
  const [activeTab, setActiveTab] = useState<"transactions" | "webhooks">("transactions");
  const [payments, setPayments] = useState<DbPaymentWithDetails[]>([]);
  const [metrics, setMetrics] = useState<AdminPaymentMetrics | null>(null);
  const [webhooks, setWebhooks] = useState<WebhookEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  // Refund Modal State
  const [selectedPayment, setSelectedPayment] = useState<DbPaymentWithDetails | null>(null);
  const [refundAmountRupees, setRefundAmountRupees] = useState<string>("");
  const [refundReason, setRefundReason] = useState("Equipment returned in good condition");
  const [refundNotes, setRefundNotes] = useState("");
  const [processingRefund, setProcessingRefund] = useState(false);

  // Webhook details modal
  const [inspectedWebhook, setInspectedWebhook] = useState<WebhookEvent | null>(null);

  useEffect(() => {
    fetchPaymentsData();
  }, [statusFilter]);

  async function fetchPaymentsData() {
    setLoading(true);
    try {
      const queryParams = new URLSearchParams();
      if (statusFilter !== "all") queryParams.append("status", statusFilter);
      if (search.trim()) queryParams.append("search", search.trim());

      const res = await fetch(`/api/admin/payments?${queryParams.toString()}`);
      if (!res.ok) throw new Error("Failed to load payments");
      const data = await res.json();
      setPayments(data.payments || []);
      setMetrics(data.metrics || null);
    } catch (err: any) {
      toast.error(err.message || "Failed to load payment data");
    } finally {
      setLoading(false);
    }
  }

  async function fetchWebhooks() {
    try {
      const res = await fetch("/api/admin/payments/webhooks");
      if (res.ok) {
        const data = await res.json();
        setWebhooks(data.events || []);
      }
    } catch {
      // ignore
    }
  }

  function handleSearchSubmit(e: React.FormEvent) {
    e.preventDefault();
    fetchPaymentsData();
  }

  function openRefundModal(payment: DbPaymentWithDetails) {
    setSelectedPayment(payment);
    const remainingPaise = payment.amount - (payment.refundedAmount || 0);
    setRefundAmountRupees((remainingPaise / 100).toFixed(2));
    setRefundReason("Equipment returned in good condition");
    setRefundNotes("");
  }

  async function handleProcessRefund(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedPayment) return;

    const parsedRupees = parseFloat(refundAmountRupees);
    if (isNaN(parsedRupees) || parsedRupees <= 0) {
      toast.error("Please enter a valid refund amount");
      return;
    }

    const amountPaise = Math.round(parsedRupees * 100);
    const remainingPaise = selectedPayment.amount - (selectedPayment.refundedAmount || 0);

    if (amountPaise > remainingPaise) {
      toast.error(`Refund amount exceeds remaining refundable balance of ₹${(remainingPaise / 100).toFixed(2)}`);
      return;
    }

    setProcessingRefund(true);
    try {
      const res = await fetch(`/api/payments/${selectedPayment.id}/refund`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: amountPaise,
          reason: refundReason,
          notes: refundNotes,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to process refund");

      toast.success("Security deposit refund processed successfully");
      setSelectedPayment(null);
      fetchPaymentsData();
    } catch (err: any) {
      toast.error(err.message || "Refund processing failed");
    } finally {
      setProcessingRefund(false);
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "captured":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
            <CheckCircle2 className="size-3" /> Captured
          </span>
        );
      case "refunded":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20">
            <RotateCcw className="size-3" /> Refunded
          </span>
        );
      case "partially_refunded":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
            <RotateCcw className="size-3" /> Partial Refund
          </span>
        );
      case "failed":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20">
            <XCircle className="size-3" /> Failed
          </span>
        );
      case "created":
      case "pending":
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-muted text-muted-foreground border border-border">
            <Clock className="size-3" /> {status}
          </span>
        );
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Admin Navigation Sidebar */}
          <AdminNav />

          {/* Main Content Area */}
          <main className="flex-1 min-w-0 space-y-6">
            {/* Top Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-border">
              <div>
                <div className="flex items-center gap-2.5">
                  <h1 className="text-2xl font-bold tracking-tight text-foreground">
                    Payments & Deposits
                  </h1>
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-mono font-medium bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                    <span className="size-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    Razorpay Test Mode
                  </span>
                </div>
                <p className="text-sm text-muted-foreground mt-1">
                  Manage security deposits, escrow holds, and execute administrative refunds.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    fetchPaymentsData();
                    if (activeTab === "webhooks") fetchWebhooks();
                  }}
                  disabled={loading}
                  className="inline-flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium border border-border bg-card hover:bg-muted transition-colors disabled:opacity-50"
                >
                  <RefreshCw className={`size-3.5 ${loading ? "animate-spin" : ""}`} />
                  <span>Refresh</span>
                </button>
              </div>
            </div>

            {/* Metrics Overview Cards */}
            {metrics && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="p-4 rounded-2xl bg-card border border-border shadow-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium text-muted-foreground">Total Volume Captured</span>
                    <DollarSign className="size-4 text-emerald-500" />
                  </div>
                  <div className="mt-2 text-2xl font-bold font-mono tracking-tight text-foreground">
                    {formatPaiseToINR(metrics.totalVolumePaise)}
                  </div>
                  <div className="mt-1 text-xs text-muted-foreground flex items-center gap-1">
                    <span>{metrics.successfulPayments} successful payments</span>
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-card border border-border shadow-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium text-muted-foreground">Total Refunded</span>
                    <RotateCcw className="size-4 text-purple-500" />
                  </div>
                  <div className="mt-2 text-2xl font-bold font-mono tracking-tight text-foreground">
                    {formatPaiseToINR(metrics.totalRefundedPaise)}
                  </div>
                  <div className="mt-1 text-xs text-muted-foreground">
                    <span>{metrics.totalRefundsCount} refunds issued</span>
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-card border border-border shadow-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium text-muted-foreground">Total Transactions</span>
                    <CreditCard className="size-4 text-blue-500" />
                  </div>
                  <div className="mt-2 text-2xl font-bold font-mono tracking-tight text-foreground">
                    {metrics.totalTransactions}
                  </div>
                  <div className="mt-1 text-xs text-muted-foreground">
                    <span>Orders & payment attempts</span>
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-card border border-border shadow-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium text-muted-foreground">Failed Attempts</span>
                    <XCircle className="size-4 text-rose-500" />
                  </div>
                  <div className="mt-2 text-2xl font-bold font-mono tracking-tight text-foreground">
                    {metrics.failedPayments}
                  </div>
                  <div className="mt-1 text-xs text-muted-foreground">
                    <span>Declined or signature error</span>
                  </div>
                </div>
              </div>
            )}

            {/* Navigation Tabs */}
            <div className="flex items-center gap-2 border-b border-border">
              <button
                onClick={() => setActiveTab("transactions")}
                className={`px-4 py-2 text-xs font-medium border-b-2 transition-colors ${
                  activeTab === "transactions"
                    ? "border-foreground text-foreground font-semibold"
                    : "border-transparent text-muted-foreground hover:text-foreground"
                }`}
              >
                Payment Transactions
              </button>
              <button
                onClick={() => {
                  setActiveTab("webhooks");
                  fetchWebhooks();
                }}
                className={`px-4 py-2 text-xs font-medium border-b-2 transition-colors ${
                  activeTab === "webhooks"
                    ? "border-foreground text-foreground font-semibold"
                    : "border-transparent text-muted-foreground hover:text-foreground"
                }`}
              >
                Webhook Event Logs
              </button>
            </div>

            {/* Tab 1: Transactions */}
            {activeTab === "transactions" && (
              <div className="space-y-4">
                {/* Search and Filter Bar */}
                <div className="flex flex-col sm:flex-row gap-3">
                  <form onSubmit={handleSearchSubmit} className="relative flex-1">
                    <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                    <input
                      type="text"
                      placeholder="Search by Order ID, Payment ID, borrower name or resource..."
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 rounded-xl text-xs border border-border bg-card focus:outline-hidden focus:ring-2 focus:ring-foreground/20 text-foreground"
                    />
                  </form>

                  <div className="flex items-center gap-2">
                    <Filter className="size-3.5 text-muted-foreground" />
                    <select
                      value={statusFilter}
                      onChange={(e) => setStatusFilter(e.target.value)}
                      className="px-3 py-2 rounded-xl text-xs border border-border bg-card text-foreground focus:outline-hidden"
                    >
                      <option value="all">All Statuses</option>
                      <option value="captured">Captured</option>
                      <option value="refunded">Refunded</option>
                      <option value="partially_refunded">Partially Refunded</option>
                      <option value="failed">Failed</option>
                      <option value="created">Created</option>
                    </select>
                  </div>
                </div>

                {/* Transactions Table */}
                <div className="rounded-2xl border border-border bg-card overflow-hidden shadow-xs">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs border-collapse">
                      <thead>
                        <tr className="border-b border-border/60 bg-muted/40 text-muted-foreground font-medium">
                          <th className="py-3 px-4">Transaction ID / Order</th>
                          <th className="py-3 px-4">Resource & Borrower</th>
                          <th className="py-3 px-4">Amount</th>
                          <th className="py-3 px-4">Status</th>
                          <th className="py-3 px-4">Date</th>
                          <th className="py-3 px-4 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border/60">
                        {loading ? (
                          <tr>
                            <td colSpan={6} className="py-12 text-center text-muted-foreground">
                              <Loader2 className="size-5 animate-spin mx-auto mb-2 text-foreground" />
                              Loading platform transactions...
                            </td>
                          </tr>
                        ) : payments.length === 0 ? (
                          <tr>
                            <td colSpan={6} className="py-12 text-center text-muted-foreground">
                              No payment transactions found matching criteria.
                            </td>
                          </tr>
                        ) : (
                          payments.map((p) => {
                            const remainingRefundable = p.amount - (p.refundedAmount || 0);
                            const canRefund = (p.status === "captured" || p.status === "partially_refunded") && remainingRefundable > 0;

                            return (
                              <tr key={p.id} className="hover:bg-muted/30 transition-colors">
                                <td className="py-3 px-4">
                                  <div className="font-mono text-[11px] font-semibold text-foreground">
                                    {p.razorpayPaymentId || p.id}
                                  </div>
                                  <div className="font-mono text-[10px] text-muted-foreground truncate max-w-[140px]">
                                    {p.razorpayOrderId || "No order ref"}
                                  </div>
                                </td>
                                <td className="py-3 px-4">
                                  <div className="font-medium text-foreground truncate max-w-[200px]">
                                    {p.resourceTitle || "Resource Equipment"}
                                  </div>
                                  <div className="text-[11px] text-muted-foreground truncate max-w-[200px]">
                                    {p.borrowerName} ({p.borrowerEmail})
                                  </div>
                                </td>
                                <td className="py-3 px-4 font-mono font-medium">
                                  <div className="text-foreground">{formatPaiseToINR(p.amount)}</div>
                                  {p.refundedAmount && p.refundedAmount > 0 ? (
                                    <div className="text-[10px] text-purple-600 dark:text-purple-400">
                                      -{formatPaiseToINR(p.refundedAmount)} ref
                                    </div>
                                  ) : null}
                                </td>
                                <td className="py-3 px-4">
                                  {getStatusBadge(p.status)}
                                </td>
                                <td className="py-3 px-4 text-muted-foreground whitespace-nowrap">
                                  {new Date(p.createdAt).toLocaleDateString("en-IN", {
                                    day: "numeric",
                                    month: "short",
                                    year: "numeric",
                                  })}
                                </td>
                                <td className="py-3 px-4 text-right">
                                  {canRefund ? (
                                    <button
                                      onClick={() => openRefundModal(p)}
                                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-foreground text-background hover:opacity-90 transition-opacity"
                                    >
                                      <RotateCcw className="size-3" />
                                      <span>Issue Refund</span>
                                    </button>
                                  ) : (
                                    <span className="text-[11px] text-muted-foreground font-mono">
                                      {p.status === "refunded" ? "Fully Refunded" : "No Action"}
                                    </span>
                                  )}
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
            )}

            {/* Tab 2: Webhooks */}
            {activeTab === "webhooks" && (
              <div className="space-y-4">
                <div className="p-4 rounded-2xl bg-card border border-border flex items-start gap-3">
                  <Radio className="size-4 text-emerald-500 shrink-0 mt-0.5" />
                  <div className="text-xs text-muted-foreground space-y-1">
                    <p className="font-semibold text-foreground">Razorpay Webhooks Listener Active</p>
                    <p>Endpoint URL: <code className="font-mono text-foreground">/api/webhooks/razorpay</code></p>
                    <p>All incoming webhook signatures are verified using HMAC SHA-256 against <code className="font-mono text-foreground">RAZORPAY_WEBHOOK_SECRET</code>.</p>
                  </div>
                </div>

                <div className="rounded-2xl border border-border bg-card overflow-hidden shadow-xs">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs border-collapse">
                      <thead>
                        <tr className="border-b border-border/60 bg-muted/40 text-muted-foreground font-medium">
                          <th className="py-3 px-4">Event ID</th>
                          <th className="py-3 px-4">Event Type</th>
                          <th className="py-3 px-4">Status</th>
                          <th className="py-3 px-4">Received At</th>
                          <th className="py-3 px-4 text-right">Details</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border/60">
                        {webhooks.length === 0 ? (
                          <tr>
                            <td colSpan={5} className="py-12 text-center text-muted-foreground">
                              No webhook events recorded yet.
                            </td>
                          </tr>
                        ) : (
                          webhooks.map((w) => (
                            <tr key={w.id} className="hover:bg-muted/30 transition-colors">
                              <td className="py-3 px-4 font-mono text-[11px] font-semibold text-foreground">
                                {w.eventId}
                              </td>
                              <td className="py-3 px-4">
                                <span className="font-mono text-xs px-2 py-0.5 rounded-md bg-muted text-foreground">
                                  {w.eventType}
                                </span>
                              </td>
                              <td className="py-3 px-4">
                                <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-medium ${
                                  w.processingStatus === "processed"
                                    ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20"
                                    : "bg-muted text-muted-foreground border border-border"
                                }`}>
                                  {w.processingStatus}
                                </span>
                              </td>
                              <td className="py-3 px-4 text-muted-foreground">
                                {new Date(w.receivedAt).toLocaleString("en-IN")}
                              </td>
                              <td className="py-3 px-4 text-right">
                                <button
                                  onClick={() => setInspectedWebhook(w)}
                                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium border border-border hover:bg-muted transition-colors text-foreground"
                                >
                                  <FileCode className="size-3" />
                                  <span>Payload</span>
                                </button>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}
          </main>
        </div>
      </div>

      {/* Admin Refund Initiation Modal */}
      {selectedPayment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="bg-card border border-border rounded-2xl w-full max-w-lg p-6 shadow-xl space-y-5 animate-in fade-in-50 zoom-in-95">
            <div className="flex items-start justify-between pb-3 border-b border-border">
              <div>
                <h3 className="text-base font-bold text-foreground">Process Security Deposit Refund</h3>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Refund money back to borrower via Razorpay Test Mode.
                </p>
              </div>
              <button
                onClick={() => setSelectedPayment(null)}
                className="text-muted-foreground hover:text-foreground text-sm font-bold"
              >
                ✕
              </button>
            </div>

            <div className="p-3.5 rounded-xl bg-muted/40 border border-border/80 space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Resource:</span>
                <span className="font-semibold text-foreground">{selectedPayment.resourceTitle}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Borrower:</span>
                <span className="font-semibold text-foreground">{selectedPayment.borrowerName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Captured Deposit:</span>
                <span className="font-mono font-semibold text-foreground">{formatPaiseToINR(selectedPayment.amount)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Remaining Balance:</span>
                <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400">
                  {formatPaiseToINR(selectedPayment.amount - (selectedPayment.refundedAmount || 0))}
                </span>
              </div>
            </div>

            <form onSubmit={handleProcessRefund} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-foreground mb-1.5">
                  Refund Amount (₹ INR)
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="1"
                  max={(selectedPayment.amount - (selectedPayment.refundedAmount || 0)) / 100}
                  value={refundAmountRupees}
                  onChange={(e) => setRefundAmountRupees(e.target.value)}
                  required
                  className="w-full px-3.5 py-2.5 rounded-xl text-sm font-mono border border-border bg-card text-foreground focus:outline-hidden focus:ring-2 focus:ring-foreground/20"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-foreground mb-1.5">
                  Reason for Refund
                </label>
                <select
                  value={refundReason}
                  onChange={(e) => setRefundReason(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl text-xs border border-border bg-card text-foreground focus:outline-hidden"
                >
                  <option value="Equipment returned in good condition">Equipment returned in good condition (Full Deposit Return)</option>
                  <option value="Booking cancelled prior to handover">Booking cancelled prior to handover</option>
                  <option value="Mutual agreement between borrower and owner">Mutual agreement between borrower and owner</option>
                  <option value="Dispute resolved in borrower favor">Dispute resolved in borrower favor</option>
                  <option value="Partial return with damage deduction">Partial return with wear/damage deduction</option>
                  <option value="Other administrative adjustment">Other administrative adjustment</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-foreground mb-1.5">
                  Internal Administrative Notes (Optional)
                </label>
                <textarea
                  rows={2}
                  value={refundNotes}
                  onChange={(e) => setRefundNotes(e.target.value)}
                  placeholder="Additional context or inspection summary..."
                  className="w-full px-3.5 py-2 rounded-xl text-xs border border-border bg-card text-foreground focus:outline-hidden"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-border">
                <button
                  type="button"
                  onClick={() => setSelectedPayment(null)}
                  className="px-4 py-2 rounded-xl text-xs font-medium border border-border hover:bg-muted text-foreground transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={processingRefund}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold bg-foreground text-background hover:opacity-90 transition-opacity disabled:opacity-50"
                >
                  {processingRefund ? <Loader2 className="size-3.5 animate-spin" /> : <RotateCcw className="size-3.5" />}
                  <span>Authorize & Process Refund</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Webhook Payload Inspection Modal */}
      {inspectedWebhook && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="bg-card border border-border rounded-2xl w-full max-w-2xl p-6 shadow-xl space-y-4 animate-in fade-in-50">
            <div className="flex items-start justify-between pb-3 border-b border-border">
              <div>
                <h3 className="text-base font-bold text-foreground">Webhook Event Inspection</h3>
                <p className="font-mono text-xs text-muted-foreground mt-0.5">{inspectedWebhook.eventId} ({inspectedWebhook.eventType})</p>
              </div>
              <button
                onClick={() => setInspectedWebhook(null)}
                className="text-muted-foreground hover:text-foreground text-sm font-bold"
              >
                ✕
              </button>
            </div>

            <div className="p-4 rounded-xl bg-muted/60 border border-border overflow-x-auto max-h-96">
              <pre className="font-mono text-[11px] text-foreground leading-relaxed">
                {JSON.stringify(JSON.parse(inspectedWebhook.payload || "{}"), null, 2)}
              </pre>
            </div>

            <div className="flex justify-end">
              <button
                onClick={() => setInspectedWebhook(null)}
                className="px-4 py-2 rounded-xl text-xs font-medium bg-foreground text-background hover:opacity-90 transition-opacity"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
