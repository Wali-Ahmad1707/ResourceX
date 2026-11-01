"use client";

import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

const footerLinks = {
  explore: [
    { label: "Outdoor & Adventure Gear", href: "#explore" },
    { label: "Power & Workshop Tools", href: "#explore" },
    { label: "Audio & Photography", href: "#explore" },
    { label: "Lawn & Gardening", href: "#explore" },
    { label: "All Community Resources", href: "#explore" },
  ],
  howItWorks: [
    { label: "Borrowing Guide", href: "#how-it-works" },
    { label: "Listing an Item", href: "#how-it-works" },
    { label: "Trust & Verification", href: "#how-it-works" },
    { label: "Condition Reporting", href: "#how-it-works" },
    { label: "Waitlist FIFO System", href: "#how-it-works" },
  ],
  community: [
    { label: "Community Guidelines", href: "#" },
    { label: "Lender Reputation", href: "#" },
    { label: "Sustainability & Circular Impact", href: "#" },
    { label: "Neighborhood Hubs", href: "#" },
  ],
  contact: [
    { label: "Help Center & FAQ", href: "#" },
    { label: "Dispute Resolution", href: "#" },
    { label: "Safety Inquiries", href: "#" },
    { label: "support@resourcex.local", href: "mailto:support@resourcex.local" },
  ],
};

export function FooterSection() {
  return (
    <footer className="bg-background">
      {/* Main Footer Content */}
      <div className="border-t border-border px-6 py-16 md:px-12 md:py-20 lg:px-20">
        <div className="grid grid-cols-2 gap-12 md:grid-cols-4 lg:grid-cols-6">
          {/* Brand & About ResourceX */}
          <div className="col-span-2">
            <Link 
              href="/" 
              className="text-lg font-semibold tracking-tight text-foreground inline-flex items-center gap-1.5"
            >
              <span>Resource</span>
              <span className="font-mono text-xs px-1.5 py-0.5 rounded bg-foreground/10 dark:bg-white/10 uppercase tracking-widest font-bold">
                X
              </span>
            </Link>
            <p className="mt-4 max-w-sm text-sm leading-relaxed text-muted-foreground">
              A community-driven platform where people can safely share underused equipment, tools, outdoor gear, and specialized resources. Share More. Own Less. Build Together.
            </p>
            <div className="mt-6 flex items-center gap-3">
              <span className="inline-flex items-center gap-1.5 text-xs font-mono text-muted-foreground px-2.5 py-1 rounded-full border border-border bg-secondary/50">
                <span className="size-1.5 rounded-full bg-emerald-500" />
                Verified Community Network
              </span>
            </div>
          </div>

          {/* Explore Resources */}
          <div>
            <h4 className="mb-4 text-sm font-semibold text-foreground">Explore Resources</h4>
            <ul className="space-y-3">
              {footerLinks.explore.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* How It Works */}
          <div>
            <h4 className="mb-4 text-sm font-semibold text-foreground">How It Works</h4>
            <ul className="space-y-3">
              {footerLinks.howItWorks.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Community */}
          <div>
            <h4 className="mb-4 text-sm font-semibold text-foreground">Community</h4>
            <ul className="space-y-3">
              {footerLinks.community.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="mb-4 text-sm font-semibold text-foreground">Contact</h4>
            <ul className="space-y-3">
              {footerLinks.contact.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-border px-6 py-6 md:px-12 lg:px-20">
        <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
          <p className="text-xs text-muted-foreground">
            © 2026 ResourceX. All rights reserved.
          </p>

          {/* Policy Links */}
          <div className="flex items-center gap-6">
            <Link
              href="#"
              className="text-xs text-muted-foreground transition-colors hover:text-foreground"
            >
              Privacy Policy
            </Link>
            <Link
              href="#"
              className="text-xs text-muted-foreground transition-colors hover:text-foreground"
            >
              Terms of Sharing
            </Link>
            <Link
              href="#"
              className="text-xs text-muted-foreground transition-colors hover:text-foreground"
            >
              Trust & Transparency
            </Link>
          </div>

          {/* Social Links */}
          <div className="flex items-center gap-4">
            <Link
              href="#"
              className="inline-flex items-center gap-1 text-xs text-muted-foreground transition-colors hover:text-foreground"
            >
              <span>GitHub</span>
              <ArrowUpRight className="size-3" />
            </Link>
            <Link
              href="#"
              className="inline-flex items-center gap-1 text-xs text-muted-foreground transition-colors hover:text-foreground"
            >
              <span>Discord</span>
              <ArrowUpRight className="size-3" />
            </Link>
            <Link
              href="#"
              className="inline-flex items-center gap-1 text-xs text-muted-foreground transition-colors hover:text-foreground"
            >
              <span>Twitter</span>
              <ArrowUpRight className="size-3" />
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
