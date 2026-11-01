"use client";

import { Search, CalendarCheck, CheckCircle2, RotateCcw } from "lucide-react";

const steps = [
  {
    step: "01",
    title: "Discover Resources",
    description: "Search community listings by category, location, and dates. Inspect high-res condition photos and verify specifications before requesting.",
    icon: Search,
  },
  {
    step: "02",
    title: "Request to Borrow",
    description: "Select your desired borrow duration, acknowledge the owner's eligibility criteria, and include a brief note explaining your project or trip.",
    icon: CalendarCheck,
  },
  {
    step: "03",
    title: "Get Approval",
    description: "Verified owners review requests promptly. Once approved, arrange convenient pickup at a neighborhood hub or direct exchange point.",
    icon: CheckCircle2,
  },
  {
    step: "04",
    title: "Use and Return",
    description: "Enjoy using high-performance equipment. Return on time, complete a quick condition check report, and build your community reputation.",
    icon: RotateCcw,
  },
];

export function HowItWorksSection() {
  return (
    <section id="how-it-works" className="bg-background py-20 md:py-28 lg:py-32 border-t border-border">
      <div className="px-6 md:px-12 lg:px-20">
        {/* Section Header */}
        <div className="max-w-3xl mx-auto text-center mb-16 md:mb-20">
          <p className="text-xs font-mono uppercase tracking-widest text-muted-foreground mb-3">
            Simple, Transparent, Trust-First
          </p>
          <h2 className="text-3xl font-medium tracking-tight text-foreground md:text-4xl lg:text-5xl">
            How ResourceX Works.
          </h2>
          <p className="mt-4 text-sm md:text-base text-muted-foreground leading-relaxed">
            Borrowing and lending is designed to be as frictionless as buying, backed by transparent profiles, condition logs, and community accountability.
          </p>
        </div>

        {/* 4 Steps Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {steps.map((item) => {
            const Icon = item.icon;
            return (
              <div
                key={item.step}
                className="relative flex flex-col justify-between rounded-xl border border-border bg-card p-6 shadow-sm hover:border-foreground/20 transition-all"
              >
                <div>
                  {/* Step Number & Icon */}
                  <div className="flex items-center justify-between mb-6">
                    <span className="font-mono text-3xl font-medium text-muted-foreground/50">
                      {item.step}
                    </span>
                    <div className="flex size-10 items-center justify-center rounded-lg bg-secondary text-foreground">
                      <Icon className="size-5" />
                    </div>
                  </div>

                  {/* Title & Description */}
                  <h3 className="text-lg font-semibold text-foreground mb-3">
                    {item.title}
                  </h3>
                  <p className="text-xs md:text-sm text-muted-foreground leading-relaxed">
                    {item.description}
                  </p>
                </div>

                <div className="mt-6 pt-4 border-t border-border/50 text-[11px] font-mono text-muted-foreground uppercase tracking-wider">
                  Phase {item.step} Protocol
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
