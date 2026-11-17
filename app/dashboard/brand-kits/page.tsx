"use client";

import { ChangeEvent, useEffect, useMemo, useRef, useState } from "react";
import { supabase } from "@/lib/supabase";
import {
  ArrowLeft,
  Image as ImageIcon,
  MoreHorizontal,
  Palette,
  Plus,
  Search,
  Type,
  X,
  Trash2,
} from "lucide-react";

type BrandKit = {
  id: string;
  user_id: string;
  name: string;
  tagline: string | null;
  description: string | null;
  logo_path: string | null;
  logo_url?: string | null;
  created_at: string;
  updated_at: string;
  colors: string[];
  fonts: string[];
};

export default function BrandKitsPage() {
  const [search, setSearch] = useState("");

  const [brandKits, setBrandKits] = useState<BrandKit[]>([]);

  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    loadBrandKits();
  }, []);

  async function loadBrandKits() {
    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return setBrandKits([]);

      const { data, error } = await supabase
        .from("brand_kits").select("*").eq("user_id", user.id)
        .order("created_at", { ascending: false });
      if (error) throw error;

      const kits = await Promise.all((data || []).map(async (kit) => {
        let logo_url = null;
        if (kit.logo_path) {
          const { data: signed } = await supabase.storage
            .from("brand-kits").createSignedUrl(kit.logo_path, 3600);
          logo_url = signed?.signedUrl || null;
        }
        return {
          ...kit,
          logo_url,
          colors: Array.isArray(kit.colors) ? kit.colors : [],
          fonts: Array.isArray(kit.fonts) ? kit.fonts : [],
        } as BrandKit;
      }));
      setBrandKits(kits);
    } catch (error) {
      console.error("Brand kits load error:", error);
    } finally {
      setLoading(false);
    }
  }

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [brandName, setBrandName] = useState("");

  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [renameKit, setRenameKit] = useState<BrandKit | null>(null);
  const [renameValue, setRenameValue] = useState("");
  const [renaming, setRenaming] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const [selectedBrandKit, setSelectedBrandKit] =
    useState<BrandKit | null>(null);

  const displayedBrandKits = useMemo(() => {
    const query = search.trim().toLowerCase();

    if (!query) return brandKits;

    return brandKits.filter((kit) =>
      kit.name.toLowerCase().includes(query)
    );
  }, [brandKits, search]);

  async function createBrandKit() {
    const name = brandName.trim();
    if (!name || creating) return;
    try {
      setCreating(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return alert("Please log in first.");

      const { data, error } = await supabase.from("brand_kits")
        .insert({ user_id: user.id, name }).select("*").single();
      if (error) throw error;

      const newKit = {
        ...data,
        logo_url: null,
        colors: Array.isArray(data.colors) ? data.colors : [],
        fonts: Array.isArray(data.fonts) ? data.fonts : [],
      } as BrandKit;
      setBrandKits((current) => [newKit, ...current]);
      setBrandName("");
      setShowCreateModal(false);
      setSelectedBrandKit(newKit);
    } catch (error) {
      console.error("Create brand kit error:", error);
    } finally {
      setCreating(false);
    }
  }
  async function renameBrandKit() {
    if (!renameKit) return;

    const name = renameValue.trim();
    if (!name || renaming) return;

    try {
      setRenaming(true);

      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        alert("Please log in first.");
        return;
      }

      const now = new Date().toISOString();

      const { error } = await supabase
        .from("brand_kits")
        .update({
          name,
          updated_at: now,
        })
        .eq("id", renameKit.id)
        .eq("user_id", user.id);

      if (error) {
        console.error("Rename brand kit error:", error);
        return;
      }

      setBrandKits((current) =>
        current.map((kit) =>
          kit.id === renameKit.id
            ? { ...kit, name, updated_at: now }
            : kit
        )
      );

      setRenameKit(null);
      setRenameValue("");
    } catch (error) {
      console.error("Rename brand kit error:", error);
    } finally {
      setRenaming(false);
    }
  }

  async function deleteBrandKit(kit: BrandKit) {
    if (deletingId) return;

    const confirmed = window.confirm(
      `Delete "${kit.name}"? This action cannot be undone.`
    );

    if (!confirmed) return;

    try {
      setDeletingId(kit.id);

      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        alert("Please log in first.");
        return;
      }

      if (kit.logo_path) {
        const { error: storageError } = await supabase.storage
          .from("brand-kits")
          .remove([kit.logo_path]);

        if (storageError) {
          console.error("Logo delete error:", storageError);
        }
      }

      const { error } = await supabase
        .from("brand_kits")
        .delete()
        .eq("id", kit.id)
        .eq("user_id", user.id);

      if (error) {
        console.error("Delete brand kit error:", error);
        return;
      }

      setBrandKits((current) =>
        current.filter((item) => item.id !== kit.id)
      );

      setOpenMenuId(null);
    } catch (error) {
      console.error("Delete brand kit error:", error);
    } finally {
      setDeletingId(null);
    }
  }


  if (selectedBrandKit) {
    return (
      <BrandKitDetail
        brandKit={selectedBrandKit}
        onBack={() => {
          setSelectedBrandKit(null);
          loadBrandKits();
        }}
        onBrandKitUpdated={(updatedKit) => {
          setSelectedBrandKit(updatedKit);
          setBrandKits((current) =>
            current.map((kit) => kit.id === updatedKit.id ? updatedKit : kit)
          );
        }}
      />
    );
  }

  return (
    <main className="min-h-screen bg-white px-8 pb-12 pt-9 text-[#111827]">
      {/* HEADER */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-[31px] font-semibold tracking-[-0.04em] text-[#111111]">
            Brand Kits
          </h1>

          <p className="mt-1.5 text-[13px] text-[#7b8495]">
            Organize your brand assets and maintain consistency across all
            designs.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setShowCreateModal(true)}
          className="flex h-[44px] items-center gap-2 rounded-xl bg-gradient-to-r from-[#5c45e8] to-[#704ff5] px-5 text-[13px] font-semibold text-white shadow-[0_8px_24px_rgba(92,69,232,0.16)] transition hover:opacity-95"
        >
          <Plus size={16} strokeWidth={2} />
          Create brand kit
        </button>
      </div>

      {/* SEARCH */}
      <div className="mt-7">
        <div className="flex h-10 w-[300px] items-center gap-2 rounded-xl border border-[#e7e8ed] bg-white px-3 transition focus-within:border-[#b9adf9]">
          <Search
            size={15}
            strokeWidth={1.8}
            className="shrink-0 text-[#9ca3af]"
          />

          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search brand kits..."
            className="w-full bg-transparent text-[12px] text-[#343947] outline-none placeholder:text-[#9ca3af]"
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
      </div>

      {/* CONTENT */}
      {loading ? (
        <section className="mt-7 grid grid-cols-4 gap-5">
          {Array.from({ length: 4 }).map((_, index) => (
            <div key={index} className="min-h-[210px] animate-pulse rounded-2xl border border-[#e7e8ed] bg-[#fafafa]" />
          ))}
        </section>
      ) : brandKits.length === 0 ? (
        <section className="mt-7 flex min-h-[500px] items-center justify-center rounded-2xl border border-dashed border-[#d9d3fb] bg-[#fefeff] px-6">
          <div className="flex max-w-[420px] flex-col items-center text-center">
            <div className="flex h-[72px] w-[72px] items-center justify-center rounded-[22px] border border-[#e7e2ff] bg-gradient-to-br from-[#f6f3ff] to-[#eee9ff] text-[#6547ef] shadow-[0_12px_35px_rgba(101,71,239,0.08)]">
              <Palette size={30} strokeWidth={1.7} />
            </div>

            <h2 className="mt-6 text-[19px] font-semibold tracking-[-0.025em] text-[#20242f]">
              No brand kits yet
            </h2>

            <p className="mt-2 max-w-[350px] text-[12px] leading-5 text-[#8b93a1]">
              Create your first brand kit to keep your logos, colors, fonts and
              brand identity in one place.
            </p>

            <button
              type="button"
              onClick={() => setShowCreateModal(true)}
              className="mt-6 flex h-[42px] items-center gap-2 rounded-xl bg-[#6547ef] px-5 text-[12px] font-semibold text-white shadow-[0_8px_22px_rgba(101,71,239,0.18)] transition hover:bg-[#5b3fe5]"
            >
              <Plus size={15} strokeWidth={2} />
              Create brand kit
            </button>
          </div>
        </section>
      ) : displayedBrandKits.length === 0 ? (
        <section className="mt-7 flex min-h-[350px] items-center justify-center rounded-2xl border border-dashed border-[#dedfe6]">
          <div className="text-center">
            <Search size={24} className="mx-auto text-[#aaaebe]" />

            <h3 className="mt-4 text-[14px] font-semibold text-[#303544]">
              No brand kits found
            </h3>

            <p className="mt-1 text-[11px] text-[#9299a8]">
              Try another search.
            </p>
          </div>
        </section>
      ) : (
        <section className="mt-7">
          <div className="grid grid-cols-4 gap-5">
            {displayedBrandKits.map((kit) => (
              <div
                key={kit.id}
                role="button"
                tabIndex={0}
                onClick={() => setSelectedBrandKit(kit)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    setSelectedBrandKit(kit);
                  }
                }}
                className="group relative min-h-[210px] cursor-pointer overflow-hidden rounded-2xl border border-[#e7e8ed] bg-white p-5 text-left transition duration-200 hover:-translate-y-[2px] hover:border-[#d4ccfb] hover:shadow-[0_14px_35px_rgba(40,32,90,0.07)] focus:outline-none focus:ring-2 focus:ring-[#6547ef]/20"
              >
                <div className="absolute right-4 top-4 z-10">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setOpenMenuId((current) =>
                        current === kit.id ? null : kit.id
                      );
                    }}
                    className="flex h-8 w-8 items-center justify-center rounded-lg text-[#9aa1ad] transition hover:bg-[#f6f5fa] hover:text-[#596273]"
                  >
                    <MoreHorizontal size={16} />
                  </button>

                  {openMenuId === kit.id && (
                    <div
                      className="absolute right-0 top-10 w-[150px] rounded-xl border border-[#e7e8ed] bg-white p-1.5 shadow-[0_12px_35px_rgba(30,30,50,0.12)]"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <button
                        type="button"
                        onClick={() => {
                          setRenameKit(kit);
                          setRenameValue(kit.name);
                          setOpenMenuId(null);
                        }}
                        className="flex w-full items-center rounded-lg px-3 py-2 text-left text-[10px] font-medium text-[#596273] transition hover:bg-[#f7f7fa]"
                      >
                        Rename
                      </button>

                      <button
                        type="button"
                        disabled={deletingId === kit.id}
                        onClick={() => deleteBrandKit(kit)}
                        className="flex w-full items-center rounded-lg px-3 py-2 text-left text-[10px] font-medium text-[#d65a5a] transition hover:bg-[#fff5f5] disabled:opacity-50"
                      >
                        {deletingId === kit.id ? "Deleting..." : "Delete"}
                      </button>
                    </div>
                  )}
                </div>

                <div className="flex h-14 w-14 items-center justify-center overflow-hidden rounded-2xl bg-[#f3efff] text-[#6547ef]">
                  {kit.logo_url ? (
                    <img src={kit.logo_url} alt={`${kit.name} logo`} className="h-full w-full object-contain p-2" />
                  ) : (
                    <Palette size={23} strokeWidth={1.7} />
                  )}
                </div>

                <h3 className="mt-5 truncate pr-8 text-[15px] font-semibold text-[#252936]">
                  {kit.name}
                </h3>

                <div className="mt-4 flex items-center gap-2">
                  {kit.colors.length > 0 ? (
                    kit.colors.slice(0, 4).map((color) => (
                      <span
                        key={color}
                        className="h-5 w-5 rounded-full border border-black/5"
                        style={{ backgroundColor: color }}
                      />
                    ))
                  ) : (
                    <>
                      <span className="h-5 w-5 rounded-full border border-dashed border-[#d7d9e0] bg-[#fafafa]" />
                      <span className="h-5 w-5 rounded-full border border-dashed border-[#d7d9e0] bg-[#fafafa]" />
                      <span className="h-5 w-5 rounded-full border border-dashed border-[#d7d9e0] bg-[#fafafa]" />
                    </>
                  )}

                  {kit.colors.length > 4 && (
                    <span className="ml-0.5 text-[9px] font-medium text-[#9299a8]">
                      +{kit.colors.length - 4}
                    </span>
                  )}
                </div>

                <p className="mt-5 text-[10px] text-[#9299a8]">
                  Brand kit
                </p>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* CREATE MODAL */}
      {showCreateModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/20 px-4 backdrop-blur-[2px]"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) {
              setShowCreateModal(false);
            }
          }}
        >
          <div className="w-full max-w-[420px] rounded-2xl border border-[#e7e8ed] bg-white p-6 shadow-[0_25px_80px_rgba(20,20,40,0.16)]">
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#f3efff] text-[#6547ef]">
                  <Palette size={19} />
                </div>

                <h2 className="mt-4 text-[18px] font-semibold tracking-[-0.02em] text-[#20242f]">
                  Create brand kit
                </h2>

                <p className="mt-1 text-[11px] leading-5 text-[#8b93a1]">
                  Start by giving your brand kit a name.
                </p>
              </div>

              <button
                type="button"
                onClick={() => {
                  setShowCreateModal(false);
                  setBrandName("");
                }}
                className="flex h-8 w-8 items-center justify-center rounded-lg text-[#9299a8] transition hover:bg-[#f5f5f7] hover:text-[#4c5565]"
              >
                <X size={16} />
              </button>
            </div>

            <div className="mt-6">
              <label className="text-[11px] font-semibold text-[#525b6b]">
                Brand name
              </label>

              <input
                autoFocus
                type="text"
                value={brandName}
                onChange={(e) => setBrandName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    createBrandKit();
                  }
                }}
                placeholder="e.g. DesignHub"
                className="mt-2 h-11 w-full rounded-xl border border-[#e4e6ec] bg-white px-3.5 text-[12px] text-[#222735] outline-none transition placeholder:text-[#a0a6b2] focus:border-[#8d7af7] focus:ring-4 focus:ring-[#6547ef]/5"
              />
            </div>

            <div className="mt-6 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => {
                  setBrandName("");
                  setShowCreateModal(false);
                }}
                className="h-10 rounded-xl border border-[#e4e6ec] px-4 text-[11px] font-semibold text-[#667085] transition hover:bg-[#f8f8fa]"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={createBrandKit}
                disabled={!brandName.trim() || creating}
                className="flex h-10 items-center gap-2 rounded-xl bg-[#6547ef] px-4 text-[11px] font-semibold text-white transition hover:bg-[#593be5] disabled:cursor-not-allowed disabled:opacity-50"
              >
                <Plus size={14} />
                {creating ? "Creating..." : "Create brand kit"}
              </button>
            </div>
          </div>
        </div>
      )}


      {/* RENAME MODAL */}
      {renameKit && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/20 px-4 backdrop-blur-[2px]"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) {
              setRenameKit(null);
              setRenameValue("");
            }
          }}
        >
          <div className="w-full max-w-[400px] rounded-2xl border border-[#e7e8ed] bg-white p-6 shadow-[0_25px_80px_rgba(20,20,40,0.16)]">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-[17px] font-semibold tracking-[-0.02em] text-[#20242f]">
                  Rename brand kit
                </h2>

                <p className="mt-1 text-[11px] text-[#8b93a1]">
                  Change the name of this brand kit.
                </p>
              </div>

              <button
                type="button"
                onClick={() => {
                  setRenameKit(null);
                  setRenameValue("");
                }}
                className="flex h-8 w-8 items-center justify-center rounded-lg text-[#9299a8] transition hover:bg-[#f5f5f7]"
              >
                <X size={16} />
              </button>
            </div>

            <input
              autoFocus
              type="text"
              value={renameValue}
              onChange={(e) => setRenameValue(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") renameBrandKit();
              }}
              className="mt-5 h-11 w-full rounded-xl border border-[#e4e6ec] px-3.5 text-[12px] outline-none focus:border-[#8d7af7]"
            />

            <div className="mt-5 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => {
                  setRenameKit(null);
                  setRenameValue("");
                }}
                className="h-10 rounded-xl border border-[#e4e6ec] px-4 text-[11px] font-semibold text-[#667085]"
              >
                Cancel
              </button>

              <button
                type="button"
                disabled={renaming || !renameValue.trim()}
                onClick={renameBrandKit}
                className="h-10 rounded-xl bg-[#6547ef] px-4 text-[11px] font-semibold text-white disabled:cursor-not-allowed disabled:opacity-50"
              >
                {renaming ? "Saving..." : "Save"}
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}

