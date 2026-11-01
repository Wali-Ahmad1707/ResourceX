"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  Package,
  CalendarCheck,
  AlertTriangle,
  Flag,
  Settings,
  FileText,
  ArrowLeft,
  ShieldCheck,
  CreditCard,
} from "lucide-react";

interface AdminNavProps {
  counts?: {
    pendingResources?: number;
    activeDisputes?: number;
    openReports?: number;
  };
}

export function AdminNav({ counts }: AdminNavProps) {
  const pathname = usePathname();

  const navItems = [
    {
      name: "Overview",
      href: "/dashboard/admin",
      icon: LayoutDashboard,
      exact: true,
    },
    {
      name: "Users",
      href: "/dashboard/admin/users",
      icon: Users,
    },
    {
      name: "Resource Moderation",
      href: "/dashboard/admin/resources",
      icon: Package,
      badge: counts?.pendingResources && counts.pendingResources > 0 ? counts.pendingResources : undefined,
      badgeColor: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20",
    },
    {
      name: "Bookings & Disputes",
      href: "/dashboard/admin/bookings",
      icon: CalendarCheck,
      badge: counts?.activeDisputes && counts.activeDisputes > 0 ? counts.activeDisputes : undefined,
      badgeColor: "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20",
    },
    {
      name: "Payments & Deposits",
      href: "/dashboard/admin/payments",
      icon: CreditCard,
    },
    {
      name: "Community Reports",
      href: "/dashboard/admin/reports",
      icon: Flag,
      badge: counts?.openReports && counts.openReports > 0 ? counts.openReports : undefined,
      badgeColor: "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20",
    },
    {
      name: "Platform Settings",
      href: "/dashboard/admin/settings",
      icon: Settings,
    },
    {
      name: "Audit Logs",
      href: "/dashboard/admin/audit-logs",
      icon: FileText,
    },
  ];

  return (
    <aside className="w-full lg:w-64 shrink-0">
      <div className="bg-card border border-border rounded-2xl p-4 sticky top-24 shadow-xs">
        <div className="flex items-center gap-2 px-3 py-2.5 mb-3 border-b border-border/60">
          <div className="size-8 rounded-lg bg-foreground text-background flex items-center justify-center font-bold">
            <ShieldCheck className="size-4" />
          </div>
          <div className="min-w-0">
            <h2 className="text-sm font-semibold text-foreground truncate">Admin Console</h2>
            <p className="text-[11px] text-muted-foreground font-mono">ResourceX Operations</p>
          </div>
        </div>

        <nav className="space-y-1">
          {navItems.map((item) => {
            const isActive = item.exact
              ? pathname === item.href
              : pathname.startsWith(item.href);

            const Icon = item.icon;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition-colors ${
                  isActive
                    ? "bg-foreground text-background font-semibold shadow-xs"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/60"
                }`}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <Icon className="size-4 shrink-0" />
                  <span className="truncate">{item.name}</span>
                </div>
                {item.badge !== undefined && (
                  <span
                    className={`text-[10px] font-mono px-1.5 py-0.5 rounded-full border ${
                      isActive ? "bg-background text-foreground border-transparent" : item.badgeColor
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        <div className="mt-5 pt-3 border-t border-border/60">
          <Link
            href="/resources"
            className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-colors"
          >
            <ArrowLeft className="size-3.5" />
            <span>Return to Catalog</span>
          </Link>
        </div>
      </div>
    </aside>
  );
}
