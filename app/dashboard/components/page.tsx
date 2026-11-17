"use client";

import { ChangeEvent, useEffect, useRef, useState } from "react";
import {
  Badge,
  Box,
  ChevronDown,
  Component,
  CreditCard,
  FormInput,
  Grid2X2,
  LayoutPanelTop,
  Lightbulb,
  Menu,
  MoreHorizontal,
  Pencil,
  Plus,
  Search,
  Sparkles,
  Trash2,
  Type,
  Upload,
  X,
} from "lucide-react";
import { supabase } from "@/lib/supabase";

const categories = [
  { name: "All", icon: Grid2X2 },
  { name: "Buttons", icon: Component },
  { name: "Cards", icon: CreditCard },
  { name: "Navigation", icon: Menu },
  { name: "Forms", icon: FormInput },
  { name: "Sections", icon: LayoutPanelTop },
  { name: "Modals", icon: Box },
  { name: "Inputs", icon: Type },
  { name: "Badges", icon: Badge },
];

type SavedComponent = {
  id: string;
  name: string;
  category: string;
  notes: string | null;
  preview_path: string | null;
  preview_url: string | null;
  created_at: string;
};

export default function ComponentsPage() {
  const [createOpen, setCreateOpen] = useState(false);
  const [categoryOpen, setCategoryOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [previewFile, setPreviewFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  
  const [componentName, setComponentName] = useState("");
  const [componentNotes, setComponentNotes] = useState("");
  const [creating, setCreating] = useState(false);
  const [components, setComponents] = useState<SavedComponent[]>([]);
  const [loadingComponents, setLoadingComponents] = useState(true);

  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [filterOpen, setFilterOpen] = useState(false);

  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);
  const [selectedComponent, setSelectedComponent] = useState<SavedComponent | null>(null);
  const [editItem, setEditItem] = useState<SavedComponent | null>(null);
  const [editName, setEditName] = useState("");
  const [editCategory, setEditCategory] = useState("");
  const [editNotes, setEditNotes] = useState("");
  const [editCategoryOpen, setEditCategoryOpen] = useState(false);
  const [editPreviewFile, setEditPreviewFile] = useState<File | null>(null);
  const [editPreviewUrl, setEditPreviewUrl] = useState<string | null>(null);
  const [savingEdit, setSavingEdit] = useState(false);

  const [renameItem, setRenameItem] = useState<SavedComponent | null>(null);
  const [renameValue, setRenameValue] = useState("");
  const [renaming, setRenaming] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const previewInputRef = useRef<HTMLInputElement>(null);
  const editPreviewInputRef = useRef<HTMLInputElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  async function loadComponents() {
    try {
      setLoadingComponents(true);

      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        setComponents([]);
        return;
      }

      const { data, error } = await supabase
        .from("components")
        .select("id, name, category, notes, preview_path, created_at")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Load components error:", error);
        setComponents([]);
        return;
      }

      const items = await Promise.all(
        (data ?? []).map(async (item) => {
          let previewUrl: string | null = null;

          if (item.preview_path) {
            const { data: signedData } = await supabase.storage
              .from("components")
              .createSignedUrl(item.preview_path, 60 * 60);

            previewUrl = signedData?.signedUrl ?? null;
          }

          return {
            ...item,
            preview_url: previewUrl,
          } as SavedComponent;
        })
      );

      setComponents(items);
    } finally {
      setLoadingComponents(false);
    }
  }

  useEffect(() => {
    loadComponents();
  }, []);

  const componentCategories = [
    "Button",
    "Card",
    "Navigation",
    "Form",
    "Section",
    "Modal",
    "Input",
    "Badge",
    "Other",
  ];

  function handlePreviewUpload(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];

    if (!file) return;

    const allowedTypes = [
      "image/png",
      "image/jpeg",
      "image/webp",
      "image/svg+xml",
    ];

    if (!allowedTypes.includes(file.type)) {
      alert("Please upload PNG, JPG, SVG or WEBP.");
      return;
    }

    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }

    const url = URL.createObjectURL(file);

    setPreviewFile(file);
    setPreviewUrl(url);
  }

  function removePreview() {
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }

    setPreviewFile(null);
    setPreviewUrl(null);

    if (previewInputRef.current) {
      previewInputRef.current.value = "";
    }
  }

  async function createComponent() {
    const name = componentName.trim();

    if (!name) {
      alert("Enter component name.");
      return;
    }

    if (!selectedCategory) {
      alert("Select a category.");
      return;
    }

    try {
      setCreating(true);

      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        alert("Please log in first.");
        return;
      }

      let previewPath: string | null = null;

      if (previewFile) {
        const extension =
          previewFile.name.split(".").pop()?.toLowerCase() || "png";

        const filePath =
          `${user.id}/${crypto.randomUUID()}/preview-${Date.now()}.${extension}`;

        const { error: uploadError } = await supabase.storage
          .from("components")
          .upload(filePath, previewFile);

        if (uploadError) {
          console.error("Component preview upload error:", uploadError);
          alert("Preview upload failed.");
          return;
        }

        previewPath = filePath;
      }

      const { error: insertError } = await supabase
        .from("components")
        .insert({
          user_id: user.id,
          name,
          category: selectedCategory,
          notes: componentNotes.trim() || null,
          preview_path: previewPath,
        });

      if (insertError) {
        console.error("Create component error:", insertError);

        if (previewPath) {
          await supabase.storage
            .from("components")
            .remove([previewPath]);
        }

        alert("Component creation failed.");
        return;
      }

      setComponentName("");
      setComponentNotes("");
      setSelectedCategory("");
      setCategoryOpen(false);

      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }

      setPreviewFile(null);
      setPreviewUrl(null);

      if (previewInputRef.current) {
        previewInputRef.current.value = "";
      }

      setCreateOpen(false);
      await loadComponents();
    } catch (error) {
      console.error("Create component error:", error);
    } finally {
      setCreating(false);
    }
  }

  function openEdit(item: SavedComponent) {
    setEditItem(item);
    setEditName(item.name);
    setEditCategory(item.category);
    setEditNotes(item.notes ?? "");
    setEditPreviewFile(null);
    setEditPreviewUrl(item.preview_url ?? null);
    setEditCategoryOpen(false);
    setSelectedComponent(null);
    setActiveMenuId(null);
  }

  function handleEditPreviewUpload(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;

    const allowedTypes = [
      "image/png",
      "image/jpeg",
      "image/webp",
      "image/svg+xml",
    ];

    if (!allowedTypes.includes(file.type)) {
      alert("Please upload PNG, JPG, SVG or WEBP.");
      return;
    }

    if (editPreviewFile && editPreviewUrl) {
      URL.revokeObjectURL(editPreviewUrl);
    }

    setEditPreviewFile(file);
    setEditPreviewUrl(URL.createObjectURL(file));
  }

  async function saveComponentEdit() {
    if (!editItem) return;

    const name = editName.trim();
    if (!name) {
      alert("Enter component name.");
      return;
    }

    if (!editCategory) {
      alert("Select a category.");
      return;
    }

    try {
      setSavingEdit(true);

      let previewPath = editItem.preview_path;
      let previewUrl = editItem.preview_url;

      if (editPreviewFile) {
        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (!user) {
          alert("Please log in first.");
          return;
        }

        const extension =
          editPreviewFile.name.split(".").pop()?.toLowerCase() || "png";

        const newPath =
          `${user.id}/${crypto.randomUUID()}/preview-${Date.now()}.${extension}`;

        const { error: uploadError } = await supabase.storage
          .from("components")
          .upload(newPath, editPreviewFile);

        if (uploadError) {
          console.error("Edit preview upload error:", uploadError);
          alert("Preview upload failed.");
          return;
        }

        if (editItem.preview_path) {
          await supabase.storage
            .from("components")
            .remove([editItem.preview_path]);
        }

        const { data: signedData } = await supabase.storage
          .from("components")
          .createSignedUrl(newPath, 60 * 60);

        previewPath = newPath;
        previewUrl = signedData?.signedUrl ?? null;
      }

      const { error } = await supabase
        .from("components")
        .update({
          name,
          category: editCategory,
          notes: editNotes.trim() || null,
          preview_path: previewPath,
          updated_at: new Date().toISOString(),
        })
        .eq("id", editItem.id);

      if (error) {
        console.error("Update component error:", error);
        alert("Update failed.");
        return;
      }

      const updated = {
        ...editItem,
        name,
        category: editCategory,
        notes: editNotes.trim() || null,
        preview_path: previewPath,
        preview_url: previewUrl,
      };

      setComponents((current) =>
        current.map((item) => (item.id === editItem.id ? updated : item))
      );

      if (editPreviewFile && editPreviewUrl) {
        URL.revokeObjectURL(editPreviewUrl);
      }

      setEditItem(null);
      setEditName("");
      setEditCategory("");
      setEditNotes("");
      setEditPreviewFile(null);
      setEditPreviewUrl(null);
      setEditCategoryOpen(false);
    } finally {
      setSavingEdit(false);
    }
  }

  useEffect(() => {
    function handlePointerDown(event: MouseEvent) {
      if (
        activeMenuId &&
        menuRef.current &&
        !menuRef.current.contains(event.target as Node)
      ) {
        setActiveMenuId(null);
      }
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key !== "Escape") return;

      setActiveMenuId(null);
      setFilterOpen(false);
      setCategoryOpen(false);
      setEditCategoryOpen(false);

      if (renameItem && !renaming) {
        setRenameItem(null);
        setRenameValue("");
      }

      if (editItem && !savingEdit) {
        setEditItem(null);
      }

      if (selectedComponent) {
        setSelectedComponent(null);
      }

      if (createOpen && !creating) {
        setCreateOpen(false);
      }
    }

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [
    activeMenuId,
    createOpen,
    creating,
    editItem,
    renameItem,
    renaming,
    savingEdit,
    selectedComponent,
  ]);

  const filterOptions = [
    "All",
    "Button",
    "Card",
    "Navigation",
    "Form",
    "Section",
    "Modal",
    "Input",
    "Badge",
    "Other",
  ];

  const visibleComponents = components.filter((item) => {
    const matchesSearch =
      item.name.toLowerCase().includes(searchQuery.trim().toLowerCase()) ||
      (item.notes ?? "").toLowerCase().includes(searchQuery.trim().toLowerCase());

    const matchesCategory =
      categoryFilter === "All" || item.category === categoryFilter;

    return matchesSearch && matchesCategory;
  });

  function openRename(item: SavedComponent) {
    setRenameItem(item);
    setRenameValue(item.name);
    setActiveMenuId(null);
  }

  async function renameComponent() {
    if (!renameItem) return;

    const nextName = renameValue.trim();
    if (!nextName || nextName === renameItem.name) {
      setRenameItem(null);
      return;
    }

    try {
      setRenaming(true);

      const { error } = await supabase
        .from("components")
        .update({
          name: nextName,
          updated_at: new Date().toISOString(),
        })
        .eq("id", renameItem.id);

      if (error) {
        console.error("Rename component error:", error);
        alert("Rename failed.");
        return;
      }

      setComponents((current) =>
        current.map((item) =>
          item.id === renameItem.id ? { ...item, name: nextName } : item
        )
      );

      setRenameItem(null);
      setRenameValue("");
    } finally {
      setRenaming(false);
    }
  }

  async function deleteComponent(item: SavedComponent) {
    const confirmed = window.confirm(`Delete "${item.name}"?`);
    if (!confirmed) return;

    try {
      setDeletingId(item.id);
      setActiveMenuId(null);

      if (item.preview_path) {
        const { error: storageError } = await supabase.storage
          .from("components")
          .remove([item.preview_path]);

        if (storageError) {
          console.error("Delete component preview error:", storageError);
        }
      }

      const { error } = await supabase
        .from("components")
        .delete()
        .eq("id", item.id);

      if (error) {
        console.error("Delete component error:", error);
        alert("Delete failed.");
        return;
      }

      setComponents((current) =>
        current.filter((component) => component.id !== item.id)
      );
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <main className="min-h-screen bg-white px-8 pb-10 pt-8">
      {/* HEADER */}
      <div className="flex items-start justify-between gap-6">
        <div>
          <h1 className="text-[31px] font-semibold tracking-[-0.035em] text-[#171a24]">
            Components
          </h1>

          <p className="mt-1.5 text-[14px] text-[#7d8496]">
            Save reusable design elements and use them across your projects.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setCreateOpen(true)}
          className="
            flex h-[54px] items-center gap-2.5 rounded-[14px]
            bg-[#6547ef] px-6
            text-[13px] font-semibold text-white
            shadow-[0_10px_28px_rgba(101,71,239,0.22)]
            transition
            hover:bg-[#5c3fe5]
          "
        >
          <Plus size={19} strokeWidth={2} />
          New component
        </button>
      </div>

      {/* SEARCH / SELECT */}
      <div className="mt-9 flex items-center gap-4">
        <div className="relative w-full max-w-[510px]">
          <Search
            size={18}
            className="absolute left-4 top-1/2 -translate-y-1/2 text-[#a1a7b5]"
          />

          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search components..."
            className="
              h-[55px] w-full rounded-[14px]
              border border-[#e1e4eb]
              bg-white
              pl-12 pr-4
              text-[13px] text-[#343946]
              outline-none
              transition
              placeholder:text-[#a3a9b7]
              focus:border-[#a99bf8]
              focus:ring-4 focus:ring-[#6547ef]/5
            "
          />
        </div>

        <div className="relative">
          <button
            type="button"
            onClick={() => setFilterOpen((current) => !current)}
            className="
              flex h-[55px] min-w-[200px]
              items-center justify-between
              rounded-[14px]
              border border-[#e1e4eb]
              bg-white px-5
              text-[13px] font-medium text-[#252936]
              transition
              hover:bg-[#fafafa]
            "
          >
            {categoryFilter === "All" ? "All categories" : categoryFilter}

            <ChevronDown
              size={17}
              className={`text-[#7e8595] transition-transform ${
                filterOpen ? "rotate-180" : ""
              }`}
            />
          </button>

          {filterOpen && (
            <div className="absolute right-0 top-[63px] z-30 w-[200px] rounded-[13px] border border-[#e4e6ec] bg-white p-1.5 shadow-[0_16px_45px_rgba(30,30,50,0.12)]">
              {filterOptions.map((option) => (
                <button
                  key={option}
                  type="button"
                  onClick={() => {
                    setCategoryFilter(option);
                    setFilterOpen(false);
                  }}
                  className={`flex w-full rounded-[9px] px-3 py-2.5 text-left text-[11px] transition ${
                    categoryFilter === option
                      ? "bg-[#f2efff] font-semibold text-[#6547ef]"
                      : "text-[#535b6b] hover:bg-[#f7f7f9]"
                  }`}
                >
                  {option === "All" ? "All categories" : option}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* CATEGORIES */}
      <div className="mt-7 flex flex-wrap items-center gap-3">
        {categories.map((category) => {
          const dbCategory =
            category.name === "All"
              ? "All"
              : category.name.endsWith("s")
                ? category.name.slice(0, -1)
                : category.name;

          const isActive = categoryFilter === dbCategory;

          return (
            <button
              key={category.name}
              type="button"
              onClick={() => {
                setCategoryFilter(dbCategory);
                setFilterOpen(false);
              }}
              className={`
                flex h-[48px] items-center justify-center
                rounded-[12px]
                border px-5
                text-[12px] font-medium
                transition
                ${
                  isActive
                    ? "border-[#8f7cff] bg-[#fbfaff] text-[#5c49d8]"
                    : "border-[#e4e6ec] bg-white text-[#4f5770] hover:border-[#cfc7fa] hover:bg-[#fbfaff]"
                }
              `}
            >
              {category.name}
            </button>
          );
        })}

        <button
          type="button"
          onClick={() => {
            setCategoryFilter("Other");
            setFilterOpen(false);
          }}
          className={`
            flex h-[48px] w-[52px]
            items-center justify-center
            rounded-[12px]
            border
            transition
            ${
              categoryFilter === "Other"
                ? "border-[#8f7cff] bg-[#fbfaff] text-[#5c49d8]"
                : "border-[#e4e6ec] bg-white text-[#6f7687] hover:bg-[#fafafa]"
            }
          `}
          title="Other"
        >
          <MoreHorizontal size={18} />
        </button>
      </div>

      {/* COMPONENTS CONTENT */}
      {loadingComponents ? (
        <section
          className="mt-7 flex min-h-[420px] items-center justify-center rounded-[22px] border border-[#eceef3] bg-white"
        >
          <div className="h-7 w-7 animate-spin rounded-full border-2 border-[#e4e0ff] border-t-[#6547ef]" />
        </section>
      ) : components.length === 0 ? (
        <section
          className="
            mt-7
            flex min-h-[480px]
            items-center justify-center
            rounded-[22px]
            border border-dashed border-[#dfe2e9]
            bg-white
            px-6 py-12
          "
        >
          <div className="flex max-w-[520px] flex-col items-center text-center">
            <div className="relative mb-7 h-[150px] w-[210px]">
              <Sparkles
                size={30}
                className="absolute left-[16px] top-[5px] text-[#d9d1ff]"
                strokeWidth={1.6}
              />

              <Sparkles
                size={20}
                className="absolute right-[17px] top-[67px] text-[#dfd8ff]"
                strokeWidth={1.6}
              />

              <Sparkles
                size={17}
                className="absolute left-[5px] top-[57px] text-[#e7e1ff]"
                strokeWidth={1.6}
              />

              <div
                className="
                  absolute left-1/2 top-[30px]
                  h-[104px] w-[168px]
                  -translate-x-1/2
                  overflow-hidden
                  rounded-[16px]
                  border border-[#e2def9]
                  bg-white
                  shadow-[0_12px_30px_rgba(91,72,180,0.06)]
                "
              >
                <div className="flex h-[24px] items-center gap-1.5 border-b border-[#eeeafb] bg-[#faf8ff] px-3">
                  <span className="h-[6px] w-[6px] rounded-full bg-[#d6cff9]" />
                  <span className="h-[6px] w-[6px] rounded-full bg-[#d6cff9]" />
                  <span className="h-[6px] w-[6px] rounded-full bg-[#d6cff9]" />
                </div>

                <div className="p-4">
                  <div className="flex gap-2">
                    <div className="h-[27px] w-[44px] rounded-[6px] bg-[#7f6af4]" />
                    <div className="h-[27px] w-[44px] rounded-[6px] bg-[#ececf2]" />
                    <div className="h-[27px] w-[44px] rounded-[6px] bg-[#ececf2]" />
                  </div>

                  <div className="mt-3 h-[8px] w-[92px] rounded-full bg-[#f0eff5]" />
                  <div className="mt-2 h-[8px] w-[60px] rounded-full bg-[#f4f3f7]" />
                </div>
              </div>

              <div
                className="
                  absolute bottom-[2px] right-[6px]
                  flex h-[60px] w-[60px]
                  rotate-[10deg]
                  items-center justify-center
                  rounded-[17px]
                  bg-[#7965f3]
                  shadow-[0_12px_26px_rgba(101,71,239,0.22)]
                "
              >
                <div className="grid grid-cols-3 gap-[4px]">
                  {Array.from({ length: 9 }).map((_, index) => (
                    <span
                      key={index}
                      className="h-[6px] w-[6px] rounded-[2px] bg-white"
                    />
                  ))}
                </div>
              </div>
            </div>

            <h2 className="text-[25px] font-semibold tracking-[-0.03em] text-[#111522]">
              No components yet
            </h2>

            <p className="mt-3 max-w-[430px] text-[14px] leading-[1.55] text-[#747c90]">
              Save buttons, cards, navigation and other
              <br />
              design elements you want to reuse.
            </p>

            <button
              type="button"
              onClick={() => setCreateOpen(true)}
              className="
                mt-7 flex h-[54px]
                items-center gap-2.5
                rounded-[13px]
                bg-[#6547ef]
                px-7
                text-[13px] font-semibold text-white
                shadow-[0_10px_28px_rgba(101,71,239,0.20)]
                transition
                hover:bg-[#5c3fe5]
              "
            >
              <Plus size={19} />
              Create component
            </button>
          </div>
        </section>
      ) : (
        <section className="mt-7">
          <div className="mb-4 flex items-center justify-between">
            <p className="text-[12px] font-medium text-[#7b8291]">
              {visibleComponents.length} {visibleComponents.length === 1 ? "component" : "components"}
            </p>
          </div>

          <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
            {visibleComponents.map((item) => (
              <article
                key={item.id}
                role="button"
                tabIndex={0}
                onClick={() => setSelectedComponent(item)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    setSelectedComponent(item);
                  }
                }}
                className="group relative cursor-pointer overflow-visible rounded-[18px] border border-[#e5e7ed] bg-white transition hover:-translate-y-[1px] hover:shadow-[0_14px_35px_rgba(25,25,40,0.08)]"
              >
                <div className="flex h-[180px] items-center justify-center overflow-hidden rounded-t-[18px] bg-[#f8f8fb] p-5">
                  {item.preview_url ? (
                    <img
                      src={item.preview_url}
                      alt={item.name}
                      className="max-h-full max-w-full object-contain"
                    />
                  ) : (
                    <div className="flex h-14 w-14 items-center justify-center rounded-[16px] bg-[#efecff] text-[#6547ef]">
                      <Component size={24} />
                    </div>
                  )}
                </div>

                <div className="p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <h3 className="truncate text-[13px] font-semibold text-[#20242f]">
                        {item.name}
                      </h3>

                      <span className="mt-2 inline-flex rounded-full bg-[#f1eeff] px-2.5 py-1 text-[9px] font-semibold text-[#6652dc]">
                        {item.category}
                      </span>
                    </div>

                    <div className="relative" ref={activeMenuId === item.id ? menuRef : undefined}>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setActiveMenuId((current) =>
                            current === item.id ? null : item.id
                          );
                        }}
                        disabled={deletingId === item.id}
                        className="flex h-8 w-8 shrink-0 items-center justify-center rounded-[9px] text-[#9aa0ad] transition hover:bg-[#f5f5f7] hover:text-[#596071] disabled:opacity-40"
                      >
                        <MoreHorizontal size={17} />
                      </button>

                      {activeMenuId === item.id && (
                        <div
                          className="
                            absolute bottom-[38px] right-0 z-50
                            w-[150px]
                            rounded-[12px]
                            border border-[#e5e7ed]
                            bg-white
                            p-1.5
                            shadow-[0_12px_32px_rgba(25,25,40,0.12)]
                          "
                        >
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              openRename(item);
                            }}
                            className="
                              flex w-full items-center gap-2.5
                              rounded-[8px]
                              px-3 py-2.5
                              text-[11px] font-medium text-[#525968]
                              transition
                              hover:bg-[#f6f6f8]
                            "
                          >
                            <Pencil size={14} />
                            Rename
                          </button>

                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              deleteComponent(item);
                            }}
                            className="
                              flex w-full items-center gap-2.5
                              rounded-[8px]
                              px-3 py-2.5
                              text-[11px] font-medium text-[#dc5555]
                              transition
                              hover:bg-[#fff3f3]
                            "
                          >
                            <Trash2 size={14} />
                            Delete
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                  {item.notes && (
                    <p className="mt-3 line-clamp-2 text-[10px] leading-5 text-[#8a91a0]">
                      {item.notes}
                    </p>
                  )}

                  <p className="mt-4 text-[9px] text-[#a2a8b4]">
                    {new Date(item.created_at).toLocaleDateString()}
                  </p>
                </div>
              </article>
            ))}
          </div>

          {visibleComponents.length === 0 && (
            <div className="mt-5 flex min-h-[240px] items-center justify-center rounded-[18px] border border-dashed border-[#dfe2e9] bg-[#fcfcfd] px-6 text-center">
              <div>
                <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-[13px] bg-[#f1eeff] text-[#6547ef]">
                  <Search size={19} />
                </div>

                <p className="mt-4 text-[13px] font-semibold text-[#343946]">
                  No matching components
                </p>

                <p className="mt-1.5 text-[10px] text-[#9399a7]">
                  Try another search term or clear the active category filter.
                </p>

                <button
                  type="button"
                  onClick={() => {
                    setSearchQuery("");
                    setCategoryFilter("All");
                    setFilterOpen(false);
                  }}
                  className="mt-4 h-[36px] rounded-[10px] border border-[#e3e5ea] bg-white px-4 text-[10px] font-semibold text-[#5e6675] transition hover:bg-[#f7f7f9]"
                >
                  Clear filters
                </button>
              </div>
            </div>
          )}
        </section>
      )}

      {/* COMPONENT DETAIL MODAL */}
      {selectedComponent && (
        <div
          className="fixed inset-0 z-[55] flex items-center justify-center bg-[#111827]/20 px-4 py-8 backdrop-blur-[2px]"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) {
              setSelectedComponent(null);
              setActiveMenuId(null);
            }
          }}
        >
          <div className="max-h-[calc(100vh-64px)] w-full max-w-[720px] overflow-y-auto rounded-[22px] border border-[#e6e7ec] bg-white shadow-[0_30px_90px_rgba(22,20,40,0.16)]">
            <div className="flex items-start justify-between gap-4 border-b border-[#eceef2] px-6 py-5">
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="truncate text-[20px] font-semibold tracking-[-0.025em] text-[#20242f]">
                    {selectedComponent.name}
                  </h2>

                  <span className="inline-flex rounded-full bg-[#f1eeff] px-2.5 py-1 text-[9px] font-semibold text-[#6652dc]">
                    {selectedComponent.category}
                  </span>
                </div>

                <p className="mt-1.5 text-[10px] text-[#9298a6]">
                  Saved {new Date(selectedComponent.created_at).toLocaleDateString()}
                </p>
              </div>

              <button
                type="button"
                onClick={() => setSelectedComponent(null)}
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[10px] text-[#959cab] transition hover:bg-[#f5f5f7] hover:text-[#4f5665]"
              >
                <X size={17} />
              </button>
            </div>

            <div className="p-6">
              <div className="flex min-h-[320px] items-center justify-center overflow-hidden rounded-[18px] border border-[#e8eaf0] bg-[#f8f8fb] p-8">
                {selectedComponent.preview_url ? (
                  <img
                    src={selectedComponent.preview_url}
                    alt={selectedComponent.name}
                    className="max-h-[430px] max-w-full object-contain"
                  />
                ) : (
                  <div className="flex flex-col items-center text-center">
                    <div className="flex h-16 w-16 items-center justify-center rounded-[18px] bg-[#efecff] text-[#6547ef]">
                      <Component size={28} />
                    </div>

                    <p className="mt-4 text-[11px] font-medium text-[#7b8291]">
                      No preview uploaded
                    </p>
                  </div>
                )}
              </div>

              <div className="mt-6">
                <p className="text-[10px] font-semibold uppercase tracking-[0.08em] text-[#9aa0ad]">
                  Notes
                </p>

                <p className="mt-2 text-[12px] leading-6 text-[#555d6c]">
                  {selectedComponent.notes || "No notes added."}
                </p>
              </div>

              <div className="mt-7 flex justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => openEdit(selectedComponent)}
                  className="flex h-[42px] items-center gap-2 rounded-[11px] bg-[#6547ef] px-5 text-[11px] font-semibold text-white shadow-[0_8px_20px_rgba(101,71,239,0.16)] transition hover:bg-[#5c3fe5]"
                >
                  <Pencil size={14} />
                  Edit component
                </button>

                <button
                  type="button"
                  onClick={() => {
                    const item = selectedComponent;
                    setSelectedComponent(null);
                    openRename(item);
                  }}
                  className="flex h-[42px] items-center gap-2 rounded-[11px] border border-[#e2e4ea] px-5 text-[11px] font-semibold text-[#606879] transition hover:bg-[#f8f8fa]"
                >
                  <Pencil size={14} />
                  Rename
                </button>

                <button
                  type="button"
                  onClick={() => {
                    const item = selectedComponent;
                    setSelectedComponent(null);
                    deleteComponent(item);
                  }}
                  className="flex h-[42px] items-center gap-2 rounded-[11px] border border-[#f0dddd] px-5 text-[11px] font-semibold text-[#d85858] transition hover:bg-[#fff5f5]"
                >
                  <Trash2 size={14} />
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* EDIT COMPONENT MODAL */}
      {editItem && (
        <div
          className="fixed inset-0 z-[58] flex items-center justify-center bg-[#111827]/20 px-4 py-8 backdrop-blur-[2px]"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget && !savingEdit) {
              setEditItem(null);
              setEditCategoryOpen(false);
            }
          }}
        >
          <div className="max-h-[calc(100vh-64px)] w-full max-w-[560px] overflow-y-auto rounded-[22px] border border-[#e6e7ec] bg-white p-6 shadow-[0_30px_90px_rgba(22,20,40,0.16)]">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-[19px] font-semibold tracking-[-0.025em] text-[#20242f]">
                  Edit component
                </h2>
                <p className="mt-1 text-[11px] text-[#8c93a2]">
                  Update this reusable design element.
                </p>
              </div>

              <button
                type="button"
                disabled={savingEdit}
                onClick={() => {
                  setEditItem(null);
                  setEditCategoryOpen(false);
                }}
                className="flex h-9 w-9 items-center justify-center rounded-[10px] text-[#959cab] transition hover:bg-[#f5f5f7] hover:text-[#4f5665] disabled:opacity-40"
              >
                <X size={17} />
              </button>
            </div>

            <div className="mt-6">
              <label className="text-[10px] font-semibold text-[#5e6675]">
                Name
              </label>

              <input
                type="text"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                className="mt-2 h-[45px] w-full rounded-[11px] border border-[#e2e5eb] px-3.5 text-[12px] outline-none focus:border-[#9685f7] focus:ring-4 focus:ring-[#6547ef]/5"
              />
            </div>

            <div className="relative mt-5">
              <label className="text-[10px] font-semibold text-[#5e6675]">
                Category
              </label>

              <button
                type="button"
                onClick={() => setEditCategoryOpen((current) => !current)}
                className="mt-2 flex h-[45px] w-full items-center justify-between rounded-[11px] border border-[#e2e5eb] bg-white px-3.5 text-[12px] text-[#444b5b] transition hover:border-[#d4d7df]"
              >
                {editCategory || "Select category"}
                <ChevronDown
                  size={16}
                  className={`text-[#9299a7] transition-transform ${
                    editCategoryOpen ? "rotate-180" : ""
                  }`}
                />
              </button>

              {editCategoryOpen && (
                <div className="absolute left-0 top-[72px] z-20 w-full rounded-[13px] border border-[#e4e6ec] bg-white p-1.5 shadow-[0_16px_45px_rgba(30,30,50,0.12)]">
                  {componentCategories.map((category) => (
                    <button
                      key={category}
                      type="button"
                      onClick={() => {
                        setEditCategory(category);
                        setEditCategoryOpen(false);
                      }}
                      className={`flex w-full rounded-[9px] px-3 py-2.5 text-left text-[11px] transition ${
                        editCategory === category
                          ? "bg-[#f2efff] font-semibold text-[#6547ef]"
                          : "text-[#535b6b] hover:bg-[#f7f7f9]"
                      }`}
                    >
                      {category}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="mt-5">
              <label className="text-[10px] font-semibold text-[#5e6675]">
                Preview
              </label>

              <input
                ref={editPreviewInputRef}
                type="file"
                accept=".png,.jpg,.jpeg,.svg,.webp,image/png,image/jpeg,image/svg+xml,image/webp"
                onChange={handleEditPreviewUpload}
                className="hidden"
              />

              <div className="relative mt-2 flex min-h-[190px] items-center justify-center overflow-hidden rounded-[14px] border border-[#e2e5eb] bg-[#f8f8fa] p-4">
                {editPreviewUrl ? (
                  <img
                    src={editPreviewUrl}
                    alt="Component preview"
                    className="max-h-[250px] max-w-full object-contain"
                  />
                ) : (
                  <div className="text-center">
                    <Upload className="mx-auto text-[#6547ef]" size={20} />
                    <p className="mt-2 text-[10px] text-[#8b92a1]">
                      No preview uploaded
                    </p>
                  </div>
                )}

                <button
                  type="button"
                  onClick={() => editPreviewInputRef.current?.click()}
                  className="absolute right-3 top-3 rounded-[9px] border border-[#e1e3e8] bg-white px-3 py-2 text-[9px] font-semibold text-[#555d6c] shadow-sm transition hover:bg-[#f8f8fa]"
                >
                  {editPreviewUrl ? "Replace" : "Upload"}
                </button>
              </div>
            </div>

            <div className="mt-5">
              <label className="text-[10px] font-semibold text-[#5e6675]">
                Notes
              </label>

              <textarea
                rows={4}
                value={editNotes}
                onChange={(e) => setEditNotes(e.target.value)}
                placeholder="Add a short note about this component..."
                className="mt-2 w-full resize-none rounded-[11px] border border-[#e2e5eb] px-3.5 py-3 text-[12px] outline-none placeholder:text-[#a5abb7] focus:border-[#9685f7] focus:ring-4 focus:ring-[#6547ef]/5"
              />
            </div>

            <div className="mt-6 flex justify-end gap-2.5">
              <button
                type="button"
                disabled={savingEdit}
                onClick={() => {
                  setEditItem(null);
                  setEditCategoryOpen(false);
                }}
                className="h-[42px] rounded-[11px] border border-[#e2e4ea] px-5 text-[11px] font-semibold text-[#606879] transition hover:bg-[#f8f8fa] disabled:opacity-40"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={saveComponentEdit}
                disabled={savingEdit || !editName.trim() || !editCategory}
                className="h-[42px] rounded-[11px] bg-[#6547ef] px-5 text-[11px] font-semibold text-white shadow-[0_8px_20px_rgba(101,71,239,0.18)] transition hover:bg-[#5c3fe5] disabled:cursor-not-allowed disabled:opacity-50"
              >
                {savingEdit ? "Saving..." : "Save changes"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CREATE COMPONENT MODAL */}
      {createOpen && (
        <div
          className="
            fixed inset-0 z-50
            flex items-center justify-center
            bg-[#111827]/20
            px-4 py-8
            backdrop-blur-[2px]
          "
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) {
              setCreateOpen(false);
              setCategoryOpen(false);
            }
          }}
        >
          <div
            className="
              max-h-[calc(100vh-64px)]
              w-full max-w-[520px]
              overflow-y-auto
              rounded-[22px]
              border border-[#e6e7ec]
              bg-white
              p-6
              shadow-[0_30px_90px_rgba(22,20,40,0.16)]
            "
          >
            {/* HEADER */}
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-[19px] font-semibold tracking-[-0.025em] text-[#20242f]">
                  Create component
                </h2>

                <p className="mt-1 text-[11px] text-[#8c93a2]">
                  Save a reusable design element to your library.
                </p>
              </div>

              <button
                type="button"
                onClick={() => {
                  setCreateOpen(false);
                  setCategoryOpen(false);
                }}
                className="
                  flex h-9 w-9 items-center justify-center
                  rounded-[10px]
                  text-[#959cab]
                  transition
                  hover:bg-[#f5f5f7]
                  hover:text-[#4f5665]
                "
              >
                <X size={17} />
              </button>
            </div>

            {/* NAME */}
            <div className="mt-6">
              <label className="text-[10px] font-semibold text-[#5e6675]">
                Name
              </label>

              <input
                autoFocus
                type="text"
                value={componentName}
                onChange={(e) => setComponentName(e.target.value)}
                placeholder="e.g. Primary Button"
                className="
                  mt-2 h-[45px] w-full
                  rounded-[11px]
                  border border-[#e2e5eb]
                  px-3.5
                  text-[12px]
                  outline-none
                  placeholder:text-[#a5abb7]
                  focus:border-[#9685f7]
                  focus:ring-4 focus:ring-[#6547ef]/5
                "
              />
            </div>

            {/* CATEGORY */}
            <div className="relative mt-5">
              <label className="text-[10px] font-semibold text-[#5e6675]">
                Category
              </label>

              <button
                type="button"
                onClick={() => setCategoryOpen((current) => !current)}
                className="
                  mt-2 flex h-[45px] w-full
                  items-center justify-between
                  rounded-[11px]
                  border border-[#e2e5eb]
                  bg-white
                  px-3.5
                  text-[12px]
                  transition
                  hover:border-[#d4d7df]
                "
              >
                <span
                  className={
                    selectedCategory
                      ? "text-[#444b5b]"
                      : "text-[#a5abb7]"
                  }
                >
                  {selectedCategory || "Select category"}
                </span>

                <ChevronDown
                  size={16}
                  className={`
                    text-[#9299a7]
                    transition-transform
                    ${categoryOpen ? "rotate-180" : ""}
                  `}
                />
              </button>

              {categoryOpen && (
                <div
                  className="
                    absolute left-0 top-[72px] z-20
                    w-full
                    rounded-[13px]
                    border border-[#e4e6ec]
                    bg-white
                    p-1.5
                    shadow-[0_16px_45px_rgba(30,30,50,0.12)]
                  "
                >
                  {componentCategories.map((category) => (
                    <button
                      key={category}
                      type="button"
                      onClick={() => {
                        setSelectedCategory(category);
                        setCategoryOpen(false);
                      }}
                      className={`
                        flex w-full
                        items-center
                        rounded-[9px]
                        px-3 py-2.5
                        text-left
                        text-[11px]
                        transition
                        ${
                          selectedCategory === category
                            ? "bg-[#f2efff] font-semibold text-[#6547ef]"
                            : "text-[#535b6b] hover:bg-[#f7f7f9]"
                        }
                      `}
                    >
                      {category}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* PREVIEW */}
            <div className="mt-5">
              <label className="text-[10px] font-semibold text-[#5e6675]">
                Preview
              </label>

              <input
                ref={previewInputRef}
                type="file"
                accept=".png,.jpg,.jpeg,.svg,.webp,image/png,image/jpeg,image/svg+xml,image/webp"
                onChange={handlePreviewUpload}
                className="hidden"
              />

              {!previewUrl ? (
                <button
                  type="button"
                  onClick={() => previewInputRef.current?.click()}
                  className="
                    mt-2 flex min-h-[150px] w-full
                    flex-col items-center justify-center
                    rounded-[14px]
                    border border-dashed border-[#d9dce5]
                    bg-[#fcfcfd]
                    transition
                    hover:border-[#bcb1f9]
                    hover:bg-[#fbfaff]
                  "
                >
                  <div
                    className="
                      flex h-10 w-10
                      items-center justify-center
                      rounded-[11px]
                      bg-[#f0edff]
                      text-[#6547ef]
                    "
                  >
                    <Upload size={18} />
                  </div>

                  <p className="mt-3 text-[11px] font-semibold text-[#4b5261]">
                    Upload preview
                  </p>

                  <p className="mt-1 text-[9px] text-[#9ca3af]">
                    PNG, JPG, SVG or WEBP
                  </p>
                </button>
              ) : (
                <div
                  className="
                    relative mt-2
                    min-h-[180px]
                    overflow-hidden
                    rounded-[14px]
                    border border-[#e2e5eb]
                    bg-[#f8f8fa]
                  "
                >
                  <div className="flex min-h-[180px] items-center justify-center p-4">
                    <img
                      src={previewUrl}
                      alt="Component preview"
                      className="max-h-[220px] max-w-full object-contain"
                    />
                  </div>

                  <div className="absolute right-3 top-3 flex gap-2">
                    <button
                      type="button"
                      onClick={() => previewInputRef.current?.click()}
                      className="
                        rounded-[9px]
                        border border-[#e1e3e8]
                        bg-white
                        px-3 py-2
                        text-[9px] font-semibold text-[#555d6c]
                        shadow-sm
                        transition
                        hover:bg-[#f8f8fa]
                      "
                    >
                      Replace
                    </button>

                    <button
                      type="button"
                      onClick={removePreview}
                      className="
                        flex h-[32px] w-[32px]
                        items-center justify-center
                        rounded-[9px]
                        border border-[#eadede]
                        bg-white
                        text-[#d75a5a]
                        shadow-sm
                        transition
                        hover:bg-[#fff4f4]
                      "
                    >
                      <X size={14} />
                    </button>
                  </div>

                  {previewFile && (
                    <div className="border-t border-[#e8e9ed] bg-white px-4 py-2.5">
                      <p className="truncate text-[9px] text-[#8c93a2]">
                        {previewFile.name}
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* NOTES */}
            <div className="mt-5">
              <label className="text-[10px] font-semibold text-[#5e6675]">
                Notes
              </label>

              <textarea
                rows={3}
                value={componentNotes}
                onChange={(e) => setComponentNotes(e.target.value)}
                placeholder="Add a short note about this component..."
                className="
                  mt-2 w-full resize-none
                  rounded-[11px]
                  border border-[#e2e5eb]
                  px-3.5 py-3
                  text-[12px]
                  outline-none
                  placeholder:text-[#a5abb7]
                  focus:border-[#9685f7]
                  focus:ring-4 focus:ring-[#6547ef]/5
                "
              />
            </div>

            {/* ACTIONS */}
            <div className="mt-6 flex justify-end gap-2.5">
              <button
                type="button"
                onClick={() => {
                  setCreateOpen(false);
                  setCategoryOpen(false);
                }}
                className="
                  h-[42px]
                  rounded-[11px]
                  border border-[#e2e4ea]
                  px-5
                  text-[11px] font-semibold text-[#606879]
                  transition
                  hover:bg-[#f8f8fa]
                "
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={createComponent}
                disabled={
                  creating ||
                  !componentName.trim() ||
                  !selectedCategory
                }
                className="
                  h-[42px]
                  rounded-[11px]
                  bg-[#6547ef]
                  px-5
                  text-[11px] font-semibold text-white
                  shadow-[0_8px_20px_rgba(101,71,239,0.18)]
                  transition
                  hover:bg-[#5c3fe5]
                  disabled:cursor-not-allowed
                  disabled:opacity-50
                "
              >
                {creating ? "Creating..." : "Create component"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* RENAME COMPONENT MODAL */}
      {renameItem && (
        <div
          className="fixed inset-0 z-[60] flex items-center justify-center bg-[#111827]/20 px-4 backdrop-blur-[2px]"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget && !renaming) {
              setRenameItem(null);
              setRenameValue("");
            }
          }}
        >
          <div className="w-full max-w-[420px] rounded-[20px] border border-[#e6e7ec] bg-white p-6 shadow-[0_30px_90px_rgba(22,20,40,0.16)]">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-[18px] font-semibold tracking-[-0.02em] text-[#20242f]">
                  Rename component
                </h2>
                <p className="mt-1 text-[10px] text-[#8c93a2]">
                  Choose a new name for this component.
                </p>
              </div>

              <button
                type="button"
                disabled={renaming}
                onClick={() => {
                  setRenameItem(null);
                  setRenameValue("");
                }}
                className="flex h-9 w-9 items-center justify-center rounded-[10px] text-[#959cab] transition hover:bg-[#f5f5f7] hover:text-[#4f5665] disabled:opacity-40"
              >
                <X size={17} />
              </button>
            </div>

            <input
              autoFocus
              type="text"
              value={renameValue}
              onChange={(e) => setRenameValue(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") renameComponent();
              }}
              className="mt-6 h-[45px] w-full rounded-[11px] border border-[#e2e5eb] px-3.5 text-[12px] outline-none focus:border-[#9685f7] focus:ring-4 focus:ring-[#6547ef]/5"
            />

            <div className="mt-6 flex justify-end gap-2.5">
              <button
                type="button"
                disabled={renaming}
                onClick={() => {
                  setRenameItem(null);
                  setRenameValue("");
                }}
                className="h-[42px] rounded-[11px] border border-[#e2e4ea] px-5 text-[11px] font-semibold text-[#606879] transition hover:bg-[#f8f8fa] disabled:opacity-40"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={renameComponent}
                disabled={renaming || !renameValue.trim()}
                className="h-[42px] rounded-[11px] bg-[#6547ef] px-5 text-[11px] font-semibold text-white shadow-[0_8px_20px_rgba(101,71,239,0.18)] transition hover:bg-[#5c3fe5] disabled:cursor-not-allowed disabled:opacity-50"
              >
                {renaming ? "Saving..." : "Save"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TIP */}
      <div
        className="
          mt-7 flex min-h-[58px]
          items-center gap-3
          rounded-[14px]
          border border-[#e4defd]
          bg-[#f8f6ff]
          px-5
        "
      >
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white text-[#6547ef]">
          <Lightbulb size={18} />
        </div>

        <p className="text-[12px] text-[#4f4a84]">
          <span className="font-semibold">Tip:</span> Create components from
          your existing designs and keep your UI consistent across all
          projects.
        </p>
      </div>
    </main>
  );
}