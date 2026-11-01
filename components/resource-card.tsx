"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { MapPin, Star, ArrowRight, ShieldCheck, Clock, Bookmark } from "lucide-react";
import { FadeImage } from "@/components/fade-image";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/use-auth";
import { toast } from "sonner";
import type { Resource } from "@/lib/mock-data";
import { resolveResourceImage } from "@/lib/image-mapping";

interface ResourceCardProps {
  resource: Resource;
  className?: string;
  initialSaved?: boolean;
}

export function ResourceCard({ resource, className = "", initialSaved = false }: ResourceCardProps) {
  const isAvailable = resource.availability === "Available";
  const isInUse = resource.availability === "In Use";
  const isWaitlist = resource.availability === "Waitlist";

  const { user } = useAuth();
  const [isSaved, setIsSaved] = useState(initialSaved);
  const [isSaving, setIsSaving] = useState(false);

  // Check saved state if user is logged in
  useEffect(() => {
    if (user) {
      let isMounted = true;
      fetch(`/api/saved?resourceId=${resource.id}`)
        .then((res) => (res.ok ? res.json() : null))
        .then((data) => {
          if (isMounted && data && typeof data.isSaved === "boolean") {
            setIsSaved(data.isSaved);
          }
        })
        .catch(() => {});
      return () => {
        isMounted = false;
      };
    }
  }, [user, resource.id]);

  const handleToggleSave = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!user) {
      toast.info("Please sign in to save equipment to your wishlist.");
      return;
    }

    try {
      setIsSaving(true);
      if (isSaved) {
        const res = await fetch(`/api/saved/${resource.id}`, { method: "DELETE" });
        if (res.ok) {
          setIsSaved(false);
          toast.success("Removed from wishlist.");
        }
      } else {
        const res = await fetch("/api/saved", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ resourceId: resource.id }),
        });
        if (res.ok) {
          setIsSaved(true);
          toast.success("Saved to your wishlist!");
        }
      }
    } catch {
      toast.error("Failed to update wishlist.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div
      className={`group flex flex-col justify-between overflow-hidden rounded-xl border border-border bg-card text-card-foreground shadow-sm transition-all duration-300 hover:shadow-md hover:border-foreground/20 ${className}`}
    >
      <div>
        {/* Image Container with Badges */}
        <div className="relative aspect-[4/3] w-full overflow-hidden bg-secondary">
          <FadeImage
            src={resolveResourceImage(resource)}
            alt={resource.title}
            fill
            className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
          />

          {/* Top Overlays: Availability & Condition */}
          <div className="absolute top-3 left-3 right-3 flex items-center justify-between pointer-events-none">
            <span
              className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium backdrop-blur-md shadow-xs ${
                isAvailable
                  ? "bg-emerald-950/80 text-emerald-200 border border-emerald-500/30 dark:bg-emerald-900/70"
                  : isInUse
                  ? "bg-amber-950/80 text-amber-200 border border-amber-500/30 dark:bg-amber-900/70"
                  : "bg-blue-950/80 text-blue-200 border border-blue-500/30 dark:bg-blue-900/70"
              }`}
            >
              <span
                className={`size-1.5 rounded-full ${
                  isAvailable
                    ? "bg-emerald-400 animate-pulse"
                    : isInUse
                    ? "bg-amber-400"
                    : "bg-blue-400"
                }`}
              />
              {resource.availability}
            </span>

            <div className="flex items-center gap-1.5 pointer-events-auto">
              <span className="inline-block px-2.5 py-1 rounded-full text-[11px] font-mono uppercase tracking-wider backdrop-blur-md bg-black/60 text-white border border-white/10">
                {resource.condition}
              </span>
              <button
                type="button"
                onClick={handleToggleSave}
                disabled={isSaving}
                aria-label={isSaved ? "Remove from wishlist" : "Save to wishlist"}
                className="p-1.5 rounded-full bg-black/60 hover:bg-black/80 text-white backdrop-blur-md border border-white/10 transition-colors"
                title={isSaved ? "Saved in Wishlist" : "Save to Wishlist"}
              >
                <Bookmark
                  className={`size-3.5 transition-colors ${
                    isSaved ? "fill-amber-400 text-amber-400" : "text-white"
                  }`}
                />
              </button>
            </div>
          </div>

          {/* Bottom Duration Badge */}
          <div className="absolute bottom-3 left-3 pointer-events-none">
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-mono bg-background/80 text-foreground backdrop-blur-sm border border-border/50">
              <Clock className="size-3" />
              Max {resource.maxDuration}
            </span>
          </div>
        </div>

        {/* Card Body */}
        <div className="p-5">
          {/* Category & Location */}
          <div className="flex items-center justify-between text-xs text-muted-foreground mb-2">
            <span className="font-medium tracking-wide uppercase text-[11px] text-muted-foreground/90">
              {resource.category}
            </span>
            <span className="inline-flex items-center gap-1 truncate max-w-[140px]">
              <MapPin className="size-3 shrink-0" />
              <span className="truncate">{resource.location}</span>
            </span>
          </div>

          {/* Title */}
          <Link href={`/resources/${resource.id}`}>
            <h3 className="text-base font-semibold text-foreground line-clamp-1 group-hover:text-foreground/80 transition-colors">
              {resource.title}
            </h3>
          </Link>

          {/* Tagline / Snippet */}
          <p className="mt-1.5 text-xs text-muted-foreground line-clamp-2 leading-relaxed">
            {resource.tagline || resource.description}
          </p>

          {/* Owner Info */}
          <div className="mt-4 pt-4 border-t border-border flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="relative size-6 rounded-full overflow-hidden bg-secondary border border-border">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={resource.owner.avatar}
                  alt={resource.owner.name}
                  className="size-full object-cover"
                />
              </div>
              <div className="flex items-center gap-1">
                <span className="text-xs font-medium text-foreground">
                  {resource.owner.name}
                </span>
                {resource.owner.verified && (
                  <ShieldCheck className="size-3 text-emerald-500" />
                )}
              </div>
            </div>

            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <Star className="size-3 fill-amber-400 text-amber-400" />
              <span className="font-mono font-medium text-foreground">
                {resource.owner.rating}
              </span>
              <span>({resource.owner.reviewCount})</span>
            </div>
          </div>
        </div>
      </div>

      {/* Card Footer: View Details CTA */}
      <div className="p-5 pt-0">
        <Link
          href={`/resources/${resource.id}`}
          className="w-full inline-flex items-center justify-center gap-2 h-9 px-4 rounded-md text-xs font-medium border border-border bg-secondary text-secondary-foreground hover:bg-foreground hover:text-background transition-all group/btn"
        >
          <span>View Details</span>
          <ArrowRight className="size-3.5 group-hover/btn:translate-x-0.5 transition-transform" />
        </Link>
      </div>
    </div>
  );
}
