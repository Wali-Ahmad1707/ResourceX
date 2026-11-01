"use client";

import { ShieldCheck, Leaf, Coins, Users, ArrowUpRight } from "lucide-react";

const benefits = [
  {
    title: "Vetted Trust & Accountability",
    description: "Every member is ID-verified with immutable audit trails. Owners set their own eligibility standards and approve every request.",
    icon: ShieldCheck,
  },
  {
    title: "Circular & Sustainable",
    description: "The average power tool is used only 13 minutes in its entire lifespan. Sharing reduces manufacturing emissions, e-waste, and clutter.",
    icon: Leaf,
  },
  {
    title: "Radical Cost Efficiency",
    description: "Access $5,000+ worth of expedition packs, mirrorless cameras, and heavy workshop equipment without buying or storing them permanently.",
    icon: Coins,
  },
  {
    title: "Stronger Local Neighborhoods",
    description: "Transform idle equipment sitting in garages into community wealth. Connect with local creators, makers, and outdoor explorers.",
    icon: Users,
  },
];

export function CommunityBenefitsSection() {
  return (
    <section className="bg-background py-20 md:py-28 lg:py-32 border-t border-border">
      <div className="px-6 md:px-12 lg:px-20">
        {/* Grid Layout: Left Editorial Banner, Right Benefits Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-start">
          {/* Left Column: Editorial Statement */}
          <div className="lg:col-span-5">
            <p className="text-xs font-mono uppercase tracking-widest text-muted-foreground mb-3">
              Why ResourceX Matters
            </p>
            <h2 className="text-3xl font-medium tracking-tight text-foreground md:text-4xl lg:text-5xl lg:leading-[1.15]">
              Built on Mutual Respect & Shared Prosperity.
            </h2>
            <p className="mt-6 text-sm md:text-base text-muted-foreground leading-relaxed">
              We believe true abundance isn’t about how much gear you own in your closet—it’s about having immediate, reliable access to what you need when inspiration strikes.
            </p>

            <div className="mt-8 p-6 rounded-xl border border-border bg-card">
              <div className="flex items-center gap-4">
                <span className="font-mono text-3xl font-semibold text-foreground">78%</span>
                <p className="text-xs text-muted-foreground leading-snug">
                  Reduction in household equipment expenses reported by active community resource sharers.
                </p>
              </div>
            </div>
          </div>

          {/* Right Column: 4 Benefit Cards */}
          <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-6">
            {benefits.map((benefit) => {
              const Icon = benefit.icon;
              return (
                <div
                  key={benefit.title}
                  className="rounded-xl border border-border bg-card p-6 shadow-sm hover:border-foreground/20 transition-all flex flex-col justify-between"
                >
                  <div>
                    <div className="size-10 rounded-lg bg-secondary flex items-center justify-center text-foreground mb-4">
                      <Icon className="size-5" />
                    </div>
                    <h3 className="text-base font-semibold text-foreground mb-2">
                      {benefit.title}
                    </h3>
                    <p className="text-xs md:text-sm text-muted-foreground leading-relaxed">
                      {benefit.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
