"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/use-auth";
import { toast } from "sonner";
import { 
  ArrowRight, 
  Check, 
  Eye, 
  EyeOff, 
  ShieldCheck, 
  Compass, 
  Lock, 
  Mail, 
  User, 
  Phone,
  Sparkles,
  AlertCircle,
  Loader2
} from "lucide-react";

export default function RegisterPage() {
  const router = useRouter();
  const { user, register, isLoading: authLoading } = useAuth();

  // Role state: 'borrower' | 'owner'
  const [role, setRole] = useState<"borrower" | "owner">("borrower");

  // Form fields
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [terms, setTerms] = useState(false);

  // UI state
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Redirect if already authenticated
  useEffect(() => {
    if (!authLoading && user) {
      router.replace("/profile");
    }
  }, [user, authLoading, router]);

  // Password rules validation
  const hasMinLength = password.length >= 8;
  const hasUpper = /[A-Z]/.test(password);
  const hasLower = /[a-z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const isPasswordValid = hasMinLength && hasUpper && hasLower && hasNumber;
  const passwordsMatch = password.length > 0 && password === confirmPassword;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    // Validation
    if (!fullName.trim() || fullName.trim().length < 2) {
      setErrorMessage("Please enter your full legal name (at least 2 characters).");
      return;
    }
    if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setErrorMessage("Please enter a valid email address.");
      return;
    }
    if (!phone.trim() || phone.trim().length < 7) {
      setErrorMessage("Please provide a valid phone number for account verification.");
      return;
    }
    if (!isPasswordValid) {
      setErrorMessage("Password does not meet all security requirements.");
      return;
    }
    if (!passwordsMatch) {
      setErrorMessage("Passwords do not match.");
      return;
    }
    if (!terms) {
      setErrorMessage("You must agree to the ResourceX Community Guidelines & Terms of Service.");
      return;
    }

    setIsSubmitting(true);

    try {
      const res = await register({
        fullName: fullName.trim(),
        email: email.trim().toLowerCase(),
        phone: phone.trim(),
        password,
        confirmPassword,
        role,
        terms,
      });

      if (!res.success) {
        setErrorMessage(res.error || "Registration failed. Please check your details.");
        toast.error(res.error || "Registration failed");
        setIsSubmitting(false);
        return;
      }

      toast.success(`Welcome to ResourceX! Your ${role} account is ready.`);
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
      <div className="w-full max-w-xl mx-auto flex items-center justify-between pb-8">
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
          href="/login" 
          className="text-xs font-medium text-muted-foreground hover:text-foreground transition-colors"
        >
          Already a member? <span className="underline underline-offset-4 text-foreground font-semibold">Log in</span>
        </Link>
      </div>

      {/* Main Registration Card */}
      <div className="w-full max-w-xl mx-auto bg-card border border-border/70 rounded-2xl p-6 sm:p-10 shadow-xl shadow-black/5 dark:shadow-black/20">
        <div className="space-y-2 mb-8">
          <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-muted border border-border text-[11px] font-mono uppercase tracking-wider text-muted-foreground">
            <Sparkles className="size-3" />
            <span>Join The Community</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Create your ResourceX account</h1>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Choose your community role and gain instant access to verified local tool and equipment sharing.
          </p>
        </div>

        {errorMessage && (
          <div className="mb-6 p-4 rounded-xl bg-destructive/10 border border-destructive/30 flex items-start gap-3 text-destructive text-sm">
            <AlertCircle className="size-5 shrink-0 mt-0.5" />
            <div className="leading-snug">{errorMessage}</div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Role Selection */}
          <div className="space-y-3">
            <label className="block text-xs font-mono uppercase tracking-wider text-muted-foreground font-medium">
              1. Select Primary Role
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Borrower Option */}
              <button
                type="button"
                onClick={() => setRole("borrower")}
                className={`relative flex flex-col text-left p-4 rounded-xl border-2 transition-all cursor-pointer ${
                  role === "borrower"
                    ? "border-foreground bg-foreground/[0.03] dark:bg-white/[0.04] shadow-xs"
                    : "border-border hover:border-border/80 bg-background"
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="size-8 rounded-lg bg-foreground/10 flex items-center justify-center">
                    <Compass className="size-4 text-foreground" />
                  </div>
                  {role === "borrower" && (
                    <div className="size-5 rounded-full bg-foreground text-background flex items-center justify-center">
                      <Check className="size-3" />
                    </div>
                  )}
                </div>
                <div className="font-semibold text-sm">Borrower</div>
                <p className="text-xs text-muted-foreground mt-1 leading-snug">
                  Borrow tools, camping gear, and electronics when you need them.
                </p>
                <div className="mt-3 pt-3 border-t border-border/50 flex items-center gap-1.5 text-[11px] text-muted-foreground font-mono">
                  <span>Pay-per-use access</span>
                </div>
              </button>

              {/* Owner Option */}
              <button
                type="button"
                onClick={() => setRole("owner")}
                className={`relative flex flex-col text-left p-4 rounded-xl border-2 transition-all cursor-pointer ${
                  role === "owner"
                    ? "border-foreground bg-foreground/[0.03] dark:bg-white/[0.04] shadow-xs"
                    : "border-border hover:border-border/80 bg-background"
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="size-8 rounded-lg bg-foreground/10 flex items-center justify-center">
                    <ShieldCheck className="size-4 text-foreground" />
                  </div>
                  {role === "owner" && (
                    <div className="size-5 rounded-full bg-foreground text-background flex items-center justify-center">
                      <Check className="size-3" />
                    </div>
                  )}
                </div>
                <div className="font-semibold text-sm">Resource Owner</div>
                <p className="text-xs text-muted-foreground mt-1 leading-snug">
                  List underused resources, earn passive returns, and support locals.
                </p>
                <div className="mt-3 pt-3 border-t border-border/50 flex items-center gap-1.5 text-[11px] text-muted-foreground font-mono">
                  <span>Security deposit secured</span>
                </div>
              </button>
            </div>
          </div>

          {/* User Details */}
          <div className="space-y-4 pt-2">
            <label className="block text-xs font-mono uppercase tracking-wider text-muted-foreground font-medium">
              2. Your Profile Details
            </label>

            {/* Full Name */}
            <div>
              <label className="block text-xs font-medium mb-1.5 text-foreground">
                Full Name
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-muted-foreground">
                  <User className="size-4" />
                </div>
                <input
                  type="text"
                  required
                  placeholder="e.g. Maya Lin"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-foreground/20 focus:border-foreground transition-all"
                />
              </div>
            </div>

            {/* Email & Phone grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
                    placeholder="maya@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-foreground/20 focus:border-foreground transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium mb-1.5 text-foreground">
                  Phone Number
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-muted-foreground">
                    <Phone className="size-4" />
                  </div>
                  <input
                    type="tel"
                    required
                    placeholder="+1 (555) 234-5678"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-foreground/20 focus:border-foreground transition-all"
                  />
                </div>
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-xs font-medium mb-1.5 text-foreground">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-muted-foreground">
                  <Lock className="size-4" />
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  placeholder="Create a strong password"
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

              {/* Password strength checklist */}
              <div className="mt-2.5 p-3 rounded-lg bg-muted/50 border border-border/50 text-[11px] grid grid-cols-2 gap-1.5">
                <div className={`flex items-center gap-1.5 ${hasMinLength ? "text-emerald-600 dark:text-emerald-400 font-medium" : "text-muted-foreground"}`}>
                  <div className={`size-3.5 rounded-full flex items-center justify-center text-[9px] ${hasMinLength ? "bg-emerald-500/20 text-emerald-600 dark:text-emerald-400" : "bg-border text-muted-foreground"}`}>
                    {hasMinLength ? "✓" : "•"}
                  </div>
                  <span>8+ characters</span>
                </div>
                <div className={`flex items-center gap-1.5 ${hasUpper ? "text-emerald-600 dark:text-emerald-400 font-medium" : "text-muted-foreground"}`}>
                  <div className={`size-3.5 rounded-full flex items-center justify-center text-[9px] ${hasUpper ? "bg-emerald-500/20 text-emerald-600 dark:text-emerald-400" : "bg-border text-muted-foreground"}`}>
                    {hasUpper ? "✓" : "•"}
                  </div>
                  <span>1 uppercase letter</span>
                </div>
                <div className={`flex items-center gap-1.5 ${hasLower ? "text-emerald-600 dark:text-emerald-400 font-medium" : "text-muted-foreground"}`}>
                  <div className={`size-3.5 rounded-full flex items-center justify-center text-[9px] ${hasLower ? "bg-emerald-500/20 text-emerald-600 dark:text-emerald-400" : "bg-border text-muted-foreground"}`}>
                    {hasLower ? "✓" : "•"}
                  </div>
                  <span>1 lowercase letter</span>
                </div>
                <div className={`flex items-center gap-1.5 ${hasNumber ? "text-emerald-600 dark:text-emerald-400 font-medium" : "text-muted-foreground"}`}>
                  <div className={`size-3.5 rounded-full flex items-center justify-center text-[9px] ${hasNumber ? "bg-emerald-500/20 text-emerald-600 dark:text-emerald-400" : "bg-border text-muted-foreground"}`}>
                    {hasNumber ? "✓" : "•"}
                  </div>
                  <span>1 number</span>
                </div>
              </div>
            </div>

            {/* Confirm Password */}
            <div>
              <label className="block text-xs font-medium mb-1.5 text-foreground">
                Confirm Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-muted-foreground">
                  <Lock className="size-4" />
                </div>
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  required
                  placeholder="Repeat your password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className={`w-full pl-10 pr-10 py-2.5 rounded-lg border bg-background text-sm focus:outline-none focus:ring-2 transition-all ${
                    confirmPassword && !passwordsMatch 
                      ? "border-destructive focus:ring-destructive/20 focus:border-destructive" 
                      : confirmPassword && passwordsMatch 
                        ? "border-emerald-500 focus:ring-emerald-500/20 focus:border-emerald-500" 
                        : "border-border focus:ring-foreground/20 focus:border-foreground"
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showConfirmPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                </button>
              </div>
              {confirmPassword && !passwordsMatch && (
                <p className="mt-1 text-xs text-destructive">Passwords do not match.</p>
              )}
            </div>

            {/* Terms checkbox */}
            <div className="pt-2">
              <label className="flex items-start gap-2.5 cursor-pointer text-xs text-muted-foreground select-none">
                <input
                  type="checkbox"
                  required
                  checked={terms}
                  onChange={(e) => setTerms(e.target.checked)}
                  className="mt-0.5 rounded border-border text-foreground focus:ring-foreground"
                />
                <span>
                  I agree to the{" "}
                  <span className="text-foreground underline underline-offset-2">ResourceX Community Guidelines</span>
                  ,{" "}
                  <span className="text-foreground underline underline-offset-2">Peer Lending Policy</span>
                  , and accept liability for care of borrowed equipment.
                </span>
              </label>
            </div>
          </div>

          {/* Submit CTA */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full inline-flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-foreground text-background font-medium text-sm hover:opacity-90 active:scale-[0.99] transition-all disabled:opacity-50 cursor-pointer shadow-sm"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="size-4 animate-spin" />
                <span>Creating your account...</span>
              </>
            ) : (
              <>
                <span>Complete Registration</span>
                <ArrowRight className="size-4" />
              </>
            )}
          </button>
        </form>
      </div>

      {/* Footer info */}
      <div className="w-full max-w-xl mx-auto text-center pt-8 text-xs text-muted-foreground font-mono">
        ResourceX Identity & Trust Layer • Encrypted Session Management
      </div>
    </div>
  );
}