function BrandKitDetail({
  brandKit,
  onBack,
  onBrandKitUpdated,
}: {
  brandKit: BrandKit;
  onBack: () => void;
  onBrandKitUpdated: (brandKit: BrandKit) => void;
}) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [newColor, setNewColor] = useState("#6547EF");
  const [savingColor, setSavingColor] = useState(false);

  const [showFontForm, setShowFontForm] = useState(false);
  const [newFont, setNewFont] = useState("");
  const [savingFont, setSavingFont] = useState(false);

  const [tagline, setTagline] = useState(brandKit.tagline || "");
  const [description, setDescription] = useState(brandKit.description || "");
  const [savingInfo, setSavingInfo] = useState(false);
  const [infoSaved, setInfoSaved] = useState(false);

  async function saveColors(colors: string[]) {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      alert("Please log in first.");
      return false;
    }

    const now = new Date().toISOString();

    const { error } = await supabase
      .from("brand_kits")
      .update({
        colors,
        updated_at: now,
      })
      .eq("id", brandKit.id)
      .eq("user_id", user.id);

    if (error) {
      console.error("Colors update error:", error);
      return false;
    }

    onBrandKitUpdated({
      ...brandKit,
      colors,
      updated_at: now,
    });

    return true;
  }

  async function addColor() {
    const color = newColor.trim().toUpperCase();

    if (!/^#[0-9A-F]{6}$/.test(color)) return;
    if (brandKit.colors.includes(color)) {
      setShowColorPicker(false);
      return;
    }

    try {
      setSavingColor(true);
      const success = await saveColors([...brandKit.colors, color]);

      if (success) {
        setShowColorPicker(false);
      }
    } finally {
      setSavingColor(false);
    }
  }

  async function removeColor(color: string) {
    try {
      setSavingColor(true);
      await saveColors(brandKit.colors.filter((item) => item !== color));
    } finally {
      setSavingColor(false);
    }
  }

  async function saveFonts(fonts: string[]) {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      alert("Please log in first.");
      return false;
    }

    const now = new Date().toISOString();

    const { error } = await supabase
      .from("brand_kits")
      .update({
        fonts,
        updated_at: now,
      })
      .eq("id", brandKit.id)
      .eq("user_id", user.id);

    if (error) {
      console.error("Fonts update error:", error);
      return false;
    }

    onBrandKitUpdated({
      ...brandKit,
      fonts,
      updated_at: now,
    });

    return true;
  }

  async function addFont() {
    const font = newFont.trim();
    if (!font) return;

    if (
      brandKit.fonts.some(
        (item) => item.toLowerCase() === font.toLowerCase()
      )
    ) {
      setShowFontForm(false);
      setNewFont("");
      return;
    }

    try {
      setSavingFont(true);
      const success = await saveFonts([...brandKit.fonts, font]);

      if (success) {
        setNewFont("");
        setShowFontForm(false);
      }
    } finally {
      setSavingFont(false);
    }
  }

  async function removeFont(font: string) {
    try {
      setSavingFont(true);
      await saveFonts(brandKit.fonts.filter((item) => item !== font));
    } finally {
      setSavingFont(false);
    }
  }

  async function saveBrandInfo() {
    try {
      setSavingInfo(true);
      setInfoSaved(false);

      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        alert("Please log in first.");
        return;
      }

      const now = new Date().toISOString();

      const { error } = await supabase
        .from("brand_kits")
        .update({
          tagline: tagline.trim() || null,
          description: description.trim() || null,
          updated_at: now,
        })
        .eq("id", brandKit.id)
        .eq("user_id", user.id);

      if (error) {
        console.error("Brand info update error:", error);
        return;
      }

      onBrandKitUpdated({
        ...brandKit,
        tagline: tagline.trim() || null,
        description: description.trim() || null,
        updated_at: now,
      });

      setInfoSaved(true);

      window.setTimeout(() => {
        setInfoSaved(false);
      }, 1800);
    } catch (error) {
      console.error("Brand info update error:", error);
    } finally {
      setSavingInfo(false);
    }
  }

  async function uploadLogo(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      alert("Please choose an image file.");
      event.target.value = "";
      return;
    }

    try {
      setUploadingLogo(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return alert("Please log in first.");

      const extension = file.name.split(".").pop()?.toLowerCase() || "png";
      const filePath = `${user.id}/${brandKit.id}/logo-${Date.now()}.${extension}`;

      const { error: uploadError } = await supabase.storage
        .from("brand-kits").upload(filePath, file, {
          cacheControl: "3600", upsert: false, contentType: file.type,
        });
      if (uploadError) throw uploadError;

      const oldLogoPath = brandKit.logo_path;
      const now = new Date().toISOString();
      const { error: updateError } = await supabase.from("brand_kits")
        .update({ logo_path: filePath, updated_at: now })
        .eq("id", brandKit.id).eq("user_id", user.id);

      if (updateError) {
        await supabase.storage.from("brand-kits").remove([filePath]);
        throw updateError;
      }

      const { data: signed } = await supabase.storage
        .from("brand-kits").createSignedUrl(filePath, 3600);

      onBrandKitUpdated({
        ...brandKit, logo_path: filePath,
        logo_url: signed?.signedUrl || null, updated_at: now,
      });

      if (oldLogoPath && oldLogoPath !== filePath) {
        await supabase.storage.from("brand-kits").remove([oldLogoPath]);
      }
    } catch (error) {
      console.error("Logo upload error:", error);
    } finally {
      setUploadingLogo(false);
      event.target.value = "";
    }
  }

  return (
    <main className="min-h-screen bg-white px-8 pb-12 pt-9 text-[#111827]">
      {/* BACK */}
      <button
        type="button"
        onClick={onBack}
        className="flex items-center gap-2 text-[11px] font-medium text-[#6547ef] transition hover:text-[#5438d9]"
      >
        <ArrowLeft size={14} />
        Back to brand kits
      </button>

      {/* HEADER */}
      <div className="mt-5 flex items-start justify-between">
        <div>
          <h1 className="text-[29px] font-semibold tracking-[-0.04em] text-[#111111]">
            {brandKit.name}
          </h1>

          <p className="mt-1.5 text-[12px] text-[#8b93a1]">
            Manage your brand identity and visual assets.
          </p>
        </div>

        <button
          type="button"
          className="flex h-10 w-10 items-center justify-center rounded-xl border border-[#e5e7ec] text-[#697386] transition hover:bg-[#f8f8fa]"
        >
          <MoreHorizontal size={17} />
        </button>
      </div>

      {/* CONTENT GRID */}
      <section className="mt-7 grid grid-cols-3 gap-5">
        {/* LOGO */}
        <div className="rounded-2xl border border-[#e7e8ed] bg-white p-5">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#f3efff] text-[#6547ef]">
              <ImageIcon size={18} />
            </div>

            <div>
              <h2 className="text-[13px] font-semibold text-[#252936]">
                Logo
              </h2>

              <p className="mt-0.5 text-[10px] text-[#9299a8]">
                Your brand logo and variants
              </p>
            </div>
          </div>

          <input ref={fileInputRef} type="file" accept="image/*" onChange={uploadLogo} className="hidden" />

          <div className="mt-5 flex min-h-[170px] items-center justify-center overflow-hidden rounded-xl border border-dashed border-[#dcdde5] bg-[#fcfcfd] p-4">
            {brandKit.logo_url ? (
              <div className="flex w-full flex-col items-center">
                <div className="flex h-[105px] w-full items-center justify-center rounded-xl bg-white">
                  <img src={brandKit.logo_url} alt={`${brandKit.name} logo`} className="max-h-[90px] max-w-[90%] object-contain" />
                </div>
                <button type="button" disabled={uploadingLogo} onClick={() => fileInputRef.current?.click()} className="mt-3 text-[10px] font-semibold text-[#6547ef] disabled:opacity-50">
                  {uploadingLogo ? "Uploading..." : "Replace logo"}
                </button>
              </div>
            ) : (
              <div className="text-center">
                <ImageIcon size={24} className="mx-auto text-[#aaaebe]" />
                <p className="mt-3 text-[11px] font-medium text-[#596273]">No logo uploaded</p>
                <button type="button" disabled={uploadingLogo} onClick={() => fileInputRef.current?.click()} className="mt-3 text-[10px] font-semibold text-[#6547ef] disabled:opacity-50">
                  {uploadingLogo ? "Uploading..." : "+ Upload logo"}
                </button>
              </div>
            )}
          </div>
        </div>

        {/* COLORS */}
        <div className="rounded-2xl border border-[#e7e8ed] bg-white p-5">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#f3efff] text-[#6547ef]">
              <Palette size={18} />
            </div>

            <div>
              <h2 className="text-[13px] font-semibold text-[#252936]">
                Colors
              </h2>

              <p className="mt-0.5 text-[10px] text-[#9299a8]">
                Your brand color palette
              </p>
            </div>
          </div>

          <div className="mt-5 min-h-[170px] rounded-xl border border-dashed border-[#dcdde5] bg-[#fcfcfd] p-4">
            {brandKit.colors.length === 0 ? (
              <div className="flex min-h-[138px] items-center justify-center">
                <div className="text-center">
                  <Palette size={24} className="mx-auto text-[#aaaebe]" />

                  <p className="mt-3 text-[11px] font-medium text-[#596273]">
                    No colors added
                  </p>

                  <button
                    type="button"
                    onClick={() => setShowColorPicker(true)}
                    className="mt-3 text-[10px] font-semibold text-[#6547ef]"
                  >
                    + Add color
                  </button>
                </div>
              </div>
            ) : (
              <div>
                <div className="space-y-2">
                  {brandKit.colors.map((color) => (
                    <div
                      key={color}
                      className="flex items-center justify-between rounded-xl border border-[#ececf1] bg-white px-3 py-2.5"
                    >
                      <div className="flex items-center gap-3">
                        <span
                          className="h-8 w-8 rounded-lg border border-black/5"
                          style={{ backgroundColor: color }}
                        />

                        <div>
                          <p className="text-[11px] font-semibold text-[#343947]">
                            {color}
                          </p>
                          <p className="mt-0.5 text-[9px] text-[#9aa1ad]">
                            Brand color
                          </p>
                        </div>
                      </div>

                      <button
                        type="button"
                        disabled={savingColor}
                        onClick={() => removeColor(color)}
                        className="flex h-8 w-8 items-center justify-center rounded-lg text-[#a0a6b2] transition hover:bg-[#fff1f1] hover:text-[#dc5a5a] disabled:opacity-50"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  ))}
                </div>

                <button
                  type="button"
                  onClick={() => setShowColorPicker(true)}
                  className="mt-3 text-[10px] font-semibold text-[#6547ef]"
                >
                  + Add another color
                </button>
              </div>
            )}
          </div>

          {showColorPicker && (
            <div className="mt-3 rounded-xl border border-[#e6e7ec] bg-white p-3">
              <div className="flex items-center gap-3">
                <input
                  type="color"
                  value={newColor}
                  onChange={(e) => setNewColor(e.target.value.toUpperCase())}
                  className="h-10 w-12 cursor-pointer rounded-lg border border-[#e5e7ec] bg-white p-1"
                />

                <input
                  type="text"
                  value={newColor}
                  onChange={(e) => setNewColor(e.target.value.toUpperCase())}
                  maxLength={7}
                  placeholder="#6547EF"
                  className="h-10 min-w-0 flex-1 rounded-lg border border-[#e5e7ec] px-3 text-[11px] uppercase outline-none focus:border-[#8d7af7]"
                />
              </div>

              <div className="mt-3 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowColorPicker(false)}
                  className="h-9 rounded-lg border border-[#e5e7ec] px-3 text-[10px] font-semibold text-[#667085]"
                >
                  Cancel
                </button>

                <button
                  type="button"
                  disabled={
                    savingColor || !/^#[0-9A-Fa-f]{6}$/.test(newColor)
                  }
                  onClick={addColor}
                  className="h-9 rounded-lg bg-[#6547ef] px-3 text-[10px] font-semibold text-white disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {savingColor ? "Saving..." : "Add color"}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* TYPOGRAPHY */}
        <div className="rounded-2xl border border-[#e7e8ed] bg-white p-5">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#f3efff] text-[#6547ef]">
              <Type size={18} />
            </div>

            <div>
              <h2 className="text-[13px] font-semibold text-[#252936]">
                Typography
              </h2>

              <p className="mt-0.5 text-[10px] text-[#9299a8]">
                Your brand fonts
              </p>
            </div>
          </div>

          <div className="mt-5 min-h-[170px] rounded-xl border border-dashed border-[#dcdde5] bg-[#fcfcfd] p-4">
            {brandKit.fonts.length === 0 ? (
              <div className="flex min-h-[138px] items-center justify-center">
                <div className="text-center">
                  <Type size={24} className="mx-auto text-[#aaaebe]" />

                  <p className="mt-3 text-[11px] font-medium text-[#596273]">
                    No fonts added
                  </p>

                  <button
                    type="button"
                    onClick={() => setShowFontForm(true)}
                    className="mt-3 text-[10px] font-semibold text-[#6547ef]"
                  >
                    + Add font
                  </button>
                </div>
              </div>
            ) : (
              <div>
                <div className="space-y-2">
                  {brandKit.fonts.map((font) => (
                    <div
                      key={font}
                      className="flex items-center justify-between rounded-xl border border-[#ececf1] bg-white px-3 py-2.5"
                    >
                      <div className="flex min-w-0 items-center gap-3">
                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#f3efff] text-[14px] font-semibold text-[#6547ef]">
                          Aa
                        </div>

                        <div className="min-w-0">
                          <p className="truncate text-[11px] font-semibold text-[#343947]">
                            {font}
                          </p>
                          <p className="mt-0.5 text-[9px] text-[#9aa1ad]">
                            Brand font
                          </p>
                        </div>
                      </div>

                      <button
                        type="button"
                        disabled={savingFont}
                        onClick={() => removeFont(font)}
                        className="flex h-8 w-8 items-center justify-center rounded-lg text-[#a0a6b2] transition hover:bg-[#fff1f1] hover:text-[#dc5a5a] disabled:opacity-50"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  ))}
                </div>

                <button
                  type="button"
                  onClick={() => setShowFontForm(true)}
                  className="mt-3 text-[10px] font-semibold text-[#6547ef]"
                >
                  + Add another font
                </button>
              </div>
            )}
          </div>

          {showFontForm && (
            <div className="mt-3 rounded-xl border border-[#e6e7ec] bg-white p-3">
              <label className="text-[9px] font-semibold uppercase tracking-[0.04em] text-[#8b93a1]">
                Font name
              </label>

              <input
                autoFocus
                type="text"
                value={newFont}
                onChange={(e) => setNewFont(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") addFont();
                }}
                placeholder="e.g. Inter"
                className="mt-2 h-10 w-full rounded-lg border border-[#e5e7ec] px-3 text-[11px] outline-none placeholder:text-[#a0a6b2] focus:border-[#8d7af7]"
              />

              <div className="mt-3 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowFontForm(false);
                    setNewFont("");
                  }}
                  className="h-9 rounded-lg border border-[#e5e7ec] px-3 text-[10px] font-semibold text-[#667085]"
                >
                  Cancel
                </button>

                <button
                  type="button"
                  disabled={savingFont || !newFont.trim()}
                  onClick={addFont}
                  className="h-9 rounded-lg bg-[#6547ef] px-3 text-[10px] font-semibold text-white disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {savingFont ? "Saving..." : "Add font"}
                </button>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* BRAND INFO */}
      <section className="mt-5 rounded-2xl border border-[#e7e8ed] bg-white p-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-[13px] font-semibold text-[#252936]">
              Brand info
            </h2>

            <p className="mt-1 text-[10px] text-[#9299a8]">
              Basic information about your brand.
            </p>
          </div>

          <div className="flex items-center gap-3">
            {infoSaved && (
              <span className="text-[10px] font-medium text-[#2f9e63]">
                Saved
              </span>
            )}

            <button
              type="button"
              onClick={saveBrandInfo}
              disabled={savingInfo}
              className="h-9 rounded-lg bg-[#6547ef] px-4 text-[10px] font-semibold text-white transition hover:bg-[#593be5] disabled:cursor-not-allowed disabled:opacity-50"
            >
              {savingInfo ? "Saving..." : "Save changes"}
            </button>
          </div>
        </div>

        <div className="mt-6 grid grid-cols-2 gap-5">
          <div>
            <label className="text-[10px] font-semibold text-[#667085]">
              Brand name
            </label>

            <div className="mt-2 flex h-11 items-center rounded-xl border border-[#e5e7ec] bg-[#fafafa] px-3.5 text-[12px] text-[#343947]">
              {brandKit.name}
            </div>
          </div>

          <div>
            <label className="text-[10px] font-semibold text-[#667085]">
              Tagline
            </label>

            <input
              type="text"
              value={tagline}
              onChange={(e) => setTagline(e.target.value)}
              placeholder="Add a tagline..."
              className="mt-2 h-11 w-full rounded-xl border border-[#e5e7ec] px-3.5 text-[12px] outline-none placeholder:text-[#a0a6b2] focus:border-[#8d7af7]"
            />
          </div>

          <div className="col-span-2">
            <label className="text-[10px] font-semibold text-[#667085]">
              Description
            </label>

            <textarea
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe your brand..."
              className="mt-2 w-full resize-none rounded-xl border border-[#e5e7ec] px-3.5 py-3 text-[12px] outline-none placeholder:text-[#a0a6b2] focus:border-[#8d7af7]"
            />
          </div>
        </div>
      </section>
    </main>
  );
}