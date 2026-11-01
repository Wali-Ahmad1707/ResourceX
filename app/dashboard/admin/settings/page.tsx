"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  Settings,
  Tag,
  Plus,
  Trash2,
  Edit2,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Loader2,
  RefreshCw,
  Save,
  Sliders,
  ShieldCheck,
  Megaphone
} from "lucide-react";
import { toast } from "sonner";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";

interface PlatformCategory {
  id: string;
  name: string;
  slug: string;
  description: string;
  icon: string;
  isActive: number;
  displayOrder: number;
  resourceCount: number;
}

interface PlatformSetting {
  key: string;
  value: string;
  description: string;
  category: string;
  updatedBy?: string | null;
  updatedAt: string;
}

export default function AdminSettingsPage() {
  const [activeTab, setActiveTab] = useState("categories");
  const [categories, setCategories] = useState<PlatformCategory[]>([]);
  const [settings, setSettings] = useState<PlatformSetting[]>([]);
  const [loading, setLoading] = useState(true);

  // Add Category Modal
  const [isAddCatOpen, setIsAddCatOpen] = useState(false);
  const [catName, setCatName] = useState("");
  const [catSlug, setCatSlug] = useState("");
  const [catDesc, setCatDesc] = useState("");
  const [catIcon, setCatIcon] = useState("Tag");
  const [addingCat, setAddingCat] = useState(false);

  // Edit Category Modal
  const [editingCat, setEditingCat] = useState<PlatformCategory | null>(null);
  const [editName, setEditName] = useState("");
  const [editDesc, setEditDesc] = useState("");
  const [editActive, setEditActive] = useState(1);
  const [savingCat, setSavingCat] = useState(false);

  // Platform Settings State
  const [formSettings, setFormSettings] = useState<Record<string, string>>({});
  const [savingSettings, setSavingSettings] = useState(false);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const [catRes, setRes] = await Promise.all([
        fetch("/api/admin/categories").then((r) => r.json()),
        fetch("/api/admin/settings").then((r) => r.json()),
      ]);

      if (catRes.success && catRes.categories) {
        setCategories(catRes.categories);
      }
      if (setRes.success && setRes.settings) {
        setSettings(setRes.settings);
        const map: Record<string, string> = {};
        for (const s of setRes.settings as PlatformSetting[]) {
          map[s.key] = s.value;
        }
        setFormSettings(map);
      }
    } catch {
      toast.error("Failed to load settings data");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleCreateCategory = async () => {
    if (!catName.trim() || !catDesc.trim()) {
      toast.error("Category name and description are required.");
      return;
    }

    try {
      setAddingCat(true);
      const res = await fetch("/api/admin/categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: catName.trim(),
          slug: catSlug.trim() || undefined,
          description: catDesc.trim(),
          icon: catIcon.trim() || "Tag",
        }),
      });

      const data = await res.json();
      if (data.success) {
        toast.success(`Category "${catName}" created.`);
        setIsAddCatOpen(false);
        setCatName("");
        setCatSlug("");
        setCatDesc("");
        fetchData();
      } else {
        toast.error(data.error || "Failed to create category");
      }
    } catch {
      toast.error("Error creating platform category");
    } finally {
      setAddingCat(false);
    }
  };

  const handleUpdateCategory = async () => {
    if (!editingCat) return;
    try {
      setSavingCat(true);
      const res = await fetch(`/api/admin/categories/${editingCat.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: editName.trim(),
          description: editDesc.trim(),
          isActive: editActive,
        }),
      });

      const data = await res.json();
      if (data.success) {
        toast.success("Category updated.");
        setEditingCat(null);
        fetchData();
      } else {
        toast.error(data.error || "Failed to update category");
      }
    } catch {
      toast.error("Error updating category");
    } finally {
      setSavingCat(false);
    }
  };

  const handleDeleteCategory = async (cat: PlatformCategory) => {
    if (!confirm(`Are you sure you want to delete category "${cat.name}"?`)) return;

    try {
      const res = await fetch(`/api/admin/categories/${cat.id}`, {
        method: "DELETE",
      });

      const data = await res.json();
      if (data.success) {
        toast.success(`Category "${cat.name}" deleted.`);
        fetchData();
      } else {
        // Protected deletion rejection
        toast.error(data.error || "Failed to delete category");
      }
    } catch {
      toast.error("Error deleting category");
    }
  };

  const handleSaveSetting = async (key: string, value: string) => {
    try {
      setSavingSettings(true);
      const res = await fetch("/api/admin/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ key, value }),
      });

      const data = await res.json();
      if (data.success) {
        toast.success(`Setting '${key}' saved.`);
        fetchData();
      } else {
        toast.error(data.error || "Failed to update setting");
      }
    } catch {
      toast.error("Error saving setting");
    } finally {
      setSavingSettings(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Platform Settings & Taxonomy</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Manage category structures, global announcement banners, file upload policies, and moderation automation.
          </p>
        </div>
        <button
          type="button"
          onClick={fetchData}
          disabled={loading}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-medium border border-border bg-card hover:bg-muted transition-colors cursor-pointer self-start sm:self-auto"
        >
          <RefreshCw className={`size-3.5 ${loading ? "animate-spin" : ""}`} />
          <span>Refresh</span>
        </button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="bg-muted/50 p-1 rounded-xl">
          <TabsTrigger value="categories" className="rounded-lg text-xs font-medium gap-2">
            <Tag className="size-3.5" />
            <span>Resource Categories</span>
          </TabsTrigger>
          <TabsTrigger value="config" className="rounded-lg text-xs font-medium gap-2">
            <Sliders className="size-3.5" />
            <span>Platform Configuration</span>
          </TabsTrigger>
        </TabsList>

        {/* Categories Tab */}
        <TabsContent value="categories" className="mt-4 space-y-4">
          <div className="flex justify-between items-center">
            <p className="text-xs text-muted-foreground">
              Categories define the platform catalog taxonomy. Deletion is protected if items exist.
            </p>
            <button
              type="button"
              onClick={() => setIsAddCatOpen(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-foreground text-background text-xs font-medium hover:opacity-90 transition-opacity cursor-pointer"
            >
              <Plus className="size-3.5" />
              <span>Add Category</span>
            </button>
          </div>

          <div className="rounded-2xl bg-card border border-border shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-muted/50 text-muted-foreground font-mono uppercase text-[10px] border-b border-border">
                  <tr>
                    <th className="py-3 px-4">Name & Slug</th>
                    <th className="py-3 px-4">Description</th>
                    <th className="py-3 px-4">Active Listings</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/60">
                  {loading && categories.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="py-12 text-center text-muted-foreground font-mono">
                        <Loader2 className="size-6 animate-spin mx-auto mb-2 text-muted-foreground" />
                        Loading platform categories...
                      </td>
                    </tr>
                  ) : (
                    categories.map((c) => (
                      <tr key={c.id} className="hover:bg-muted/30 transition-colors">
                        <td className="py-3 px-4">
                          <div className="font-semibold text-foreground">{c.name}</div>
                          <div className="font-mono text-[10px] text-muted-foreground">{c.slug}</div>
                        </td>
                        <td className="py-3 px-4 text-muted-foreground text-[11px] max-w-[280px]">
                          {c.description}
                        </td>
                        <td className="py-3 px-4 font-mono font-bold text-foreground">
                          {c.resourceCount} {c.resourceCount === 1 ? "item" : "items"}
                        </td>
                        <td className="py-3 px-4">
                          <span
                            className={`inline-flex items-center gap-1 font-mono text-[10px] uppercase font-bold px-2 py-0.5 rounded-full border ${
                              c.isActive
                                ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20"
                                : "bg-muted text-muted-foreground border-border"
                            }`}
                          >
                            {c.isActive ? "Active" : "Inactive"}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              type="button"
                              onClick={() => {
                                setEditingCat(c);
                                setEditName(c.name);
                                setEditDesc(c.description);
                                setEditActive(c.isActive);
                              }}
                              title="Edit Category"
                              className="p-1.5 rounded-lg border border-border bg-card hover:bg-muted text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                            >
                              <Edit2 className="size-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDeleteCategory(c)}
                              title={
                                c.resourceCount > 0
                                  ? `Protected from deletion (${c.resourceCount} active listings)`
                                  : "Delete Category"
                              }
                              className={`p-1.5 rounded-lg border transition-colors cursor-pointer ${
                                c.resourceCount > 0
                                  ? "border-border text-muted-foreground/40 hover:text-rose-500"
                                  : "border-rose-500/20 bg-rose-500/5 hover:bg-rose-500/10 text-rose-600 dark:text-rose-400"
                              }`}
                            >
                              <Trash2 className="size-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </TabsContent>

        {/* Configuration Tab */}
        <TabsContent value="config" className="mt-4 space-y-6">
          {/* Announcement Banner Box */}
          <div className="p-6 rounded-2xl bg-card border border-border shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
                  <Megaphone className="size-4 text-muted-foreground" />
                  <span>Global Announcement Banner</span>
                </h3>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Display an informational broadcast banner at the top of every page.
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  const current = formSettings["announcement_banner_enabled"] === "true";
                  const nextVal = current ? "false" : "true";
                  setFormSettings((prev) => ({ ...prev, announcement_banner_enabled: nextVal }));
                  handleSaveSetting("announcement_banner_enabled", nextVal);
                }}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors cursor-pointer ${
                  formSettings["announcement_banner_enabled"] === "true" ? "bg-foreground" : "bg-muted"
                }`}
              >
                <span
                  className={`inline-block size-4 transform rounded-full bg-background transition-transform ${
                    formSettings["announcement_banner_enabled"] === "true" ? "translate-x-6" : "translate-x-1"
                  }`}
                />
              </button>
            </div>

            <div>
              <label className="block text-xs font-semibold text-foreground mb-1.5">
                Announcement Message:
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={formSettings["announcement_banner_text"] || ""}
                  onChange={(e) =>
                    setFormSettings((prev) => ({ ...prev, announcement_banner_text: e.target.value }))
                  }
                  placeholder="E.g. Scheduled maintenance notice or community update..."
                  className="flex-1 px-3 py-2 text-xs rounded-xl bg-muted/30 border border-border text-foreground"
                />
                <button
                  type="button"
                  onClick={() =>
                    handleSaveSetting(
                      "announcement_banner_text",
                      formSettings["announcement_banner_text"] || ""
                    )
                  }
                  disabled={savingSettings}
                  className="px-4 py-2 rounded-xl bg-foreground text-background text-xs font-medium hover:opacity-90 transition-opacity cursor-pointer disabled:opacity-50"
                >
                  Save Text
                </button>
              </div>
            </div>
          </div>

          {/* System Moderation & Upload Rules */}
          <div className="p-6 rounded-2xl bg-card border border-border shadow-xs space-y-5">
            <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
              <ShieldCheck className="size-4 text-muted-foreground" />
              <span>Moderation & Storage Policies</span>
            </h3>

            {/* Auto-Approve Toggle */}
            <div className="flex items-center justify-between pt-2 border-t border-border/60">
              <div>
                <div className="text-xs font-semibold text-foreground">Auto-Approve New Listings</div>
                <div className="text-[11px] text-muted-foreground">
                  When enabled, newly created listings are published immediately. When disabled, listings enter pending review.
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  const current = formSettings["auto_approve_listings"] === "true";
                  const nextVal = current ? "false" : "true";
                  setFormSettings((prev) => ({ ...prev, auto_approve_listings: nextVal }));
                  handleSaveSetting("auto_approve_listings", nextVal);
                }}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors cursor-pointer ${
                  formSettings["auto_approve_listings"] === "true" ? "bg-foreground" : "bg-muted"
                }`}
              >
                <span
                  className={`inline-block size-4 transform rounded-full bg-background transition-transform ${
                    formSettings["auto_approve_listings"] === "true" ? "translate-x-6" : "translate-x-1"
                  }`}
                />
              </button>
            </div>

            {/* Max Upload Size */}
            <div className="flex items-center justify-between pt-3 border-t border-border/60">
              <div>
                <div className="text-xs font-semibold text-foreground">Maximum Upload Size (MB)</div>
                <div className="text-[11px] text-muted-foreground">
                  File size boundary enforced for image uploads on listings and avatar profiles.
                </div>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min="1"
                  max="25"
                  value={formSettings["max_upload_size_mb"] || "5"}
                  onChange={(e) =>
                    setFormSettings((prev) => ({ ...prev, max_upload_size_mb: e.target.value }))
                  }
                  className="w-20 px-2 py-1 text-xs rounded-lg bg-muted/30 border border-border text-foreground font-mono text-center"
                />
                <button
                  type="button"
                  onClick={() =>
                    handleSaveSetting(
                      "max_upload_size_mb",
                      formSettings["max_upload_size_mb"] || "5"
                    )
                  }
                  className="px-3 py-1 rounded-lg bg-foreground text-background text-xs font-medium cursor-pointer"
                >
                  Save
                </button>
              </div>
            </div>

            {/* Allowed File Types */}
            <div className="flex items-center justify-between pt-3 border-t border-border/60">
              <div>
                <div className="text-xs font-semibold text-foreground">Allowed File Types</div>
                <div className="text-[11px] text-muted-foreground">
                  Comma-separated permitted file extensions.
                </div>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={formSettings["allowed_file_types"] || ".jpg,.jpeg,.png,.webp,.pdf"}
                  onChange={(e) =>
                    setFormSettings((prev) => ({ ...prev, allowed_file_types: e.target.value }))
                  }
                  className="w-48 px-2 py-1 text-xs rounded-lg bg-muted/30 border border-border text-foreground font-mono"
                />
                <button
                  type="button"
                  onClick={() =>
                    handleSaveSetting(
                      "allowed_file_types",
                      formSettings["allowed_file_types"] || ".jpg,.jpeg,.png,.webp,.pdf"
                    )
                  }
                  className="px-3 py-1 rounded-lg bg-foreground text-background text-xs font-medium cursor-pointer"
                >
                  Save
                </button>
              </div>
            </div>
          </div>
        </TabsContent>
      </Tabs>

      {/* Add Category Dialog */}
      <Dialog open={isAddCatOpen} onOpenChange={setIsAddCatOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-base font-bold text-foreground">
              <Plus className="size-4" />
              <span>Add Platform Category</span>
            </DialogTitle>
            <DialogDescription className="text-xs">
              Create a new equipment and resource classification.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3 pt-2 text-xs">
            <div>
              <label className="block text-xs font-semibold text-foreground mb-1">Category Name:</label>
              <input
                type="text"
                placeholder="E.g. Musical Instruments"
                value={catName}
                onChange={(e) => {
                  setCatName(e.target.value);
                  if (!catSlug) {
                    setCatSlug(e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, "-"));
                  }
                }}
                className="w-full px-3 py-2 text-xs rounded-xl bg-muted/30 border border-border text-foreground"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-foreground mb-1">URL Slug:</label>
              <input
                type="text"
                placeholder="musical-instruments"
                value={catSlug}
                onChange={(e) => setCatSlug(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl bg-muted/30 border border-border text-foreground font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-foreground mb-1">Description:</label>
              <textarea
                rows={2}
                placeholder="Guitars, keyboards, recording mics, amplifiers and sound gear..."
                value={catDesc}
                onChange={(e) => setCatDesc(e.target.value)}
                className="w-full p-2.5 text-xs rounded-xl bg-muted/30 border border-border text-foreground"
              />
            </div>
          </div>

          <DialogFooter className="pt-3">
            <button
              type="button"
              onClick={() => setIsAddCatOpen(false)}
              className="px-4 py-2 rounded-xl text-xs font-medium border border-border bg-card hover:bg-muted text-foreground transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleCreateCategory}
              disabled={addingCat || !catName.trim() || !catDesc.trim()}
              className="px-4 py-2 rounded-xl text-xs font-medium bg-foreground text-background hover:opacity-90 transition-opacity cursor-pointer disabled:opacity-50"
            >
              {addingCat ? "Creating..." : "Create Category"}
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Category Dialog */}
      <Dialog open={!!editingCat} onOpenChange={(open) => !open && setEditingCat(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-base font-bold text-foreground">
              <Edit2 className="size-4" />
              <span>Edit Category</span>
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-3 pt-2 text-xs">
            <div>
              <label className="block text-xs font-semibold text-foreground mb-1">Name:</label>
              <input
                type="text"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl bg-muted/30 border border-border text-foreground"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-foreground mb-1">Description:</label>
              <textarea
                rows={2}
                value={editDesc}
                onChange={(e) => setEditDesc(e.target.value)}
                className="w-full p-2.5 text-xs rounded-xl bg-muted/30 border border-border text-foreground"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-foreground mb-1">Active Status:</label>
              <select
                value={editActive}
                onChange={(e) => setEditActive(parseInt(e.target.value))}
                className="w-full px-3 py-2 text-xs rounded-xl bg-muted/30 border border-border text-foreground font-mono"
              >
                <option value={1}>Active (Visible in catalog)</option>
                <option value={0}>Inactive (Hidden from creation/catalog)</option>
              </select>
            </div>
          </div>

          <DialogFooter className="pt-3">
            <button
              type="button"
              onClick={() => setEditingCat(null)}
              className="px-4 py-2 rounded-xl text-xs font-medium border border-border bg-card hover:bg-muted text-foreground transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleUpdateCategory}
              disabled={savingCat}
              className="px-4 py-2 rounded-xl text-xs font-medium bg-foreground text-background hover:opacity-90 transition-opacity cursor-pointer disabled:opacity-50"
            >
              {savingCat ? "Saving..." : "Save Changes"}
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
