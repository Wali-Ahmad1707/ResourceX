"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { 
  Menu, 
  X, 
  Compass, 
  LogIn, 
  ArrowRight, 
  User, 
  LogOut, 
  ShieldCheck, 
  Bell, 
  Check, 
  Clock,
  Sparkles,
  LayoutDashboard
} from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

interface NotificationItem {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: string;
  isRead: number;
  createdAt: string;
}

export function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const { user, logout } = useAuth();

  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  const fetchNotifications = useCallback(async () => {
    if (!user) return;
    try {
      const res = await fetch("/api/notifications");
      if (res.ok) {
        const data = await res.json();
        setNotifications(data.notifications || []);
        setUnreadCount(data.unreadCount || 0);
      }
    } catch {
      // ignore
    }
  }, [user]);

  useEffect(() => {
    if (user) {
      fetchNotifications();
      const interval = setInterval(fetchNotifications, 15000);
      return () => clearInterval(interval);
    }
  }, [user, fetchNotifications]);

  const markAllRead = async () => {
    try {
      await fetch("/api/notifications", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ all: true }),
      });
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: 1 })));
      setUnreadCount(0);
    } catch {
      // ignore
    }
  };

  const markOneRead = async (id: string) => {
    try {
      await fetch("/api/notifications", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ notificationId: id }),
      });
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, isRead: 1 } : n))
      );
      setUnreadCount((c) => Math.max(0, c - 1));
    } catch {
      // ignore
    }
  };

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleLogout = async () => {
    await logout();
    setIsMenuOpen(false);
  };

  return (
    <header 
      className={`fixed top-4 left-1/2 -translate-x-1/2 z-50 w-[92%] max-w-4xl transition-all duration-300 ${
        isScrolled 
          ? "bg-background/85 backdrop-blur-md rounded-full border border-border/40" 
          : "bg-transparent"
      }`}
      style={{
        boxShadow: isScrolled 
          ? "rgba(14, 63, 126, 0.04) 0px 0px 0px 1px, rgba(42, 51, 69, 0.04) 0px 1px 1px -0.5px, rgba(42, 51, 70, 0.04) 0px 3px 3px -1.5px, rgba(42, 51, 70, 0.04) 0px 6px 6px -3px, rgba(14, 63, 126, 0.04) 0px 12px 12px -6px, rgba(14, 63, 126, 0.04) 0px 24px 24px -12px" 
          : "none"
      }}
    >
      <div className="flex items-center justify-between transition-all duration-300 px-3 pl-5 py-2">
        {/* Logo */}
        <Link 
          href="/" 
          className={`text-lg font-semibold tracking-tight transition-colors duration-300 flex items-center gap-1.5 ${
            isScrolled ? "text-foreground" : "text-white"
          }`}
        >
          <span>Resource</span>
          <span className="font-mono text-xs px-1.5 py-0.5 rounded bg-foreground/10 dark:bg-white/10 uppercase tracking-widest font-bold">
            X
          </span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden items-center gap-7 lg:gap-8 md:flex">
          <Link
            href="/"
            className={`text-sm font-medium transition-colors ${
              isScrolled ? "text-muted-foreground hover:text-foreground" : "text-white/70 hover:text-white"
            }`}
          >
            Home
          </Link>
          <Link
            href="/resources"
            className={`inline-flex items-center gap-1.5 text-sm font-medium transition-colors ${
              isScrolled ? "text-muted-foreground hover:text-foreground" : "text-white/70 hover:text-white"
            }`}
          >
            <Compass className="size-3.5" />
            <span>Explore Resources</span>
          </Link>
          <Link
            href="/#how-it-works"
            className={`text-sm font-medium transition-colors ${
              isScrolled ? "text-muted-foreground hover:text-foreground" : "text-white/70 hover:text-white"
            }`}
          >
            How It Works
          </Link>
          {user && (
            <Link
              href={
                user.role === "admin"
                  ? "/dashboard/admin"
                  : user.role === "owner"
                  ? "/dashboard/owner"
                  : "/dashboard/borrower"
              }
              className={`inline-flex items-center gap-1.5 text-sm font-medium transition-colors ${
                isScrolled ? "text-foreground font-semibold" : "text-white font-semibold"
              }`}
            >
              {user.role === "admin" ? (
                <ShieldCheck className="size-3.5" />
              ) : (
                <LayoutDashboard className="size-3.5" />
              )}
              <span>
                {user.role === "admin"
                  ? "Admin Console"
                  : user.role === "owner"
                  ? "Owner Dashboard"
                  : "Borrower Dashboard"}
              </span>
            </Link>
          )}
        </nav>

        {/* CTA & Auth State */}
        <div className="hidden items-center gap-3 md:flex">
          {user ? (
            <div className="flex items-center gap-2.5">
              {/* Notifications Popover */}
              <Popover>
                <PopoverTrigger asChild>
                  <button
                    type="button"
                    aria-label="View notifications"
                    className={`relative p-2 rounded-full transition-colors cursor-pointer ${
                      isScrolled
                        ? "text-muted-foreground hover:text-foreground hover:bg-muted"
                        : "text-white/80 hover:text-white hover:bg-white/10"
                    }`}
                  >
                    <Bell className="size-4" />
                    {unreadCount > 0 && (
                      <span className="absolute top-1 right-1 size-2 rounded-full bg-blue-500 animate-pulse ring-2 ring-background" />
                    )}
                  </button>
                </PopoverTrigger>
                <PopoverContent align="end" className="w-80 p-0 shadow-xl border-border bg-card">
                  <div className="p-3 border-b border-border flex items-center justify-between">
                    <span className="text-xs font-semibold text-foreground">Notifications</span>
                    {unreadCount > 0 && (
                      <button
                        type="button"
                        onClick={markAllRead}
                        className="text-[11px] text-muted-foreground hover:text-foreground underline"
                      >
                        Mark all read
                      </button>
                    )}
                  </div>
                  <div className="max-h-80 overflow-y-auto divide-y divide-border/60">
                    {notifications.length === 0 ? (
                      <div className="p-6 text-center text-xs text-muted-foreground font-mono">
                        No notifications yet.
                      </div>
                    ) : (
                      notifications.map((n) => (
                        <div
                          key={n.id}
                          onClick={() => markOneRead(n.id)}
                          className={`p-3 text-xs cursor-pointer transition-colors hover:bg-muted/50 ${
                            n.isRead === 0 ? "bg-muted/30 font-medium" : "text-muted-foreground"
                          }`}
                        >
                          <div className="flex items-center justify-between mb-1">
                            <span className="font-semibold text-foreground text-[11px] truncate">{n.title}</span>
                            <span className="text-[10px] text-muted-foreground font-mono">
                              {new Date(n.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                            </span>
                          </div>
                          <p className="text-[11px] leading-relaxed line-clamp-2 text-muted-foreground">
                            {n.message}
                          </p>
                        </div>
                      ))
                    )}
                  </div>
                </PopoverContent>
              </Popover>

              {/* User Pill */}
              <Link
                href="/profile"
                className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
                  isScrolled
                    ? "bg-muted/70 hover:bg-muted text-foreground border-border"
                    : "bg-white/10 hover:bg-white/20 text-white border-white/20"
                }`}
              >
                <div className="size-5 rounded-full bg-foreground text-background dark:bg-white dark:text-black flex items-center justify-center font-mono text-[10px] font-bold">
                  {user.fullName.charAt(0).toUpperCase()}
                </div>
                <span className="font-medium max-w-[100px] truncate">{user.fullName.split(" ")[0]}</span>
                <span className="font-mono text-[10px] uppercase tracking-wider px-1.5 py-0.5 rounded bg-black/10 dark:bg-white/15">
                  {user.role}
                </span>
              </Link>

              <button
                type="button"
                onClick={handleLogout}
                title="Sign out"
                aria-label="Sign out"
                className={`p-1.5 rounded-full transition-colors ${
                  isScrolled
                    ? "text-muted-foreground hover:text-foreground hover:bg-muted"
                    : "text-white/70 hover:text-white hover:bg-white/10"
                }`}
              >
                <LogOut className="size-4" />
              </button>
            </div>
          ) : (
            <>
              <Link
                href="/login"
                className={`inline-flex items-center gap-1.5 text-sm font-medium transition-colors ${
                  isScrolled ? "text-muted-foreground hover:text-foreground" : "text-white/80 hover:text-white"
                }`}
              >
                <LogIn className="size-3.5" />
                <span>Login</span>
              </Link>
              <Link
                href="/register"
                className={`inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium transition-all rounded-full ${
                  isScrolled 
                    ? "bg-foreground text-background hover:opacity-85 shadow-xs" 
                    : "bg-white text-foreground hover:bg-white/90 shadow-sm"
                }`}
              >
                <span>Get Started</span>
                <ArrowRight className="size-3.5" />
              </Link>
            </>
          )}
        </div>

        {/* Mobile Menu Button */}
        <button
          type="button"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          className={`transition-colors p-1 md:hidden ${isScrolled ? "text-foreground" : "text-white"}`}
          aria-label="Toggle menu"
        >
          {isMenuOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="border-t border-border bg-background/95 backdrop-blur-xl px-6 py-6 md:hidden rounded-b-2xl shadow-xl">
          <nav className="flex flex-col gap-4">
            <Link
              href="/"
              className="text-base font-medium text-foreground hover:text-muted-foreground transition-colors"
              onClick={() => setIsMenuOpen(false)}
            >
              Home
            </Link>
            <Link
              href="/resources"
              className="inline-flex items-center gap-2 text-base font-medium text-foreground hover:text-muted-foreground transition-colors"
              onClick={() => setIsMenuOpen(false)}
            >
              <Compass className="size-4 text-muted-foreground" />
              <span>Explore Resources</span>
            </Link>
            <Link
              href="/#how-it-works"
              className="text-base font-medium text-foreground hover:text-muted-foreground transition-colors"
              onClick={() => setIsMenuOpen(false)}
            >
              How It Works
            </Link>
            <div className="h-px bg-border my-1" />

            {user ? (
              <div className="flex flex-col gap-3 pt-1">
                <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/60">
                  <div className="size-9 rounded-full bg-foreground text-background flex items-center justify-center font-bold text-sm">
                    {user.fullName.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex flex-col min-w-0">
                    <span className="font-medium text-sm text-foreground truncate">{user.fullName}</span>
                    <span className="text-xs text-muted-foreground truncate">{user.email}</span>
                  </div>
                  <span className="ml-auto font-mono text-[10px] uppercase tracking-wider px-2 py-0.5 rounded bg-background border border-border">
                    {user.role}
                  </span>
                </div>
                <Link
                  href={
                    user.role === "admin"
                      ? "/dashboard/admin"
                      : user.role === "owner"
                      ? "/dashboard/owner"
                      : "/dashboard/borrower"
                  }
                  className="inline-flex items-center justify-center gap-2 bg-foreground px-5 py-2.5 text-center text-sm font-medium text-background rounded-full hover:opacity-90 transition-opacity"
                  onClick={() => setIsMenuOpen(false)}
                >
                  {user.role === "admin" ? (
                    <ShieldCheck className="size-4" />
                  ) : (
                    <LayoutDashboard className="size-4" />
                  )}
                  <span>
                    {user.role === "admin"
                      ? "Admin Console"
                      : user.role === "owner"
                      ? "Owner Dashboard"
                      : "Borrower Dashboard"}
                  </span>
                </Link>
                <Link
                  href="/profile"
                  className="inline-flex items-center justify-center gap-2 border border-border text-foreground px-5 py-2 text-center text-sm font-medium rounded-full hover:bg-muted transition-colors"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <User className="size-4" />
                  <span>My Profile & Bookings</span>
                </Link>
                <button
                  type="button"
                  onClick={handleLogout}
                  className="inline-flex items-center justify-center gap-2 border border-border text-foreground px-5 py-2 text-center text-sm font-medium rounded-full hover:bg-muted transition-colors"
                >
                  <LogOut className="size-4" />
                  <span>Sign Out</span>
                </button>
              </div>
            ) : (
              <>
                <Link
                  href="/login"
                  className="inline-flex items-center gap-2 text-base font-medium text-foreground hover:text-muted-foreground transition-colors"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <LogIn className="size-4 text-muted-foreground" />
                  <span>Login</span>
                </Link>
                <Link
                  href="/register"
                  className="mt-2 inline-flex items-center justify-center gap-2 bg-foreground px-5 py-3 text-center text-sm font-medium text-background rounded-full hover:opacity-90 transition-opacity"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <span>Get Started</span>
                  <ArrowRight className="size-4" />
                </Link>
              </>
            )}
          </nav>
        </div>
      )}
    </header>
  );
}
