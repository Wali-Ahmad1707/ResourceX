"use client";

import React, { useState, useEffect } from "react";
import {
  ShieldCheck,
  CreditCard,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Lock,
  ArrowRight,
} from "lucide-react";
import { toast } from "sonner";
import { formatPaiseToINR } from "@/lib/currency";

interface DepositPaymentDialogProps {
  isOpen: boolean;
  onClose: () => void;
  bookingId: string;
  resourceTitle?: string;
  depositStr?: string;
  onSuccess: () => void;
}

export function DepositPaymentDialog({
  isOpen,
  onClose,
  bookingId,
  resourceTitle,
  depositStr,
  onSuccess,
}: DepositPaymentDialogProps) {
  const [loading, setLoading] = useState(false);
  const [orderData, setOrderData] = useState<{
    orderId: string;
    amount: number;
    currency: string;
    keyId: string;
    depositAmountFormatted: string;
  } | null>(null);
  const [verifying, setVerifying] = useState(false);

  useEffect(() => {
    if (isOpen && bookingId) {
      initiateOrder();
    } else {
      setOrderData(null);
    }
  }, [isOpen, bookingId]);

  async function initiateOrder() {
    setLoading(true);
    try {
      const res = await fetch("/api/payments/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bookingId }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to initialize payment order");

      setOrderData(data);
    } catch (err: any) {
      toast.error(err.message || "Could not initialize security deposit order");
      onClose();
    } finally {
      setLoading(false);
    }
  }

  async function handleCompleteTestPayment() {
    if (!orderData) return;
    setVerifying(true);

    try {
      const paymentId = `pay_test_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
      // For signature verification in test mode:
      // In local testing without external Razorpay popup, we generate test signature:
      // HMAC SHA256(`${orderId}|${paymentId}`, secret)
      // Or server verify endpoint handles test orders
      const res = await fetch("/api/payments/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orderId: orderData.orderId,
          paymentId: paymentId,
          // Test signature for client test mode
          signature: "test_signature_valid",
        }),
      });

      const verifyData = await res.json();
      if (!res.ok) throw new Error(verifyData.error || "Payment verification failed");

      toast.success("Security deposit successfully paid and secured!");
      onSuccess();
      onClose();
    } catch (err: any) {
      toast.error(err.message || "Payment verification failed");
    } finally {
      setVerifying(false);
    }
  }

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
      <div className="bg-card border border-border rounded-2xl w-full max-w-md p-6 shadow-xl space-y-5 animate-in fade-in-50 zoom-in-95">
        <div className="flex items-start justify-between pb-3 border-b border-border">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold text-foreground">Pay Security Deposit</h3>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-mono font-medium bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                Razorpay Test Mode
              </span>
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">
              Refundable deposit hold for {resourceTitle || "equipment reservation"}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground text-sm font-bold"
          >
            ✕
          </button>
        </div>

        {loading ? (
          <div className="py-12 text-center text-xs text-muted-foreground space-y-2">
            <Loader2 className="size-6 animate-spin mx-auto text-foreground" />
            <p>Creating Razorpay Test Order...</p>
          </div>
        ) : orderData ? (
          <div className="space-y-4">
            <div className="p-4 rounded-xl bg-muted/40 border border-border space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Equipment:</span>
                <span className="font-semibold text-foreground">{resourceTitle}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Order Ref:</span>
                <span className="font-mono text-[11px] text-foreground">{orderData.orderId}</span>
              </div>
              <div className="flex justify-between pt-2 border-t border-border/80">
                <span className="font-semibold text-foreground">Security Deposit Amount:</span>
                <span className="font-mono font-bold text-base text-foreground">
                  {orderData.depositAmountFormatted || formatPaiseToINR(orderData.amount)}
                </span>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-start gap-2.5 text-xs text-emerald-700 dark:text-emerald-400">
              <ShieldCheck className="size-4 shrink-0 mt-0.5" />
              <span>
                Your deposit is securely held by the platform until the item is returned. Upon verified inspection and safe return, it is refunded to your original payment method.
              </span>
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-border">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl text-xs font-medium border border-border hover:bg-muted text-foreground transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={verifying}
                onClick={handleCompleteTestPayment}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold bg-foreground text-background hover:opacity-90 transition-opacity disabled:opacity-50"
              >
                {verifying ? (
                  <>
                    <Loader2 className="size-3.5 animate-spin" />
                    <span>Verifying...</span>
                  </>
                ) : (
                  <>
                    <CreditCard className="size-3.5" />
                    <span>Authorize Test Deposit ({orderData.depositAmountFormatted})</span>
                  </>
                )}
              </button>
            </div>
          </div>
        ) : (
          <div className="py-6 text-center text-xs text-destructive">
            Failed to load order information. Please try again.
          </div>
        )}
      </div>
    </div>
  );
}
