"use client";

import Link from "next/link";
import { 
  Wrench, 
  Tent, 
  Cpu, 
  Activity, 
  Camera, 
  BookOpen, 
  Factory,
  FlaskConical,
  Stethoscope,
  HardHat,
  GraduationCap,
  ArrowRight 
} from "lucide-react";
import { FadeImage } from "@/components/fade-image";
import { CATEGORIES } from "@/lib/mock-data";

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  Wrench,
  Tent,
  Cpu,
  Activity,
  Camera,
  BookOpen,
  Factory,
  FlaskConical,
  Stethoscope,
  HardHat,
  GraduationCap,
};

export function CategoriesSection() {
  return (
    <section id="categories" className="bg-background py-20 md:py-28 lg:py-32 border-t border-border">
      <div className="px-6 md:px-12 lg:px-20">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12 md:mb-16">
          <div>
            <p className="text-xs font-mono uppercase tracking-widest text-muted-foreground mb-3">
              Browse By Category
            </p>
            <h2 className="text-3xl font-medium tracking-tight text-foreground md:text-4xl lg:text-5xl">
              Curated Resource Libraries.
            </h2>
          </div>
          <p className="max-w-md text-sm text-muted-foreground leading-relaxed">
            Borrow specialized gear without the ownership burden. Everything from precision workshop instruments and industrial machinery to medical diagnostics and research robotics.
          </p>
        </div>

        {/* Categories Grid: 11 categories */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {CATEGORIES.map((cat) => {
            const Icon = iconMap[cat.iconName] || Wrench;
            return (
              <Link
                key={cat.id}
                href={`/resources?category=${encodeURIComponent(cat.name)}`}
                className="group relative flex flex-col justify-between overflow-hidden rounded-xl border border-border bg-card p-6 shadow-sm transition-all duration-300 hover:border-foreground/30 hover:shadow-md"
              >
                <div>
                  {/* Top Bar: Icon, Photo and Count */}
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                      <div className="flex size-11 items-center justify-center rounded-lg bg-secondary text-foreground group-hover:bg-foreground group-hover:text-background transition-colors duration-300">
                        <Icon className="size-5" />
                      </div>
                      <div className="relative size-11 rounded-lg overflow-hidden border border-border/70 bg-secondary shrink-0">
                        <FadeImage
                          src={cat.image}
                          alt={cat.name}
                          fill
                          className="object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                      </div>
                    </div>
                    <span className="font-mono text-xs text-muted-foreground px-2.5 py-1 rounded-full border border-border bg-secondary/50">
                      {cat.count} items
                    </span>
                  </div>

                  {/* Title & Description */}
                  <h3 className="text-xl font-semibold text-foreground group-hover:text-foreground/80 transition-colors">
                    {cat.name}
                  </h3>
                  <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
                    {cat.description}
                  </p>
                </div>

                {/* Bottom Action */}
                <div className="mt-8 pt-4 border-t border-border/60 flex items-center justify-between text-xs font-medium text-foreground">
                  <span>Explore category</span>
                  <ArrowRight className="size-4 text-muted-foreground group-hover:text-foreground group-hover:translate-x-1 transition-all" />
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
