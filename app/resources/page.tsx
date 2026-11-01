"use client";

import React, { useState, useMemo, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { 
  Search, 
  SlidersHorizontal, 
  RotateCcw, 
  MapPin, 
  Check, 
  X, 
  Sparkles,
  ChevronRight,
  Filter
} from "lucide-react";
import { Header } from "@/components/header";
import { FooterSection } from "@/components/sections/footer-section";
import { ResourceCard } from "@/components/resource-card";
import { 
  CATEGORIES, 
  MOCK_RESOURCES, 
  getLocations, 
  type ResourceCategory, 
  type ResourceAvailability, 
  type ResourceCondition 
} from "@/lib/mock-data";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetFooter,
  SheetClose,
} from "@/components/ui/sheet";

function ResourcesCatalogContent() {
  const searchParams = useSearchParams();
  const initialCategoryParam = searchParams.get("category");

  // Filter and search states
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>(
    initialCategoryParam || "All"
  );
  const [selectedAvailability, setSelectedAvailability] = useState<string>("All");
  const [selectedCondition, setSelectedCondition] = useState<string>("All");
  const [selectedLocation, setSelectedLocation] = useState<string>("All");
  const [sortBy, setSortBy] = useState<"recent" | "popular" | "alpha">("popular");
  const [isMobileFiltersOpen, setIsMobileFiltersOpen] = useState(false);

  const locations = useMemo(() => ["All", ...getLocations()], []);

  const availabilityOptions: Array<{ label: string; value: string }> = [
    { label: "All Statuses", value: "All" },
    { label: "Available Now", value: "Available" },
    { label: "Currently In Use", value: "In Use" },
    { label: "Waitlist Open", value: "Waitlist" },
  ];

  const conditionOptions: string[] = ["All", "Like New", "Excellent", "Good"];

  const sortOptions = [
    { label: "Most Popular", value: "popular" },
    { label: "Recently Added", value: "recent" },
    { label: "Alphabetical (A-Z)", value: "alpha" },
  ];

  // Active filter count calculation
  const activeFiltersCount = useMemo(() => {
    let count = 0;
    if (selectedCategory !== "All") count++;
    if (selectedAvailability !== "All") count++;
    if (selectedCondition !== "All") count++;
    if (selectedLocation !== "All") count++;
    if (searchQuery.trim().length > 0) count++;
    return count;
  }, [selectedCategory, selectedAvailability, selectedCondition, selectedLocation, searchQuery]);

  const resetAllFilters = () => {
    setSearchQuery("");
    setSelectedCategory("All");
    setSelectedAvailability("All");
    setSelectedCondition("All");
    setSelectedLocation("All");
    setSortBy("popular");
  };

  // Filter and sort items
  const filteredResources = useMemo(() => {
    return MOCK_RESOURCES.filter((resource) => {
      // Text search
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase().trim();
        const matchesTitle = resource.title.toLowerCase().includes(query);
        const matchesDesc = resource.description.toLowerCase().includes(query);
        const matchesTagline = resource.tagline.toLowerCase().includes(query);
        const matchesCategory = resource.category.toLowerCase().includes(query);
        const matchesTags = resource.tags.some((tag) => tag.toLowerCase().includes(query));
        if (!matchesTitle && !matchesDesc && !matchesTagline && !matchesCategory && !matchesTags) {
          return false;
        }
      }

      // Category filter
      if (selectedCategory !== "All" && resource.category !== selectedCategory) {
        return false;
      }

      // Availability filter
      if (selectedAvailability !== "All" && resource.availability !== selectedAvailability) {
        return false;
      }

      // Condition filter
      if (selectedCondition !== "All" && resource.condition !== selectedCondition) {
        return false;
      }

      // Location filter
      if (selectedLocation !== "All" && resource.location !== selectedLocation) {
        return false;
      }

      return true;
    }).sort((a, b) => {
      if (sortBy === "popular") {
        return b.popularityScore - a.popularityScore;
      }
      if (sortBy === "recent") {
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      }
      if (sortBy === "alpha") {
        return a.title.localeCompare(b.title);
      }
      return 0;
    });
  }, [searchQuery, selectedCategory, selectedAvailability, selectedCondition, selectedLocation, sortBy]);

  // Sidebar filter component reused in desktop and mobile sheet
  const FilterControls = () => (
    <div className="flex flex-col gap-8">
      {/* Search Input */}
      <div>
        <label className="text-xs font-mono uppercase tracking-wider text-muted-foreground block mb-2">
          Search Equipment
        </label>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Drill, tent, camera, drone..."
            className="w-full h-10 pl-9 pr-8 text-sm rounded-lg border border-border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery("")}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              <X className="size-4" />
            </button>
          )}
        </div>
      </div>

      {/* Category Filter */}
      <div>
        <label className="text-xs font-mono uppercase tracking-wider text-muted-foreground block mb-2">
          Category
        </label>
        <div className="flex flex-col gap-1">
          <button
            type="button"
            onClick={() => setSelectedCategory("All")}
            className={`flex items-center justify-between text-xs px-3 py-2 rounded-md transition-colors text-left ${
              selectedCategory === "All"
                ? "bg-foreground text-background font-medium"
                : "text-muted-foreground hover:bg-secondary hover:text-foreground"
            }`}
          >
            <span>All Categories</span>
            <span className="font-mono text-[11px]">{MOCK_RESOURCES.length}</span>
          </button>
          {CATEGORIES.map((cat) => {
            const count = MOCK_RESOURCES.filter((r) => r.category === cat.name).length;
            const isSelected = selectedCategory === cat.name;
            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => setSelectedCategory(cat.name)}
                className={`flex items-center justify-between text-xs px-3 py-2 rounded-md transition-colors text-left ${
                  isSelected
                    ? "bg-foreground text-background font-medium"
                    : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                }`}
              >
                <span>{cat.name}</span>
                <span className="font-mono text-[11px]">{count}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Availability Filter */}
      <div>
        <label className="text-xs font-mono uppercase tracking-wider text-muted-foreground block mb-2">
          Availability Status
        </label>
        <div className="flex flex-col gap-1.5">
          {availabilityOptions.map((opt) => {
            const isSelected = selectedAvailability === opt.value;
            return (
              <button
                key={opt.value}
                type="button"
                onClick={() => setSelectedAvailability(opt.value)}
                className={`flex items-center justify-between text-xs px-3 py-2 rounded-md border transition-all text-left ${
                  isSelected
                    ? "border-foreground bg-secondary font-medium text-foreground"
                    : "border-border text-muted-foreground hover:border-foreground/30 hover:text-foreground"
                }`}
              >
                <span>{opt.label}</span>
                {isSelected && <Check className="size-3.5 text-foreground" />}
              </button>
            );
          })}
        </div>
      </div>

      {/* Condition Filter */}
      <div>
        <label className="text-xs font-mono uppercase tracking-wider text-muted-foreground block mb-2">
          Condition
        </label>
        <div className="flex flex-wrap gap-1.5">
          {conditionOptions.map((cond) => {
            const isSelected = selectedCondition === cond;
            return (
              <button
                key={cond}
                type="button"
                onClick={() => setSelectedCondition(cond)}
                className={`text-xs px-3 py-1.5 rounded-full border transition-all ${
                  isSelected
                    ? "bg-foreground text-background border-foreground font-medium"
                    : "border-border text-muted-foreground hover:border-foreground/40 hover:text-foreground"
                }`}
              >
                {cond}
              </button>
            );
          })}
        </div>
      </div>

      {/* Location Filter */}
      <div>
        <label className="text-xs font-mono uppercase tracking-wider text-muted-foreground block mb-2">
          Community Hub / Location
        </label>
        <select
          value={selectedLocation}
          onChange={(e) => setSelectedLocation(e.target.value)}
          className="w-full h-10 px-3 text-xs rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
        >
          {locations.map((loc) => (
            <option key={loc} value={loc}>
              {loc === "All" ? "All Community Hubs" : loc}
            </option>
          ))}
        </select>
      </div>

      {/* Reset Button */}
      {activeFiltersCount > 0 && (
        <button
          type="button"
          onClick={resetAllFilters}
          className="inline-flex items-center justify-center gap-2 h-9 px-4 text-xs font-medium text-destructive hover:bg-destructive/10 rounded-md border border-destructive/20 transition-colors"
        >
          <RotateCcw className="size-3.5" />
          <span>Reset All Filters ({activeFiltersCount})</span>
        </button>
      )}
    </div>
  );

  return (
    <main className="min-h-screen bg-background">
      <Header />

      {/* Catalog Hero Banner */}
      <div className="pt-28 pb-12 md:pt-36 md:pb-16 border-b border-border bg-secondary/30">
        <div className="px-6 md:px-12 lg:px-20">
          {/* Breadcrumb */}
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-4">
            <Link href="/" className="hover:text-foreground transition-colors">
              Home
            </Link>
            <ChevronRight className="size-3" />
            <span className="text-foreground font-medium">Explore Resources</span>
          </div>

          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-secondary text-xs font-mono tracking-wider text-muted-foreground uppercase mb-3 border border-border">
                <Sparkles className="size-3 text-amber-500" />
                <span>Community Lending Library</span>
              </div>
              <h1 className="text-3xl font-medium tracking-tight text-foreground md:text-5xl lg:text-6xl">
                Explore Resources.
              </h1>
              <p className="mt-4 max-w-2xl text-sm md:text-base text-muted-foreground leading-relaxed">
                Borrow high-performance tools, outdoor expedition equipment, and specialized gear from verified community owners.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <span className="font-mono text-2xl md:text-3xl font-semibold text-foreground">
                {MOCK_RESOURCES.length}
              </span>
              <span className="text-xs text-muted-foreground leading-tight">
                Total Resources
                <br />
                Listed Locally
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Catalog Area */}
      <div className="px-6 md:px-12 lg:px-20 py-12 md:py-16">
        <div className="flex flex-col lg:flex-row items-start gap-10">
          {/* Desktop Filter Sidebar */}
          <aside className="hidden lg:block w-72 shrink-0 sticky top-28 p-6 rounded-xl border border-border bg-card shadow-sm">
            <div className="flex items-center justify-between pb-4 mb-6 border-b border-border">
              <div className="flex items-center gap-2">
                <Filter className="size-4 text-foreground" />
                <h3 className="text-sm font-semibold text-foreground">Filters</h3>
              </div>
              {activeFiltersCount > 0 && (
                <span className="font-mono text-xs px-2 py-0.5 rounded-full bg-foreground text-background font-medium">
                  {activeFiltersCount}
                </span>
              )}
            </div>
            <FilterControls />
          </aside>

          {/* Results Area */}
          <div className="flex-1 w-full">
            {/* Top Bar: Mobile Filter Trigger, Search Count & Sorting */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 pb-6 mb-8 border-b border-border">
              {/* Mobile Sheet Trigger */}
              <div className="flex items-center justify-between sm:justify-start gap-4">
                <Sheet open={isMobileFiltersOpen} onOpenChange={setIsMobileFiltersOpen}>
                  <SheetTrigger asChild>
                    <button
                      type="button"
                      className="inline-flex lg:hidden items-center gap-2 h-10 px-4 rounded-lg border border-border bg-card text-xs font-medium text-foreground hover:bg-secondary transition-colors"
                    >
                      <SlidersHorizontal className="size-4" />
                      <span>Filters</span>
                      {activeFiltersCount > 0 && (
                        <span className="font-mono text-xs px-1.5 py-0.2 rounded-full bg-foreground text-background">
                          {activeFiltersCount}
                        </span>
                      )}
                    </button>
                  </SheetTrigger>
                  <SheetContent side="left" className="w-[85vw] sm:w-[400px] overflow-y-auto">
                    <SheetHeader className="mb-6">
                      <SheetTitle className="text-left text-lg font-semibold">
                        Filter Resources
                      </SheetTitle>
                    </SheetHeader>
                    <FilterControls />
                    <SheetFooter className="mt-8">
                      <SheetClose asChild>
                        <button
                          type="button"
                          className="w-full h-10 rounded-md bg-foreground text-background font-medium text-xs hover:opacity-90 transition-opacity"
                        >
                          View Results ({filteredResources.length})
                        </button>
                      </SheetClose>
                    </SheetFooter>
                  </SheetContent>
                </Sheet>

                {/* Count */}
                <p className="text-xs md:text-sm text-muted-foreground">
                  Showing <span className="font-mono font-medium text-foreground">{filteredResources.length}</span> of {MOCK_RESOURCES.length} items
                </p>
              </div>

              {/* Sorting Selector */}
              <div className="flex items-center gap-2 self-end sm:self-auto">
                <span className="text-xs text-muted-foreground whitespace-nowrap">Sort by:</span>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className="h-9 px-3 text-xs rounded-md border border-border bg-background text-foreground font-medium focus:outline-none focus:ring-2 focus:ring-ring"
                >
                  {sortOptions.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Active Filter Chips */}
            {activeFiltersCount > 0 && (
              <div className="flex flex-wrap items-center gap-2 mb-8">
                <span className="text-xs text-muted-foreground mr-1">Active filters:</span>
                {searchQuery && (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs bg-secondary text-foreground border border-border">
                    Query: "{searchQuery}"
                    <button type="button" onClick={() => setSearchQuery("")}>
                      <X className="size-3 text-muted-foreground hover:text-foreground" />
                    </button>
                  </span>
                )}
                {selectedCategory !== "All" && (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs bg-secondary text-foreground border border-border">
                    {selectedCategory}
                    <button type="button" onClick={() => setSelectedCategory("All")}>
                      <X className="size-3 text-muted-foreground hover:text-foreground" />
                    </button>
                  </span>
                )}
                {selectedAvailability !== "All" && (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs bg-secondary text-foreground border border-border">
                    Status: {selectedAvailability}
                    <button type="button" onClick={() => setSelectedAvailability("All")}>
                      <X className="size-3 text-muted-foreground hover:text-foreground" />
                    </button>
                  </span>
                )}
                {selectedCondition !== "All" && (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs bg-secondary text-foreground border border-border">
                    Condition: {selectedCondition}
                    <button type="button" onClick={() => setSelectedCondition("All")}>
                      <X className="size-3 text-muted-foreground hover:text-foreground" />
                    </button>
                  </span>
                )}
                {selectedLocation !== "All" && (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs bg-secondary text-foreground border border-border">
                    Hub: {selectedLocation}
                    <button type="button" onClick={() => setSelectedLocation("All")}>
                      <X className="size-3 text-muted-foreground hover:text-foreground" />
                    </button>
                  </span>
                )}
                <button
                  type="button"
                  onClick={resetAllFilters}
                  className="text-xs text-muted-foreground hover:text-foreground underline ml-2"
                >
                  Clear all
                </button>
              </div>
            )}

            {/* Results Grid */}
            {filteredResources.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {filteredResources.map((resource) => (
                  <ResourceCard key={resource.id} resource={resource} />
                ))}
              </div>
            ) : (
              /* Empty Search Results State */
              <div className="p-12 md:p-16 rounded-2xl border border-dashed border-border text-center bg-card">
                <div className="mx-auto size-12 rounded-full bg-secondary flex items-center justify-center text-muted-foreground mb-4">
                  <Search className="size-6" />
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-2">
                  No Resources Found
                </h3>
                <p className="text-sm text-muted-foreground max-w-md mx-auto mb-6">
                  We couldn't find any resources matching your search or active filter criteria. Try adjusting your keywords or clearing selected filters.
                </p>
                <button
                  type="button"
                  onClick={resetAllFilters}
                  className="inline-flex items-center gap-2 h-10 px-6 rounded-full bg-foreground text-background text-xs font-medium hover:opacity-90 transition-opacity"
                >
                  <RotateCcw className="size-3.5" />
                  <span>Reset All Filters</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      <FooterSection />
    </main>
  );
}

export default function ResourcesCatalogPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-background flex items-center justify-center">
          <p className="text-muted-foreground font-mono text-sm">Loading ResourceX catalog...</p>
        </div>
      }
    >
      <ResourcesCatalogContent />
    </Suspense>
  );
}
