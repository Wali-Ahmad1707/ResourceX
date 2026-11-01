"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { ArrowRight, Plus } from "lucide-react";

const word = "RESOURCEX";

const sideImages = [
  {
    src: "https://images.unsplash.com/photo-1517824806704-9040b037703b?q=80&w=1000",
    alt: "Mountain hiking adventure",
    position: "left",
    span: 1,
  },
  {
    src: "https://images.unsplash.com/photo-1510312305653-8ed496efae75?q=80&w=1000",
    alt: "Camping under stars",
    position: "left",
    span: 1,
  },
  {
    src: "https://images.unsplash.com/photo-1533873984035-25970ab07461?q=80&w=1000",
    alt: "Forest exploration",
    position: "right",
    span: 1,
  },
  {
    src: "https://images.unsplash.com/photo-1527004013197-933c4bb611b3?q=80&w=1000",
    alt: "Lake camping view",
    position: "right",
    span: 1,
  },
];

export function HeroSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const [scrollProgress, setScrollProgress] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      if (!sectionRef.current) return;
      
      const rect = sectionRef.current.getBoundingClientRect();
      const scrollableHeight = window.innerHeight * 2;
      const scrolled = -rect.top;
      const progress = Math.max(0, Math.min(1, scrolled / scrollableHeight));
      
      setScrollProgress(progress);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();
    
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  // Text fades out first (0 to 0.2)
  const textOpacity = Math.max(0, 1 - (scrollProgress / 0.2));
  
  // Image transforms start after text fades (0.2 to 1)
  const imageProgress = Math.max(0, Math.min(1, (scrollProgress - 0.2) / 0.8));
  
  // Smooth interpolations
  const centerWidth = 100 - (imageProgress * 58); // 100% to 42%
  const centerHeight = 100 - (imageProgress * 30); // 100% to 70%
  const sideWidth = imageProgress * 22; // 0% to 22%
  const sideOpacity = imageProgress;
  const sideTranslateLeft = -100 + (imageProgress * 100); // -100% to 0%
  const sideTranslateRight = 100 - (imageProgress * 100); // 100% to 0%
  const borderRadius = imageProgress * 24; // 0px to 24px
  const gap = imageProgress * 16; // 0px to 16px
  
  // Vertical offset for side columns to move them up on mobile
  const sideTranslateY = -(imageProgress * 15); // Move up by 15% when fully expanded

  return (
    <section ref={sectionRef} className="relative bg-background">
      {/* Sticky container for scroll animation */}
      <div className="sticky top-0 h-screen overflow-hidden">
        <div className="flex h-full w-full items-center justify-center">
          {/* Bento Grid Container */}
          <div 
            className="relative flex h-full w-full items-stretch justify-center"
            style={{ gap: `${gap}px`, padding: `${imageProgress * 16}px`, paddingBottom: `${60 + (imageProgress * 40)}px` }}
          >
            
            {/* Left Column */}
            <div 
              className="flex flex-col will-change-transform"
              style={{
                width: `${sideWidth}%`,
                gap: `${gap}px`,
                transform: `translateX(${sideTranslateLeft}%) translateY(${sideTranslateY}%)`,
                opacity: sideOpacity,
              }}
            >
              {sideImages.filter(img => img.position === "left").map((img, idx) => (
                <div 
                  key={idx} 
                  className="relative overflow-hidden will-change-transform"
                  style={{
                    flex: img.span,
                    borderRadius: `${borderRadius}px`,
                  }}
                >
                  <Image
                    src={img.src || "/placeholder.svg"}
                    alt={img.alt}
                    fill
                    className="object-cover"
                  />
                </div>
              ))}
            </div>

            {/* Main Hero Image - Center */}
            <div 
              className="relative overflow-hidden will-change-transform"
              style={{
                width: `${centerWidth}%`,
                height: `${centerHeight}%`,
                flex: "0 0 auto",
                borderRadius: `${borderRadius}px`,
              }}
            >
              <Image
                src="/images/hero-main.png"
                alt="Mountain landscape with camping tent at sunset"
                fill
                className="object-cover"
                priority
              />
              
              {/* Overlay Text - Fades out first */}
              <div 
                className="absolute inset-0 flex items-end overflow-hidden"
                style={{ opacity: textOpacity }}
              >
                <h1 className="w-full text-[17vw] md:text-[18vw] lg:text-[19.5vw] font-medium leading-[0.8] tracking-tighter text-white select-none whitespace-nowrap">
                  {word.split("").map((letter, index) => (
                    <span
                      key={index}
                      className="inline-block animate-[slideUp_0.8s_ease-out_forwards] opacity-0"
                      style={{
                        animationDelay: `${index * 0.08}s`,
                        transition: 'all 1.5s',
                        transitionTimingFunction: 'cubic-bezier(0.86, 0, 0.07, 1)',
                      }}
                    >
                      {letter}
                    </span>
                  ))}
                </h1>
              </div>
            </div>

            {/* Right Column */}
            <div 
              className="flex flex-col will-change-transform"
              style={{
                width: `${sideWidth}%`,
                gap: `${gap}px`,
                transform: `translateX(${sideTranslateRight}%) translateY(${sideTranslateY}%)`,
                opacity: sideOpacity,
              }}
            >
              {sideImages.filter(img => img.position === "right").map((img, idx) => (
                <div 
                  key={idx} 
                  className="relative overflow-hidden will-change-transform"
                  style={{
                    flex: img.span,
                    borderRadius: `${borderRadius}px`,
                  }}
                >
                  <Image
                    src={img.src || "/placeholder.svg"}
                    alt={img.alt}
                    fill
                    className="object-cover"
                  />
                </div>
              ))}
            </div>

          </div>
        </div>
      </div>

      {/* Scroll space to enable animation */}
      <div className="h-[200vh]" />

      {/* Tagline Section */}
      <div className="px-6 pt-32 pb-28 md:pt-48 md:px-12 md:pb-36 lg:px-20 lg:pt-56 lg:pb-44 text-center">
        {/* Subtle community pill */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-secondary text-xs font-mono tracking-wider text-muted-foreground uppercase mb-8 border border-border">
          <span className="inline-block size-1.5 rounded-full bg-foreground dark:bg-white animate-pulse" />
          <span>Community Resource Sharing</span>
        </div>

        {/* Main Tagline */}
        <h2 className="mx-auto max-w-4xl text-3xl font-medium tracking-tight text-foreground md:text-5xl lg:text-6xl lg:leading-[1.15]">
          Share More. Own Less.
          <br />
          <span className="text-muted-foreground">Build Together.</span>
        </h2>

        {/* Supporting text */}
        <p className="mx-auto mt-6 max-w-2xl text-base leading-relaxed text-muted-foreground md:text-lg lg:text-xl">
          Discover and share useful resources within your community. Access what you need, when you need it.
        </p>

        {/* CTAs */}
        <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            href="#explore"
            className="inline-flex items-center justify-center gap-2 h-11 px-7 rounded-full bg-foreground text-background font-medium text-sm hover:opacity-90 transition-all shadow-sm group"
          >
            <span>Explore Resources</span>
            <ArrowRight className="size-4 group-hover:translate-x-0.5 transition-transform" />
          </Link>

          <Link
            href="#list-resource"
            className="inline-flex items-center justify-center gap-2 h-11 px-7 rounded-full border border-border bg-background hover:bg-secondary text-foreground font-medium text-sm transition-all"
          >
            <Plus className="size-4" />
            <span>List Your Resource</span>
          </Link>
        </div>
      </div>
    </section>
  );
}
