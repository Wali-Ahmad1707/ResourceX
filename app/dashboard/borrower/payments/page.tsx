"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  CreditCard,
  CheckCircle2,
  Clock,
  RotateCcw,
  XCircle,
  FileText,
  ShieldCheck,
  ChevronRight,
  ArrowLeft,
  Loader2,
  Download,
  AlertCircle,
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
  failureReason: string | null;
  createdAt: string;
  paidAt: string | null;
  resourceTitle?: string;
  borrowerName?: string;
  ownerName?: string;
  refundedAmount?: number;
}

export default function BorrowerPaymentsPage() {
  const [payments, setPayments] = useState<DbPaymentWithDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedReceipt, setSelectedReceipt] = useState<DbPaymentWithDetails | null>(null);

  useEffect(() => {
    fetchPayments();
  }, []);

  async function fetchPayments() {
    setLoading(true);
    try {
      const res = await fetch("/api/payments/borrower");
      if (!res.ok) throw new Error("Failed to load payment history");
      const data = await res.json();
      setPayments(data.payments || []);
    } catch (err: any) {
      toast.error(err.message || "Could not retrieve payments");
    } finally {
      setLoading(false);
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "captured":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
            <CheckCircle2 className="size-3" /> Paid & Held in Escrow
          </span>
        );
      case "refunded":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20">
            <RotateCcw className="size-3" /> Deposit Refunded
          </span>
        );
      case "partially_refunded":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
            <RotateCcw className="size-3" /> Partially Refunded
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
      <div className="container mx-auto px-4 py-8 max-w-5xl">
        {/* Top Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-border">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Link
                href="/profile"
                className="text-xs font-medium text-muted-foreground hover:text-foreground flex items-center gap-1 transition-colors"
              >
                <ArrowLeft className="size-3.5" /> Back to Profile
              </Link>
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2.5">
              <CreditCard className="size-6 text-foreground" />
              My Payments & Security Deposits
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              Track refundable security deposits paid for your equipment reservations.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-card border border-border text-foreground shadow-2xs">
              <ShieldCheck className="size-3.5 text-emerald-500" />
              Escrow Protection Active
            </span>
          </div>
        </div>

        {/* Security Deposit Explainer Box */}
        <div className="my-6 p-4 rounded-2xl bg-card border border-border flex items-start gap-3.5 shadow-xs">
          <div className="p-2 rounded-xl bg-foreground/5 text-foreground shrink-0 mt-0.5">
            <ShieldCheck className="size-5" />
          </div>
          <div className="text-xs space-y-1">
            <p className="font-semibold text-foreground">How ResourceX Security Deposits Work</p>
            <p className="text-muted-foreground leading-relaxed">
              Security deposits are held in secure platform escrow while you use borrowed equipment. When you return the item in good condition, the deposit is promptly returned to your original payment method.
            </p>
          </div>
        </div>

        {/* Payments Table / List */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-foreground">Transaction History</h2>
            <span className="text-xs text-muted-foreground font-mono">{payments.length} record(s)</span>
          </div>

          <div className="rounded-2xl border border-border bg-card overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-border/60 bg-muted/40 text-muted-foreground font-medium">
                    <th className="py-3 px-4">Resource & Booking</th>
                    <th className="py-3 px-4">Owner</th>
                    <th className="py-3 px-4">Deposit Amount</th>
                    <th className="py-3 px-4">Deposit Status</th>
                    <th className="py-3 px-4">Payment Date</th>
                    <th className="py-3 px-4 text-right">Receipt</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/60">
                  {loading ? (
                    <tr>
                      <td colSpan={6} className="py-12 text-center text-muted-foreground">
                        <Loader2 className="size-5 animate-spin mx-auto mb-2 text-foreground" />
                        Loading transaction records...
                      </td>
                    </tr>
                  ) : payments.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-12 text-center text-muted-foreground">
                        No security deposit payments found. When you borrow resources that require deposits, transactions will appear here.
                      </td>
                    </tr>
                  ) : (
                    payments.map((p) => (
                      <tr key={p.id} className="hover:bg-muted/30 transition-colors">
                        <td className="py-3 px-4">
                          <div className="font-semibold text-foreground">
                            {p.resourceTitle || "Borrowed Equipment"}
                          </div>
                          <div className="font-mono text-[10px] text-muted-foreground">
                            Booking: {p.bookingId.slice(0, 10)}...
                          </div>
                        </td>
                        <td className="py-3 px-4 text-muted-foreground font-medium">
                          {p.ownerName || "Resource Owner"}
                        </td>
                        <td className="py-3 px-4 font-mono font-bold text-foreground">
                          {formatPaiseToINR(p.amount)}
                        </td>
                        <td className="py-3 px-4">
                          {getStatusBadge(p.status)}
                        </td>
                        <td className="py-3 px-4 text-muted-foreground whitespace-nowrap">
                          {p.paidAt
                            ? new Date(p.paidAt).toLocaleDateString("en-IN", {
                                day: "numeric",
                                month: "short",
                                year: "numeric",
                              })
                            : new Date(p.createdAt).toLocaleDateString("en-IN", {
                                day: "numeric",
                                month: "short",
                                year: "numeric",
                              })}
                        </td>
                        <td className="py-3 px-4 text-right">
                          <button
                            onClick={() => setSelectedReceipt(p)}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border border-border hover:bg-muted text-foreground transition-colors"
                          >
                            <FileText className="size-3" />
                            <span>Receipt</span>
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

        {/* Receipt Modal */}
        {selectedReceipt && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
            <div className="bg-card border border-border rounded-2xl w-full max-w-md p-6 shadow-xl space-y-5 animate-in fade-in-50 zoom-in-95">
              <div className="flex items-start justify-between pb-3 border-b border-border">
                <div>
                  <h3 className="text-base font-bold text-foreground">Payment Receipt</h3>
                  <p className="text-xs text-muted-foreground font-mono">ResourceX Escrow Confirmation</p>
                </div>
                <button
                  onClick={() => setSelectedReceipt(null)}
                  className="text-muted-foreground hover:text-foreground text-sm font-bold"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-3 text-xs">
                <div className="p-4 rounded-xl bg-muted/40 border border-border space-y-2 font-mono">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Receipt Ref:</span>
                    <span className="font-semibold text-foreground">{selectedReceipt.id}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Payment ID:</span>
                    <span className="font-semibold text-foreground">{selectedReceipt.razorpayPaymentId || "N/A"}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Order ID:</span>
                    <span className="font-semibold text-foreground">{selectedReceipt.razorpayOrderId || "N/A"}</span>
                  </div>
                </div>

                <div className="space-y-2 pt-2">
                  <div className="flex justify-between text-muted-foreground">
                    <span>Resource Item:</span>
                    <span className="font-semibold text-foreground">{selectedReceipt.resourceTitle}</span>
                  </div>
                  <div className="flex justify-between text-muted-foreground">
                    <span>Equipment Owner:</span>
                    <span className="font-semibold text-foreground">{selectedReceipt.ownerName}</span>
                  </div>
                  <div className="flex justify-between text-muted-foreground">
                    <span>Booking Identifier:</span>
                    <span className="font-mono text-foreground">{selectedReceipt.bookingId}</span>
                  </div>
                  <div className="flex justify-between text-muted-foreground">
                    <span>Deposit Status:</span>
                    <span>{getStatusBadge(selectedReceipt.status)}</span>
                  </div>
                  <div className="flex justify-between text-muted-foreground pt-2 border-t border-border">
                    <span className="font-bold text-foreground">Total Paid:</span>
                    <span className="font-mono font-bold text-base text-foreground">
                      {formatPaiseToINR(selectedReceipt.amount)}
                    </span>
                  </div>
                  {selectedReceipt.refundedAmount && selectedReceipt.refundedAmount > 0 ? (
                    <div className="flex justify-between text-purple-600 dark:text-purple-400 font-medium">
                      <span>Refunded Amount:</span>
                      <span className="font-mono font-bold">
                        {formatPaiseToINR(selectedReceipt.refundedAmount)}
                      </span>
                    </div>
                  ) : null}
                </div>
              </div>

              <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-[11px] text-emerald-700 dark:text-emerald-400">
                This receipt certifies that security deposit funds are safely protected under the ResourceX Community Escrow Guarantee.
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-border">
                <button
                  onClick={() => setSelectedReceipt(null)}
                  className="px-4 py-2 rounded-xl text-xs font-medium bg-foreground text-background hover:opacity-90 transition-opacity"
                >
                  Close Receipt
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
