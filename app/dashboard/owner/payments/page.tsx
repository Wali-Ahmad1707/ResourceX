"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  CreditCard,
  CheckCircle2,
  Clock,
  RotateCcw,
  XCircle,
  ShieldCheck,
  ChevronRight,
  ArrowLeft,
  Loader2,
  FileText,
  Lock,
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
  borrowerEmail?: string;
  refundedAmount?: number;
}

export default function OwnerPaymentsPage() {
  const [payments, setPayments] = useState<DbPaymentWithDetails[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPayments();
  }, []);

  async function fetchPayments() {
    setLoading(true);
    try {
      const res = await fetch("/api/payments/owner");
      if (!res.ok) throw new Error("Failed to load owner security deposits");
      const data = await res.json();
      setPayments(data.payments || []);
    } catch (err: any) {
      toast.error(err.message || "Could not retrieve deposits");
    } finally {
      setLoading(false);
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "captured":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
            <CheckCircle2 className="size-3" /> Held in Platform Escrow
          </span>
        );
      case "refunded":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20">
            <RotateCcw className="size-3" /> Released to Borrower
          </span>
        );
      case "partially_refunded":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
            <RotateCcw className="size-3" /> Partially Released
          </span>
        );
      case "failed":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20">
            <XCircle className="size-3" /> Payment Failed
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

  const totalHeldInEscrowPaise = payments
    .filter((p) => p.status === "captured")
    .reduce((sum, p) => sum + (p.amount - (p.refundedAmount || 0)), 0);

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
              <Lock className="size-6 text-foreground" />
              Owner Security Deposits & Escrow
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              Protected security deposits held by ResourceX for your listed gear.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-card border border-border text-foreground shadow-2xs">
              <ShieldCheck className="size-3.5 text-emerald-500" />
              Owner Protection Guarantee
            </span>
          </div>
        </div>

        {/* Metrics Banner */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 my-6">
          <div className="p-4 rounded-2xl bg-card border border-border shadow-xs">
            <span className="text-xs font-medium text-muted-foreground">Active Escrow Protection</span>
            <div className="mt-2 text-2xl font-bold font-mono tracking-tight text-foreground">
              {formatPaiseToINR(totalHeldInEscrowPaise)}
            </div>
            <div className="mt-1 text-xs text-muted-foreground">
              Guaranteed collateral held for currently active bookings
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-card border border-border shadow-xs">
            <span className="text-xs font-medium text-muted-foreground">Protected Reservations</span>
            <div className="mt-2 text-2xl font-bold font-mono tracking-tight text-foreground">
              {payments.filter((p) => p.status === "captured").length} active
            </div>
            <div className="mt-1 text-xs text-muted-foreground">
              {payments.length} total deposit transactions recorded
            </div>
          </div>
        </div>

        {/* Deposits Table */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-foreground">Deposits for My Equipment</h2>
            <span className="text-xs text-muted-foreground font-mono">{payments.length} booking(s)</span>
          </div>

          <div className="rounded-2xl border border-border bg-card overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-border/60 bg-muted/40 text-muted-foreground font-medium">
                    <th className="py-3 px-4">Equipment Listing</th>
                    <th className="py-3 px-4">Borrower</th>
                    <th className="py-3 px-4">Deposit Collateral</th>
                    <th className="py-3 px-4">Escrow Status</th>
                    <th className="py-3 px-4">Payment Timestamp</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/60">
                  {loading ? (
                    <tr>
                      <td colSpan={5} className="py-12 text-center text-muted-foreground">
                        <Loader2 className="size-5 animate-spin mx-auto mb-2 text-foreground" />
                        Loading owner deposit records...
                      </td>
                    </tr>
                  ) : payments.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="py-12 text-center text-muted-foreground">
                        No deposits currently held. When borrowers reserve your equipment, their security deposits will be tracked here.
                      </td>
                    </tr>
                  ) : (
                    payments.map((p) => (
                      <tr key={p.id} className="hover:bg-muted/30 transition-colors">
                        <td className="py-3 px-4">
                          <div className="font-semibold text-foreground">
                            {p.resourceTitle || "Your Equipment"}
                          </div>
                          <div className="font-mono text-[10px] text-muted-foreground">
                            Booking: {p.bookingId.slice(0, 10)}...
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <div className="font-medium text-foreground">{p.borrowerName || "Borrower"}</div>
                          <div className="text-[10px] text-muted-foreground">{p.borrowerEmail}</div>
                        </td>
                        <td className="py-3 px-4 font-mono font-bold text-foreground">
                          {formatPaiseToINR(p.amount)}
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
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
