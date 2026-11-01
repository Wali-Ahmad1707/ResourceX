"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/use-auth";
import { Header } from "@/components/header";
import { FooterSection } from "@/components/sections/footer-section";
import { AdminNav } from "@/components/admin-nav";
import { Loader2, ShieldAlert } from "lucide-react";
import Link from "next/link";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const [badgeCounts, setBadgeCounts] = useState<{
    pendingResources?: number;
    activeDisputes?: number;
    openReports?: number;
  }>({});

  useEffect(() => {
    if (!isLoading && !user) {
      router.push("/login?redirect=/dashboard/admin");
    }
  }, [user, isLoading, router]);

  // Fetch count badges
  useEffect(() => {
    if (user?.role === "admin") {
      fetch("/api/admin/dashboard")
        .then((res) => res.json())
        .then((data) => {
          if (data.success && data.metrics) {
            setBadgeCounts({
              pendingResources: data.metrics.pendingReviewResources,
              activeDisputes: data.metrics.activeDisputes,
              openReports: data.metrics.openReports,
            });
          }
        })
        .catch(() => {});
    }
  }, [user]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="size-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!user || user.role !== "admin") {
    return (
      <div className="min-h-screen bg-background flex flex-col justify-between">
        <Header />
        <main className="max-w-md mx-auto px-4 py-32 text-center">
          <div className="size-14 rounded-2xl bg-destructive/10 text-destructive flex items-center justify-center mx-auto mb-4 border border-destructive/20">
            <ShieldAlert className="size-7" />
          </div>
          <h1 className="text-xl font-bold tracking-tight text-foreground mb-2">Access Denied</h1>
          <p className="text-sm text-muted-foreground mb-6">
            You must be signed into an authorized administrator account to access the ResourceX Admin Console.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href="/login"
              className="px-5 py-2.5 rounded-full bg-foreground text-background text-xs font-medium hover:opacity-90 transition-opacity"
            >
              Sign in as Admin
            </Link>
            <Link
              href="/"
              className="px-5 py-2.5 rounded-full border border-border text-foreground text-xs font-medium hover:bg-muted transition-colors"
            >
              Return to Home
            </Link>
          </div>
        </main>
        <FooterSection />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col justify-between text-foreground">
      <Header />
      <div className="pt-24 pb-16 flex-1">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row gap-8 items-start">
            <AdminNav counts={badgeCounts} />
            <main className="flex-1 min-w-0 w-full">{children}</main>
          </div>
        </div>
      </div>
      <FooterSection />
    </div>
  );
}
