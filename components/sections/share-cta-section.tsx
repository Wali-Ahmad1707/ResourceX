"use client";

import Link from "next/link";
import { ArrowRight, PlusCircle, ShieldCheck } from "lucide-react";

export function ShareCtaSection() {
  return (
    <section className="bg-background py-20 md:py-28 lg:py-32 border-t border-border">
      <div className="px-6 md:px-12 lg:px-20">
        <div className="relative overflow-hidden rounded-2xl border border-border bg-card px-8 py-16 md:px-16 md:py-20 text-center shadow-sm">
          {/* Subtle badge */}
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-secondary text-xs font-mono tracking-wider text-muted-foreground uppercase mb-6 border border-border">
            <ShieldCheck className="size-3 text-emerald-500" />
            <span>Empower Your Neighborhood</span>
          </div>

          {/* Heading */}
          <h2 className="mx-auto max-w-2xl text-3xl font-medium tracking-tight text-foreground md:text-5xl lg:text-5xl lg:leading-tight">
            Have Gear Sitting in Storage?
            <br />
            <span className="text-muted-foreground">Put It to Good Use.</span>
          </h2>

          {/* Description */}
          <p className="mx-auto mt-6 max-w-xl text-sm md:text-base text-muted-foreground leading-relaxed">
            Join hundreds of trusted lenders in your community. List your tools, camping equipment, or specialty electronics and set your own borrowing rules.
          </p>

          {/* CTAs */}
          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/resources"
              className="inline-flex items-center justify-center gap-2 h-11 px-7 rounded-full bg-foreground text-background font-medium text-sm hover:opacity-90 transition-all shadow-sm"
            >
              <span>Explore Community Gear</span>
              <ArrowRight className="size-4" />
            </Link>

            <Link
              href="/resources"
              className="inline-flex items-center justify-center gap-2 h-11 px-7 rounded-full border border-border bg-background hover:bg-secondary text-foreground font-medium text-sm transition-all"
            >
              <PlusCircle className="size-4" />
              <span>List Your Equipment</span>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
