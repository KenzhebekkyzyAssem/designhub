"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import {
  Bookmark,
  Check,
  ChevronDown,
  FolderPlus,
  Grid2X2,
  Image as ImageIcon,
  Layers3,
  Lightbulb,
  List,
  Pencil,
  Plus,
  Search,
  Sparkles,
  Trash2,
  X,
} from "lucide-react";

type Inspiration = {
  id: number;
  title: string;
  image: string;
  width: number;
  height: number;
  photographer: {
    name: string;
    url: string;
  };
  pexelsUrl: string;
};

const categories = [
  "All",
  "Websites",
  "UI/UX",
  "Branding",
  "Typography",
  "Colors",
  "Interior",
  "Photography",
];

export default function InspirationPage() {
  const [inspirations, setInspirations] = useState<Inspiration[]>([]);
  const [activeCategory, setActiveCategory] = useState("All");
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const [page, setPage] = useState(1);
  const [totalResults, setTotalResults] = useState(0);
  const [sort, setSort] = useState<"recent" | "title">("recent");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  const [activeTab, setActiveTab] =
    useState<"discover" | "saved" | "collections">("discover");
  const [savedInspirations, setSavedInspirations] = useState<Inspiration[]>([]);
  const [savedIds, setSavedIds] = useState<Set<number>>(new Set());
  const [savingId, setSavingId] = useState<number | null>(null);

  const [collections, setCollections] = useState<
    {
      id: string;
      name: string;
      previews: string[];
    }[]
  >([]);
  const [showCollectionModal, setShowCollectionModal] = useState(false);
  const [collectionName, setCollectionName] = useState("");
  const [creatingCollection, setCreatingCollection] = useState(false);

  const [collectionPickerOpen, setCollectionPickerOpen] = useState(false);
  const [selectedInspiration, setSelectedInspiration] =
    useState<Inspiration | null>(null);
  const [addingToCollection, setAddingToCollection] = useState(false);

  const [selectedCollection, setSelectedCollection] = useState<{
    id: string;
    name: string;
  } | null>(null);
  const [collectionItems, setCollectionItems] = useState<Inspiration[]>([]);
  const [loadingCollection, setLoadingCollection] = useState(false);

  const [editingCollection, setEditingCollection] = useState<{
    id: string;
    name: string;
  } | null>(null);
  const [editCollectionName, setEditCollectionName] = useState("");
  const [deletingCollectionId, setDeletingCollectionId] = useState<string | null>(null);
  const [removingItemId, setRemovingItemId] = useState<number | null>(null);

  useEffect(() => {
    loadInspirations(activeCategory);
  }, [activeCategory]);

  useEffect(() => {
    if (activeTab !== "discover") return;

    const timer = setTimeout(() => {
      setPage(1);
      loadInspirations(activeCategory, 1, search);
    }, 500);

    return () => clearTimeout(timer);
  }, [search]);

  useEffect(() => {
    if (activeTab !== "discover") return;

    setPage(1);
    loadInspirations(activeCategory, 1, search);
  }, [activeCategory]);

  useEffect(() => {
    loadSavedInspirations();
    loadCollections();
  }, []);

  async function loadInspirations(
    category: string,
    currentPage = 1,
    searchQuery = search
  ) {
    try {
      setLoading(true);

      const params = new URLSearchParams();

      params.set("category", category.toLowerCase());
      params.set("page", String(currentPage));

      if (searchQuery.trim()) {
        params.set("search", searchQuery.trim());
      }

      const response = await fetch(
        `/api/inspiration?${params.toString()}`
      );

      if (!response.ok) {
        throw new Error("Failed to load inspirations");
      }

      const data = await response.json();

      setInspirations(data.inspirations || []);
      setTotalResults(data.totalResults || 0);
      setPage(data.page || currentPage);
    } catch (error) {
      console.error("Inspiration load error:", error);
      setInspirations([]);
    } finally {
      setLoading(false);
    }
  }

  async function loadSavedInspirations() {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        setSavedInspirations([]);
        setSavedIds(new Set());
        return;
      }

      const { data, error } = await supabase
        .from("saved_inspirations")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Saved inspirations load error:", error);
        return;
      }

      const formatted: Inspiration[] = (data || []).map((item) => ({
        id: Number(item.inspiration_id),
        title: item.title || "Creative inspiration",
        image: item.image_url,
        width: 0,
        height: 0,

        photographer: {
          name: item.photographer_name || "Unknown",
          url: item.photographer_url || "#",
        },

        pexelsUrl: item.source_url || "#",
      }));

      setSavedInspirations(formatted);

      setSavedIds(
        new Set(
          (data || []).map((item) => Number(item.inspiration_id))
        )
      );
    } catch (error) {
      console.error("Saved inspirations error:", error);
    }
  }

  async function loadCollections() {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        setCollections([]);
        return;
      }

      const { data, error } = await supabase
        .from("inspiration_collections")
        .select(`
          id,
          name,
          inspiration_collection_items (
            saved_inspirations (
              image_url
            )
          )
        `)
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Collections load error:", error);
        return;
      }

      const formatted = (data || []).map((collection: any) => {
        const previews = (
          collection.inspiration_collection_items || []
        )
          .map((item: any) => item.saved_inspirations?.image_url)
          .filter(Boolean)
          .slice(0, 4);

        return {
          id: collection.id,
          name: collection.name,
          previews,
        };
      });

      setCollections(formatted);
    } catch (error) {
      console.error("Collections error:", error);
    }
  }

  async function loadCollectionItems(collectionId: string) {
    try {
      setLoadingCollection(true);

      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) return;

      const { data, error } = await supabase
        .from("inspiration_collection_items")
        .select(`
          id,
          saved_inspiration_id,
          saved_inspirations (
            id,
            inspiration_id,
            title,
            image_url,
            photographer_name,
            photographer_url,
            source_url,
            category
          )
        `)
        .eq("collection_id", collectionId);

      if (error) {
        console.error("Collection items load error:", error);
        return;
      }

      const formatted: Inspiration[] = (data || [])
        .map((row: any) => {
          const item = row.saved_inspirations;

          if (!item) return null;

          return {
            id: Number(item.inspiration_id),
            title: item.title || "Creative inspiration",
            image: item.image_url,
            width: 0,
            height: 0,

            photographer: {
              name: item.photographer_name || "Unknown",
              url: item.photographer_url || "#",
            },

            pexelsUrl: item.source_url || "#",
          };
        })
        .filter(Boolean) as Inspiration[];

      setCollectionItems(formatted);
    } catch (error) {
      console.error("Collection items error:", error);
    } finally {
      setLoadingCollection(false);
    }
  }

  async function openCollection(collection: {
    id: string;
    name: string;
  }) {
    setSelectedCollection(collection);
    await loadCollectionItems(collection.id);
  }

  async function createCollection() {
    const name = collectionName.trim();

    if (!name) return;

    try {
      setCreatingCollection(true);

      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        alert("Please log in first.");
        return;
      }

      const { error } = await supabase
        .from("inspiration_collections")
        .insert({
          user_id: user.id,
          name,
        });

      if (error) {
        console.error("Create collection error:", error);
        return;
      }

      setCollectionName("");
      setShowCollectionModal(false);

      await loadCollections();
    } catch (error) {
      console.error("Create collection error:", error);
    } finally {
      setCreatingCollection(false);
    }
  }

  async function renameCollection() {
    if (!editingCollection) return;

    const newName = editCollectionName.trim();

    if (!newName) return;

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) return;

      const { error } = await supabase
        .from("inspiration_collections")
        .update({
          name: newName,
        })
        .eq("id", editingCollection.id)
        .eq("user_id", user.id);

      if (error) {
        console.error("Rename collection error:", error);
        return;
      }

      if (selectedCollection?.id === editingCollection.id) {
        setSelectedCollection({
          id: editingCollection.id,
          name: newName,
        });
      }

      setEditingCollection(null);
      setEditCollectionName("");

      await loadCollections();
    } catch (error) {
      console.error("Rename collection error:", error);
    }
  }

  async function deleteCollection(collectionId: string) {
    const confirmed = window.confirm(
      "Delete this collection? Saved inspirations will not be deleted."
    );

    if (!confirmed) return;

    try {
      setDeletingCollectionId(collectionId);

      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) return;

      const { error } = await supabase
        .from("inspiration_collections")
        .delete()
        .eq("id", collectionId)
        .eq("user_id", user.id);

      if (error) {
        console.error("Delete collection error:", error);
        return;
      }

      if (selectedCollection?.id === collectionId) {
        setSelectedCollection(null);
        setCollectionItems([]);
      }

      await loadCollections();
    } catch (error) {
      console.error("Delete collection error:", error);
    } finally {
      setDeletingCollectionId(null);
    }
  }

  async function removeFromCollection(inspirationId: number) {
    if (!selectedCollection) return;

    try {
      setRemovingItemId(inspirationId);

      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) return;

      const { data: savedItem, error: savedError } = await supabase
        .from("saved_inspirations")
        .select("id")
        .eq("user_id", user.id)
        .eq("inspiration_id", inspirationId)
        .single();

      if (savedError || !savedItem) {
        console.error("Saved inspiration not found:", savedError);
        return;
      }

      const { error } = await supabase
        .from("inspiration_collection_items")
        .delete()
        .eq("collection_id", selectedCollection.id)
        .eq("saved_inspiration_id", savedItem.id);

      if (error) {
        console.error("Remove from collection error:", error);
        return;
      }

      await loadCollectionItems(selectedCollection.id);
      await loadCollections();
    } catch (error) {
      console.error("Remove from collection error:", error);
    } finally {
      setRemovingItemId(null);
    }
  }

  async function toggleSave(item: Inspiration) {
    try {
      setSavingId(item.id);

      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        alert("Please log in to save inspiration.");
        return;
      }

      const alreadySaved = savedIds.has(item.id);

      if (alreadySaved) {
        const { error } = await supabase
          .from("saved_inspirations")
          .delete()
          .eq("user_id", user.id)
          .eq("inspiration_id", item.id);

        if (error) {
          console.error("Delete saved inspiration error:", error);
          return;
        }
      } else {
        const { error } = await supabase
          .from("saved_inspirations")
          .insert({
            user_id: user.id,
            inspiration_id: item.id,
            title: item.title,
            image_url: item.image,

            photographer_name: item.photographer.name,
            photographer_url: item.photographer.url,

            source_url: item.pexelsUrl,

            category:
              activeCategory === "All"
                ? "Inspiration"
                : activeCategory,
          });

        if (error) {
          console.error("Save inspiration error:", error);
          return;
        }
      }

      await loadSavedInspirations();
    } catch (error) {
      console.error("Toggle save error:", error);
    } finally {
      setSavingId(null);
    }
  }

  async function addToCollection(collectionId: string) {
    if (!selectedInspiration) return;

    try {
      setAddingToCollection(true);

      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        alert("Please log in first.");
        return;
      }

      const { data: savedItem, error: savedError } = await supabase
        .from("saved_inspirations")
        .select("id")
        .eq("user_id", user.id)
        .eq("inspiration_id", selectedInspiration.id)
        .single();

      if (savedError || !savedItem) {
        console.error("Saved inspiration not found:", savedError);
        return;
      }

      const { error } = await supabase
        .from("inspiration_collection_items")
        .insert({
          collection_id: collectionId,
          saved_inspiration_id: savedItem.id,
        });

      if (error) {
        if (error.code === "23505") {
          console.log("Already added to this collection");
        } else {
          console.error("Add to collection error:", error);
          return;
        }
      }

      await loadCollections();
      setCollectionPickerOpen(false);
      setSelectedInspiration(null);
    } catch (error) {
      console.error("Add to collection error:", error);
    } finally {
      setAddingToCollection(false);
    }
  }

  const baseInspirations =
    activeTab === "saved"
      ? savedInspirations
      : inspirations;

  const displayedInspirations = [...baseInspirations].sort(
    (a, b) => {
      if (sort === "title") {
        return a.title.localeCompare(b.title);
      }

      return 0;
    }
  );

  const totalPages = Math.max(
    1,
    Math.ceil(totalResults / 20)
  );

  return (
    <main className="min-h-screen bg-white px-8 pb-12 pt-9 text-[#111827]">

      {/* HEADER */}

      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-[31px] font-semibold tracking-[-0.04em] text-[#111111]">
            Inspiration
          </h1>

          <p className="mt-1.5 text-[13px] text-[#7b8495]">
            Discover ideas and save inspiration for your creative projects.
          </p>
        </div>

        <button className="flex h-[44px] items-center gap-2 rounded-xl bg-gradient-to-r from-[#5c45e8] to-[#704ff5] px-5 text-[13px] font-semibold text-white shadow-[0_8px_24px_rgba(92,69,232,0.16)]">
          <Sparkles size={15} />
          Explore inspiration
        </button>
      </div>

      {/* STATS */}

      <section className="mt-7 grid grid-cols-4 gap-4">
        <StatCard
          icon={<Lightbulb size={20} />}
          title="Discover"
          value="Explore"
          description="Curated inspiration for you"
        />

        <StatCard
          icon={<Bookmark size={20} />}
          title="Saved"
          value={savedInspirations.length.toString()}
          description="Your saved inspirations"
        />

        <StatCard
          icon={<ImageIcon size={20} />}
          title="Collections"
          value={String(collections.length)}
          description="Organized inspiration boards"
        />

        <StatCard
          icon={<Layers3 size={20} />}
          title="Categories"
          value="8"
          description="Explore different styles"
        />
      </section>

      {/* TABS */}

      <div className="mt-8 border-b border-[#ececf1]">
        <div className="flex items-center justify-between">

          <div className="flex gap-8">
            <button
              onClick={() => {
                setActiveTab("discover");
                setSelectedCollection(null);
              }}
              className={`relative pb-3 text-[13px] font-semibold ${
                activeTab === "discover"
                  ? "text-[#6047ed]"
                  : "text-[#8a93a3]"
              }`}
            >
              Discover

              {activeTab === "discover" && (
                <span className="absolute bottom-[-1px] left-0 h-[2px] w-full rounded-full bg-[#6047ed]" />
              )}
            </button>

            <button
              onClick={() => {
                setActiveTab("saved");
                setSelectedCollection(null);
              }}
              className={`relative pb-3 text-[13px] font-semibold ${
                activeTab === "saved"
                  ? "text-[#6047ed]"
                  : "text-[#8a93a3]"
              }`}
            >
              Saved

              <span className="ml-2 rounded-full bg-[#f2efff] px-2 py-0.5 text-[10px] text-[#6047ed]">
                {savedInspirations.length}
              </span>

              {activeTab === "saved" && (
                <span className="absolute bottom-[-1px] left-0 h-[2px] w-full rounded-full bg-[#6047ed]" />
              )}
            </button>

            <button
              onClick={() => {
                setActiveTab("collections");
                setSelectedCollection(null);
              }}
              className={`relative pb-3 text-[13px] font-semibold ${
                activeTab === "collections"
                  ? "text-[#6047ed]"
                  : "text-[#8a93a3]"
              }`}
            >
              Collections

              <span className="ml-2 rounded-full bg-[#f2efff] px-2 py-0.5 text-[10px] text-[#6047ed]">
                {collections.length}
              </span>

              {activeTab === "collections" && (
                <span className="absolute bottom-[-1px] left-0 h-[2px] w-full rounded-full bg-[#6047ed]" />
              )}
            </button>
          </div>

          <button
            type="button"
            onClick={() => setShowCollectionModal(true)}
            className="mb-2 flex h-9 items-center gap-2 rounded-xl border border-[#e5e7ec] bg-white px-3.5 text-[11px] font-semibold text-[#525b6b] transition hover:border-[#cbc2fb] hover:bg-[#faf9ff] hover:text-[#6047ed]"
          >
            <FolderPlus size={14} />
            New collection
          </button>

        </div>
      </div>

      {/* FILTERS */}

      {activeTab === "discover" && (
        <section className="mt-4 flex items-center justify-between gap-5">
          <div className="flex items-center gap-2">
            {categories.map((category) => {
              const active = activeCategory === category;

              return (
                <button
                  key={category}
                  onClick={() => setActiveCategory(category)}
                  className={
                    active
                      ? "rounded-xl bg-gradient-to-r from-[#5c45e8] to-[#6c4ff4] px-4 py-2.5 text-[12px] font-semibold text-white"
                      : "rounded-xl border border-[#e7e8ed] bg-white px-4 py-2.5 text-[12px] font-medium text-[#596273] transition hover:bg-[#fafafa]"
                  }
                >
                  {category}
                </button>
              );
            })}
          </div>

          <div className="flex items-center gap-2">
            <div className="flex h-10 w-[220px] items-center gap-2 rounded-xl border border-[#e7e8ed] bg-white px-3">
              <Search size={15} className="shrink-0 text-[#9ca3af]" />

              <input
                type="text"
                placeholder="Search..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full bg-transparent text-[12px] outline-none placeholder:text-[#9ca3af]"
              />

              {search && (
                <button
                  type="button"
                  onClick={() => setSearch("")}
                  className="text-[#a0a6b2] transition hover:text-[#596273]"
                >
                  <X size={13} />
                </button>
              )}
            </div>

            <div className="relative">
              <select
                value={sort}
                onChange={(e) =>
                  setSort(e.target.value as "recent" | "title")
                }
                className="h-10 appearance-none rounded-xl border border-[#e7e8ed] bg-white pl-4 pr-9 text-[12px] font-medium text-[#475467] outline-none"
              >
                <option value="recent">Most recent</option>
                <option value="title">Title A-Z</option>
              </select>

              <ChevronDown
                size={14}
                className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[#7b8495]"
              />
            </div>

            <button
              type="button"
              onClick={() => setViewMode("grid")}
              className={`flex h-10 w-10 items-center justify-center rounded-xl border transition ${
                viewMode === "grid"
                  ? "border-[#bcaefd] bg-[#f7f4ff] text-[#6547ef]"
                  : "border-[#e7e8ed] bg-white text-[#7b8495]"
              }`}
            >
              <Grid2X2 size={16} />
            </button>

            <button
              type="button"
              onClick={() => setViewMode("list")}
              className={`flex h-10 w-10 items-center justify-center rounded-xl border transition ${
                viewMode === "list"
                  ? "border-[#bcaefd] bg-[#f7f4ff] text-[#6547ef]"
                  : "border-[#e7e8ed] bg-white text-[#7b8495]"
              }`}
            >
              <List size={16} />
            </button>
          </div>
        </section>
      )}

      {/* COLLECTIONS UI */}

      {activeTab === "collections" && (
        <section className="mt-6">
          {!selectedCollection ? (
            collections.length === 0 ? (
              <div className="flex min-h-[350px] flex-col items-center justify-center rounded-2xl border border-dashed border-[#dedfe6] bg-[#fcfcfd]">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#f3efff] text-[#6547ef]">
                  <FolderPlus size={22} />
                </div>

                <h3 className="mt-4 text-[14px] font-semibold text-[#303544]">
                  No collections yet
                </h3>

                <p className="mt-1 text-[11px] text-[#9299a8]">
                  Create a collection to organize your saved inspiration.
                </p>

                <button
                  type="button"
                  onClick={() => setShowCollectionModal(true)}
                  className="mt-5 rounded-xl bg-[#6547ef] px-4 py-2.5 text-[11px] font-semibold text-white"
                >
                  Create collection
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-4 gap-5">
                {collections.map((collection) => (
                  <div
                    key={collection.id}
                    className="group relative overflow-hidden rounded-2xl border border-[#e7e8ed] bg-white transition hover:-translate-y-[2px] hover:border-[#d4ccfb] hover:shadow-[0_14px_35px_rgba(40,32,90,0.07)]"
                  >
                    <button
                      type="button"
                      onClick={() => openCollection(collection)}
                      className="block w-full text-left"
                    >
                      {/* PREVIEW */}

                      <div className="grid aspect-[16/10] grid-cols-2 grid-rows-2 gap-[2px] bg-[#f2f1f7]">
                        {collection.previews.length > 0 ? (
                          <>
                            {Array.from({ length: 4 }).map((_, index) => {
                              const image = collection.previews[index];

                              return image ? (
                                <img
                                  key={index}
                                  src={image}
                                  alt=""
                                  className="h-full w-full object-cover"
                                />
                              ) : (
                                <div
                                  key={index}
                                  className="flex h-full w-full items-center justify-center bg-[#f6f5fa]"
                                />
                              );
                            })}
                          </>
                        ) : (
                          <div className="col-span-2 row-span-2 flex items-center justify-center bg-[#f8f7fb]">
                            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#f0ecff] text-[#6547ef]">
                              <FolderPlus size={22} />
                            </div>
                          </div>
                        )}
                      </div>

                      {/* CONTENT */}

                      <div className="p-4">
                        <h3 className="truncate pr-12 text-[13px] font-semibold text-[#252936]">
                          {collection.name}
                        </h3>

                        <p className="mt-1 text-[10px] text-[#9299a8]">
                          {collection.previews.length === 0
                            ? "Empty collection"
                            : "Open collection"}
                        </p>
                      </div>
                    </button>

                    {/* ACTIONS */}

                    <div className="absolute right-3 top-3 flex gap-1 opacity-0 transition group-hover:opacity-100">
                      <button
                        type="button"
                        onClick={() => {
                          setEditingCollection({
                            id: collection.id,
                            name: collection.name,
                          });

                          setEditCollectionName(collection.name);
                        }}
                        className="flex h-8 w-8 items-center justify-center rounded-lg border border-white/70 bg-white/90 text-[#7b8495] shadow-sm backdrop-blur transition hover:text-[#6547ef]"
                      >
                        <Pencil size={13} />
                      </button>

                      <button
                        type="button"
                        disabled={deletingCollectionId === collection.id}
                        onClick={() => deleteCollection(collection.id)}
                        className="flex h-8 w-8 items-center justify-center rounded-lg border border-white/70 bg-white/90 text-[#9299a8] shadow-sm backdrop-blur transition hover:text-[#d64b5f]"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )
          ) : (
            <>
              <div className="mb-5 flex items-center justify-between">
                <div>
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedCollection(null);
                      setCollectionItems([]);
                    }}
                    className="text-[11px] font-medium text-[#6547ef]"
                  >
                    ← Back to collections
                  </button>

                  <h2 className="mt-3 text-[20px] font-semibold tracking-[-0.03em] text-[#20242f]">
                    {selectedCollection.name}
                  </h2>

                  <p className="mt-1 text-[11px] text-[#8b93a1]">
                    {collectionItems.length} inspiration
                    {collectionItems.length === 1 ? "" : "s"}
                  </p>
                </div>
              </div>

              {loadingCollection ? (
                <div className="grid grid-cols-4 gap-5">
                  {Array.from({ length: 4 }).map((_, index) => (
                    <div
                      key={index}
                      className="overflow-hidden rounded-2xl border border-[#e7e8ed]"
                    >
                      <div className="aspect-[16/10] animate-pulse bg-[#f0f1f4]" />
                      <div className="p-4">
                        <div className="h-3 w-2/3 animate-pulse rounded bg-[#eceef2]" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : collectionItems.length === 0 ? (
                <div className="flex min-h-[300px] flex-col items-center justify-center rounded-2xl border border-dashed border-[#dedfe6]">
                  <FolderPlus size={22} className="text-[#aaaebe]" />

                  <h3 className="mt-4 text-[14px] font-semibold text-[#303544]">
                    This collection is empty
                  </h3>

                  <p className="mt-1 text-[11px] text-[#9299a8]">
                    Add saved inspirations to this collection.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-4 gap-5">
                  {collectionItems.map((item) => (
                    <article
                      key={item.id}
                      className="group overflow-hidden rounded-2xl border border-[#e7e8ed] bg-white transition hover:-translate-y-[2px] hover:border-[#d8d2fb] hover:shadow-[0_14px_35px_rgba(40,32,90,0.08)]"
                    >
                      <div className="relative aspect-[16/10] overflow-hidden bg-[#f5f5f7]">
                        <a
                          href={item.pexelsUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="block h-full w-full"
                          title="View source on Pexels"
                        >
                          <img
                            src={item.image}
                            alt={item.title}
                            className="h-full w-full object-cover transition duration-300 group-hover:scale-[1.02]"
                          />
                        </a>

                        <button
                          type="button"
                          disabled={removingItemId === item.id}
                          onClick={() => removeFromCollection(item.id)}
                          className="absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-xl border border-white/70 bg-white/90 text-[#7b8495] opacity-0 shadow-sm backdrop-blur transition hover:text-[#d64b5f] group-hover:opacity-100"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>

                      <div className="p-4">
                        <a
                          href={item.pexelsUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="block"
                          title="View source on Pexels"
                        >
                          <h3 className="line-clamp-1 text-[13px] font-semibold text-[#222735] transition hover:text-[#6547ef]">
                            {item.title}
                          </h3>
                        </a>

                        <p className="mt-2 truncate text-[10px] text-[#8a93a3]">
                          Photo by{" "}
                          <a
                            href={item.photographer.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="font-medium text-[#6547ef] hover:underline"
                          >
                            {item.photographer.name}
                          </a>
                        </p>

                        <a
                          href={item.pexelsUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="mt-2 inline-block text-[9px] font-medium text-[#9299a8] hover:text-[#6547ef]"
                        >
                          View on Pexels
                        </a>
                      </div>
                    </article>
                  ))}
                </div>
              )}
            </>
          )}
        </section>
      )}

      {/* DISCOVER / SAVED FEED */}

      {activeTab !== "collections" && (
        <section className="mt-5">
          {loading && activeTab === "discover" ? (
            <div className="grid grid-cols-4 gap-5">
              {Array.from({ length: 8 }).map((_, index) => (
                <div
                  key={index}
                  className="overflow-hidden rounded-2xl border border-[#e7e8ed] bg-white"
                >
                  <div className="aspect-[16/10] animate-pulse bg-[#f0f1f4]" />

                  <div className="p-4">
                    <div className="h-3 w-2/3 animate-pulse rounded bg-[#eceef2]" />
                    <div className="mt-3 h-2 w-1/2 animate-pulse rounded bg-[#f1f2f5]" />
                  </div>
                </div>
              ))}
            </div>
          ) : displayedInspirations.length === 0 ? (
            activeTab === "saved" ? (
              <div className="flex min-h-[360px] flex-col items-center justify-center rounded-2xl border border-dashed border-[#dedfe6] bg-[#fcfcfd] px-6 text-center">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#f3efff] text-[#6547ef]">
                  <Bookmark size={22} />
                </div>

                <h3 className="mt-5 text-[15px] font-semibold text-[#252936]">
                  No saved inspiration yet
                </h3>

                <p className="mt-2 max-w-[360px] text-[11px] leading-5 text-[#8b93a1]">
                  Save ideas you like from Discover and they’ll appear here.
                </p>

                <button
                  type="button"
                  onClick={() => setActiveTab("discover")}
                  className="mt-5 rounded-xl bg-[#6547ef] px-4 py-2.5 text-[11px] font-semibold text-white transition hover:bg-[#5a3ee5]"
                >
                  Explore inspiration
                </button>
              </div>
            ) : (
              <div className="flex min-h-[320px] flex-col items-center justify-center rounded-2xl border border-dashed border-[#dedfe6]">
                <ImageIcon size={25} className="text-[#aaaebe]" />

                <h3 className="mt-4 text-[14px] font-semibold text-[#303544]">
                  No inspiration found
                </h3>

                <p className="mt-1 text-[11px] text-[#9299a8]">
                  Try another category or search.
                </p>
              </div>
            )
          ) : (
            <div
              className={
                viewMode === "grid"
                  ? "grid grid-cols-4 gap-5"
                  : "flex flex-col gap-3"
              }
            >
              {displayedInspirations.map((item) => (
                <article
                  key={item.id}
                  className={
                    viewMode === "grid"
                      ? "group overflow-hidden rounded-2xl border border-[#e7e8ed] bg-white transition duration-200 hover:-translate-y-[2px] hover:border-[#d8d2fb] hover:shadow-[0_14px_35px_rgba(40,32,90,0.08)]"
                      : "group flex overflow-hidden rounded-2xl border border-[#e7e8ed] bg-white transition hover:border-[#d8d2fb] hover:shadow-[0_10px_30px_rgba(40,32,90,0.06)]"
                  }
                >
                  {/* IMAGE */}

                  <div
                    className={
                      viewMode === "grid"
                        ? "relative aspect-[16/10] overflow-hidden bg-[#f5f5f7]"
                        : "relative h-[140px] w-[220px] shrink-0 overflow-hidden bg-[#f5f5f7]"
                    }
                  >
                    <a
                      href={item.pexelsUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block h-full w-full"
                      title="View source on Pexels"
                    >
                      <img
                        src={item.image}
                        alt={item.title}
                        className="h-full w-full object-cover transition duration-300 group-hover:scale-[1.02]"
                      />
                    </a>

                    {viewMode === "grid" && (
                      <span className="absolute bottom-3 left-3 rounded-lg border border-white/60 bg-white/90 px-2.5 py-1 text-[9px] font-semibold uppercase tracking-[0.05em] text-[#414755] backdrop-blur">
                        {activeCategory === "All"
                          ? "Inspiration"
                          : activeCategory}
                      </span>
                    )}

                    <button
                      type="button"
                      disabled={savingId === item.id}
                      onClick={() => toggleSave(item)}
                      className={`absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-xl border border-white/70 bg-white/90 shadow-sm backdrop-blur transition ${
                        savedIds.has(item.id)
                          ? "text-[#6547ef] opacity-100"
                          : "text-[#4f5868] opacity-0 group-hover:opacity-100"
                      }`}
                    >
                      <Bookmark
                        size={15}
                        fill={savedIds.has(item.id) ? "currentColor" : "none"}
                      />
                    </button>
                  </div>

                  {/* CONTENT */}

                  <div
                    className={
                      viewMode === "grid"
                        ? "p-4"
                        : "flex flex-1 flex-col justify-center p-5"
                    }
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <a
                          href={item.pexelsUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="block"
                          title="View source on Pexels"
                        >
                          <h3 className="truncate text-[13px] font-semibold text-[#222735] transition hover:text-[#6547ef]">
                            {item.title || "Creative inspiration"}
                          </h3>
                        </a>

                        <p className="mt-1.5 truncate text-[10px] text-[#8a93a3]">
                          Photo by{" "}
                          <a
                            href={item.photographer.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="font-medium text-[#6547ef] hover:underline"
                          >
                            {item.photographer.name}
                          </a>
                        </p>
                      </div>

                      {viewMode === "grid" && (
                        <button
                          type="button"
                          onClick={() => toggleSave(item)}
                          disabled={savingId === item.id}
                          className="mt-0.5 shrink-0"
                        >
                          <Bookmark
                            size={15}
                            fill={savedIds.has(item.id) ? "currentColor" : "none"}
                            className={
                              savedIds.has(item.id)
                                ? "text-[#6547ef]"
                                : "text-[#87909f]"
                            }
                          />
                        </button>
                      )}
                    </div>

                    <div className="mt-3 flex items-center justify-between">
                      <a
                        href={item.pexelsUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[9px] font-medium text-[#9299a8] hover:text-[#6547ef]"
                      >
                        View on Pexels
                      </a>

                      <div className="flex items-center gap-2">
                        {savedIds.has(item.id) && (
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedInspiration(item);
                              setCollectionPickerOpen(true);
                            }}
                            className="flex h-8 items-center gap-1.5 rounded-lg border border-[#e5e7ec] px-2.5 text-[10px] font-medium text-[#596273] transition hover:border-[#cfc6fb] hover:bg-[#faf9ff] hover:text-[#6547ef]"
                          >
                            <FolderPlus size={13} />
                            Add to collection
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
      )}

      {/* PAGINATION */}

      {activeTab === "discover" &&
        !loading &&
        inspirations.length > 0 &&
        totalPages > 1 && (
          <div className="mt-9 flex items-center justify-center gap-2">
            <button
              type="button"
              disabled={page <= 1}
              onClick={() => {
                const nextPage = page - 1;

                setPage(nextPage);
                loadInspirations(
                  activeCategory,
                  nextPage,
                  search
                );

                window.scrollTo({
                  top: 0,
                  behavior: "smooth",
                });
              }}
              className="flex h-9 w-9 items-center justify-center rounded-xl border border-[#e6e7ec] text-[12px] text-[#596273] transition hover:bg-[#fafafa] disabled:cursor-not-allowed disabled:opacity-40"
            >
              ‹
            </button>

            {Array.from(
              { length: Math.min(5, totalPages) },
              (_, index) => {
                let pageNumber = index + 1;

                if (page > 3 && totalPages > 5) {
                  pageNumber = page - 2 + index;
                }

                if (pageNumber > totalPages) return null;

                const active = pageNumber === page;

                return (
                  <button
                    key={pageNumber}
                    type="button"
                    onClick={() => {
                      setPage(pageNumber);

                      loadInspirations(
                        activeCategory,
                        pageNumber,
                        search
                      );

                      window.scrollTo({
                        top: 0,
                        behavior: "smooth",
                      });
                    }}
                    className={
                      active
                        ? "flex h-9 w-9 items-center justify-center rounded-xl bg-[#6547ef] text-[12px] font-semibold text-white"
                        : "flex h-9 w-9 items-center justify-center rounded-xl border border-[#e6e7ec] text-[12px] text-[#596273] transition hover:bg-[#fafafa]"
                    }
                  >
                    {pageNumber}
                  </button>
                );
              }
            )}

            <button
              type="button"
              disabled={page >= totalPages}
              onClick={() => {
                const nextPage = page + 1;

                setPage(nextPage);

                loadInspirations(
                  activeCategory,
                  nextPage,
                  search
                );

                window.scrollTo({
                  top: 0,
                  behavior: "smooth",
                });
              }}
              className="flex h-9 w-9 items-center justify-center rounded-xl border border-[#e6e7ec] text-[12px] text-[#596273] transition hover:bg-[#fafafa] disabled:cursor-not-allowed disabled:opacity-40"
            >
              ›
            </button>
          </div>
        )}

      {/* COLLECTION MODAL */}
      {showCollectionModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/20 px-4 backdrop-blur-[2px]"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) {
              setShowCollectionModal(false);
            }
          }}
        >
          <div className="w-full max-w-[420px] rounded-2xl border border-[#e7e8ed] bg-white p-6 shadow-[0_25px_80px_rgba(20,20,40,0.16)]">

            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#f3efff] text-[#6547ef]">
                  <FolderPlus size={19} />
                </div>

                <h2 className="mt-4 text-[18px] font-semibold tracking-[-0.02em] text-[#20242f]">
                  Create collection
                </h2>

                <p className="mt-1 text-[11px] leading-5 text-[#8b93a1]">
                  Organize your saved inspiration into collections.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setShowCollectionModal(false)}
                className="flex h-8 w-8 items-center justify-center rounded-lg text-[#9299a8] transition hover:bg-[#f5f5f7] hover:text-[#4c5565]"
              >
                <X size={16} />
              </button>
            </div>

            <div className="mt-6">
              <label className="text-[11px] font-semibold text-[#525b6b]">
                Collection name
              </label>

              <input
                autoFocus
                type="text"
                value={collectionName}
                onChange={(e) => setCollectionName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    createCollection();
                  }
                }}
                placeholder="e.g. Website ideas"
                className="mt-2 h-11 w-full rounded-xl border border-[#e4e6ec] bg-white px-3.5 text-[12px] text-[#222735] outline-none transition placeholder:text-[#a0a6b2] focus:border-[#8d7af7] focus:ring-4 focus:ring-[#6547ef]/5"
              />
            </div>

            <div className="mt-6 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => {
                  setCollectionName("");
                  setShowCollectionModal(false);
                }}
                className="h-10 rounded-xl border border-[#e4e6ec] px-4 text-[11px] font-semibold text-[#667085] transition hover:bg-[#f8f8fa]"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={createCollection}
                disabled={
                  !collectionName.trim() || creatingCollection
                }
                className="flex h-10 items-center gap-2 rounded-xl bg-[#6547ef] px-4 text-[11px] font-semibold text-white transition hover:bg-[#593be5] disabled:cursor-not-allowed disabled:opacity-50"
              >
                <Plus size={14} />

                {creatingCollection
                  ? "Creating..."
                  : "Create collection"}
              </button>
            </div>

          </div>
        </div>
      )}

      {/* EDIT COLLECTION MODAL */}
      {editingCollection && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/20 px-4 backdrop-blur-[2px]"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) {
              setEditingCollection(null);
            }
          }}
        >
          <div className="w-full max-w-[420px] rounded-2xl border border-[#e7e8ed] bg-white p-6 shadow-[0_25px_80px_rgba(20,20,40,0.16)]">
            <div className="flex items-start justify-between">
              <div>
                <h2 className="text-[17px] font-semibold text-[#20242f]">
                  Rename collection
                </h2>

                <p className="mt-1 text-[11px] text-[#8b93a1]">
                  Change the name of your collection.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setEditingCollection(null)}
                className="flex h-8 w-8 items-center justify-center rounded-lg text-[#9299a8] hover:bg-[#f5f5f7]"
              >
                <X size={16} />
              </button>
            </div>

            <input
              autoFocus
              type="text"
              value={editCollectionName}
              onChange={(e) => setEditCollectionName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  renameCollection();
                }
              }}
              className="mt-5 h-11 w-full rounded-xl border border-[#e4e6ec] px-3.5 text-[12px] outline-none transition focus:border-[#8d7af7] focus:ring-4 focus:ring-[#6547ef]/5"
            />

            <div className="mt-6 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setEditingCollection(null)}
                className="h-10 rounded-xl border border-[#e4e6ec] px-4 text-[11px] font-semibold text-[#667085]"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={renameCollection}
                disabled={!editCollectionName.trim()}
                className="h-10 rounded-xl bg-[#6547ef] px-4 text-[11px] font-semibold text-white disabled:opacity-50"
              >
                Save changes
              </button>
            </div>
          </div>
        </div>
      )}

      {/* COLLECTION PICKER MODAL */}
      {collectionPickerOpen && selectedInspiration && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/20 px-4 backdrop-blur-[2px]"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) {
              setCollectionPickerOpen(false);
            }
          }}
        >
          <div className="w-full max-w-[420px] rounded-2xl border border-[#e7e8ed] bg-white p-6 shadow-[0_25px_80px_rgba(20,20,40,0.16)]">

            <div className="flex items-start justify-between">
              <div>
                <h2 className="text-[17px] font-semibold text-[#20242f]">
                  Add to collection
                </h2>

                <p className="mt-1 text-[11px] text-[#8b93a1]">
                  Choose where to save this inspiration.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setCollectionPickerOpen(false)}
                className="flex h-8 w-8 items-center justify-center rounded-lg text-[#9299a8] hover:bg-[#f5f5f7]"
              >
                <X size={16} />
              </button>
            </div>

            <div className="mt-5 max-h-[300px] space-y-2 overflow-y-auto">
              {collections.length === 0 ? (
                <div className="rounded-xl border border-dashed border-[#dedfe6] px-4 py-8 text-center">
                  <FolderPlus
                    size={20}
                    className="mx-auto text-[#aaaebe]"
                  />

                  <p className="mt-3 text-[12px] font-medium text-[#4f5868]">
                    No collections yet
                  </p>

                  <button
                    type="button"
                    onClick={() => {
                      setCollectionPickerOpen(false);
                      setShowCollectionModal(true);
                    }}
                    className="mt-3 text-[11px] font-semibold text-[#6547ef]"
                  >
                    Create collection
                  </button>
                </div>
              ) : (
                collections.map((collection) => (
                  <button
                    key={collection.id}
                    type="button"
                    disabled={addingToCollection}
                    onClick={() => addToCollection(collection.id)}
                    className="flex w-full items-center justify-between rounded-xl border border-[#e7e8ed] px-4 py-3 text-left transition hover:border-[#cfc6fb] hover:bg-[#faf9ff]"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#f3efff] text-[#6547ef]">
                        <FolderPlus size={15} />
                      </div>

                      <span className="text-[12px] font-medium text-[#343947]">
                        {collection.name}
                      </span>
                    </div>

                    <Check size={14} className="text-[#b0b5c0]" />
                  </button>
                ))
              )}
            </div>

          </div>
        </div>
      )}

    </main>
  );
}

function StatCard({
  icon,
  title,
  value,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  value: string;
  description: string;
}) {
  return (
    <div className="rounded-2xl border border-[#e8eaf0] bg-white p-5">
      <div className="flex items-center gap-4">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[#f3efff] text-[#6547ef]">
          {icon}
        </div>

        <div>
          <p className="text-[12px] font-medium text-[#667085]">
            {title}
          </p>

          <p className="mt-1 text-[23px] font-semibold tracking-[-0.04em] text-[#111111]">
            {value}
          </p>
        </div>
      </div>

      <p className="mt-4 text-[11px] text-[#8c95a5]">
        {description}
      </p>
    </div>
  );
}