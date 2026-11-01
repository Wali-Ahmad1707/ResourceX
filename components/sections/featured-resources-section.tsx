"use client";

import Link from "next/link";
import { ArrowRight, Sparkles } from "lucide-react";
import { ResourceCard } from "@/components/resource-card";
import { getFeaturedResources } from "@/lib/mock-data";

export function FeaturedResourcesSection() {
  const featured = getFeaturedResources().slice(0, 6);

  return (
    <section id="explore" className="bg-background py-20 md:py-28 lg:py-32 border-t border-border">
      <div className="px-6 md:px-12 lg:px-20">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12 md:mb-16">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-secondary text-xs font-mono tracking-wider text-muted-foreground uppercase mb-3 border border-border">
              <Sparkles className="size-3 text-amber-500" />
              <span>Available in Your Community</span>
            </div>
            <h2 className="text-3xl font-medium tracking-tight text-foreground md:text-4xl lg:text-5xl">
              Featured Resources.
            </h2>
          </div>

          <Link
            href="/resources"
            className="inline-flex items-center gap-2 text-sm font-medium text-foreground hover:opacity-80 transition-opacity group"
          >
            <span>Browse Complete Catalog</span>
            <ArrowRight className="size-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        {/* Resources Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {featured.map((resource) => (
            <ResourceCard key={resource.id} resource={resource} />
          ))}
        </div>

        {/* Bottom CTA */}
        <div className="mt-14 text-center">
          <Link
            href="/resources"
            className="inline-flex items-center justify-center gap-2 h-11 px-8 rounded-full bg-foreground text-background font-medium text-sm hover:opacity-90 transition-all shadow-sm"
          >
            <span>Explore All 50+ Community Resources</span>
            <ArrowRight className="size-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}
