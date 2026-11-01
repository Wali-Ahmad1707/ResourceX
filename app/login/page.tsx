"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/use-auth";
import { toast } from "sonner";
import { 
  ArrowRight, 
  Eye, 
  EyeOff, 
  Lock, 
  Mail, 
  Sparkles,
  AlertCircle,
  Loader2,
  KeyRound,
  Info
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export default function LoginPage() {
  const router = useRouter();
  const { user, login, isLoading: authLoading } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [forgotPasswordOpen, setForgotPasswordOpen] = useState(false);

  // Auto redirect if already logged in
  useEffect(() => {
    if (!authLoading && user) {
      router.replace("/profile");
    }
  }, [user, authLoading, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!email.trim()) {
      setErrorMessage("Please enter your email address.");
      return;
    }
    if (!password) {
      setErrorMessage("Please enter your password.");
      return;
    }

    setIsSubmitting(true);

    try {
      const res = await login({
        email: email.trim().toLowerCase(),
        password,
        rememberMe,
      });

      if (!res.success) {
        setErrorMessage(res.error || "Invalid email or password.");
        toast.error(res.error || "Authentication failed");
        setIsSubmitting(false);
        return;
      }

      toast.success("Welcome back to ResourceX!");
      router.push("/profile");
    } catch {
      setErrorMessage("An unexpected network error occurred. Please try again.");
      toast.error("Network error");
      setIsSubmitting(false);
    }
  };



  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col justify-between py-12 px-4 sm:px-6 lg:px-8 selection:bg-foreground selection:text-background">
      {/* Top Header / Brand */}
      <div className="w-full max-w-md mx-auto flex items-center justify-between pb-8">
        <Link 
          href="/" 
          className="text-lg font-semibold tracking-tight inline-flex items-center gap-1.5 hover:opacity-80 transition-opacity"
        >
          <span>Resource</span>
          <span className="font-mono text-xs px-1.5 py-0.5 rounded bg-foreground text-background uppercase tracking-widest font-bold">
            X
          </span>
        </Link>
        <Link 
          href="/register" 
          className="text-xs font-medium text-muted-foreground hover:text-foreground transition-colors"
        >
          New here? <span className="underline underline-offset-4 text-foreground font-semibold">Join free</span>
        </Link>
      </div>

      {/* Main Login Card */}
      <div className="w-full max-w-md mx-auto bg-card border border-border/70 rounded-2xl p-6 sm:p-10 shadow-xl shadow-black/5 dark:shadow-black/20">
        <div className="space-y-2 mb-8">
          <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-muted border border-border text-[11px] font-mono uppercase tracking-wider text-muted-foreground">
            <Sparkles className="size-3" />
            <span>Community Portal</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Sign in to ResourceX</h1>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Access your borrowing history, shared equipment, or manage community requests.
          </p>
        </div>

        {errorMessage && (
          <div className="mb-6 p-4 rounded-xl bg-destructive/10 border border-destructive/30 flex items-start gap-3 text-destructive text-sm">
            <AlertCircle className="size-5 shrink-0 mt-0.5" />
            <div className="leading-snug">{errorMessage}</div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Email Address */}
          <div>
            <label className="block text-xs font-medium mb-1.5 text-foreground">
              Email Address
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-muted-foreground">
                <Mail className="size-4" />
              </div>
              <input
                type="email"
                required
                autoComplete="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-foreground/20 focus:border-foreground transition-all"
              />
            </div>
          </div>

          {/* Password */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-medium text-foreground">
                Password
              </label>
              <button
                type="button"
                onClick={() => setForgotPasswordOpen(true)}
                className="text-xs text-muted-foreground hover:text-foreground transition-colors underline underline-offset-2"
              >
                Forgot password?
              </button>
            </div>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-muted-foreground">
                <Lock className="size-4" />
              </div>
              <input
                type={showPassword ? "text" : "password"}
                required
                autoComplete="current-password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-10 py-2.5 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-foreground/20 focus:border-foreground transition-all"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-muted-foreground hover:text-foreground transition-colors"
              >
                {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
              </button>
            </div>
          </div>

          {/* Remember me */}
          <div className="flex items-center justify-between pt-1">
            <label className="flex items-center gap-2 cursor-pointer text-xs text-muted-foreground select-none">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="rounded border-border text-foreground focus:ring-foreground"
              />
              <span>Remember me for 7 days</span>
            </label>
          </div>

          {/* Sign In CTA */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full inline-flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-foreground text-background font-medium text-sm hover:opacity-90 active:scale-[0.99] transition-all disabled:opacity-50 cursor-pointer shadow-sm"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="size-4 animate-spin" />
                <span>Verifying credentials...</span>
              </>
            ) : (
              <>
                <span>Sign In</span>
                <ArrowRight className="size-4" />
              </>
            )}
          </button>
        </form>

      </div>

      {/* Forgot Password Dialog */}
      <Dialog open={forgotPasswordOpen} onOpenChange={setForgotPasswordOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <div className="size-10 rounded-full bg-muted flex items-center justify-center mb-2">
              <KeyRound className="size-5 text-foreground" />
            </div>
            <DialogTitle>Reset your password</DialogTitle>
            <DialogDescription>
              Password recovery for ResourceX is tied to your verified community email address.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div className="p-3.5 rounded-xl bg-muted/60 border border-border text-xs leading-relaxed space-y-2">
              <div className="flex items-center gap-2 font-medium text-foreground">
                <Info className="size-4" />
                <span>Password Recovery Instructions</span>
              </div>
              <p className="text-muted-foreground">
                To reset your account password, please verify your email with the platform administrator or update your security credentials directly within your authenticated Profile Settings.
              </p>
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="button"
              onClick={() => setForgotPasswordOpen(false)}
              className="px-4 py-2 rounded-lg bg-foreground text-background text-xs font-medium hover:opacity-90 transition-opacity"
            >
              Understood
            </button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Footer info */}
      <div className="w-full max-w-md mx-auto text-center pt-8 text-xs text-muted-foreground font-mono">
        Secured with Scrypt & Cryptographic Session Tokens
      </div>
    </div>
  );
}