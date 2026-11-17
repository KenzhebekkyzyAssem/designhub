"use client";

import {
  ChevronDown,
  File as FileIcon,
  Folder,
  Grid2X2,
  Image as ImageIcon,
  Layers3,
  List,
  MoreVertical,
  Search,
  Trash2,
  Upload,
} from "lucide-react";

import {
  ChangeEvent,
  DragEvent,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import { supabase } from "@/lib/supabase";

type Asset = {
  id: string;
  user_id: string;
  name: string;
  file_path: string;
  file_type: string;
  size: number;
  created_at: string;
  preview_url?: string;
};

type FilterType = "all" | "images" | "files" | "folders";

type SortType =
  | "recent"
  | "oldest"
  | "name-asc"
  | "name-desc"
  | "largest"
  | "smallest";

export default function AssetsPage() {
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [assets, setAssets] = useState<Asset[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);

  const [filter, setFilter] = useState<FilterType>("all");
  const [search, setSearch] = useState("");

  const [view, setView] = useState<"grid" | "list">("grid");
  const [sort, setSort] = useState<SortType>("recent");

  // =========================
  // LOAD ASSETS
  // =========================

  const loadAssets = async () => {
    try {
      setLoading(true);

      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError) {
        console.error(userError);
        return;
      }

      if (!user) {
        setAssets([]);
        return;
      }

      const { data, error } = await supabase
        .from("assets")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", {
          ascending: false,
        });

      if (error) {
        console.error("Assets load error:", error);
        return;
      }

      const rows = (data ?? []) as Asset[];

      // Bucket private болғандықтан preview үшін signed URL жасаймыз
      const assetsWithUrls = await Promise.all(
        rows.map(async (asset) => {
          if (!asset.file_type.startsWith("image/")) {
            return asset;
          }

          const { data: signedData, error: signedError } =
            await supabase.storage
              .from("assets")
              .createSignedUrl(asset.file_path, 60 * 60);

          if (signedError) {
            console.error(
              "Signed URL error:",
              signedError
            );

            return asset;
          }

          return {
            ...asset,
            preview_url: signedData.signedUrl,
          };
        })
      );

      setAssets(assetsWithUrls);
    } catch (error) {
      console.error("Unexpected load error:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAssets();
  }, []);

  // =========================
  // OPEN FILE PICKER
  // =========================

  const openFilePicker = () => {
    fileInputRef.current?.click();
  };

  // =========================
  // UPLOAD
  // =========================

  const uploadFiles = async (files: File[]) => {
    if (files.length === 0) return;

    try {
      setUploading(true);

      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError) {
        console.error(userError);
        alert("User information could not be loaded.");
        return;
      }

      if (!user) {
        alert("Please sign in first.");
        return;
      }

      for (const file of files) {
        const safeName = file.name.replace(
          /[^a-zA-Z0-9._-]/g,
          "_"
        );

        const filePath = `${user.id}/${crypto.randomUUID()}-${safeName}`;

        // 1. STORAGE
        const { error: uploadError } =
          await supabase.storage
            .from("assets")
            .upload(filePath, file, {
              cacheControl: "3600",
              upsert: false,
              contentType: file.type || undefined,
            });

        if (uploadError) {
          console.error(
            "Storage upload error:",
            uploadError
          );

          continue;
        }

        // 2. DATABASE
        const { error: insertError } =
          await supabase.from("assets").insert({
            user_id: user.id,
            name: file.name,
            file_path: filePath,
            file_type:
              file.type || "application/octet-stream",
            size: file.size,
          });

        if (insertError) {
          console.error(
            "Database insert error:",
            insertError
          );

          // DB insert fail болса Storage-та orphan файл қалмасын
          await supabase.storage
            .from("assets")
            .remove([filePath]);
        }
      }

      await loadAssets();
    } catch (error) {
      console.error("Upload error:", error);
    } finally {
      setUploading(false);

      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  // =========================
  // INPUT
  // =========================

  const handleFileChange = (
    event: ChangeEvent<HTMLInputElement>
  ) => {
    const files = Array.from(
      event.target.files ?? []
    );

    uploadFiles(files);
  };

  // =========================
  // DRAG & DROP
  // =========================

  const handleDragOver = (
    event: DragEvent<HTMLDivElement>
  ) => {
    event.preventDefault();
  };

  const handleDrop = (
    event: DragEvent<HTMLDivElement>
  ) => {
    event.preventDefault();

    const files = Array.from(
      event.dataTransfer.files
    );

    uploadFiles(files);
  };

  // =========================
  // DELETE
  // =========================

  const deleteAsset = async (asset: Asset) => {
    const confirmed = window.confirm(
      `Delete "${asset.name}"?`
    );

    if (!confirmed) return;

    try {
      const { error: storageError } =
        await supabase.storage
          .from("assets")
          .remove([asset.file_path]);

      if (storageError) {
        console.error(
          "Storage delete error:",
          storageError
        );

        return;
      }

      const { error: databaseError } =
        await supabase
          .from("assets")
          .delete()
          .eq("id", asset.id);

      if (databaseError) {
        console.error(
          "Database delete error:",
          databaseError
        );

        return;
      }

      setAssets((current) =>
        current.filter(
          (item) => item.id !== asset.id
        )
      );
    } catch (error) {
      console.error("Delete error:", error);
    }
  };

  // =========================
  // STATS
  // =========================

  const totalAssets = assets.length;

  const totalImages = assets.filter((asset) =>
    asset.file_type.startsWith("image/")
  ).length;

  const totalFiles = assets.filter(
    (asset) =>
      !asset.file_type.startsWith("image/")
  ).length;

  const totalStorage = assets.reduce(
    (total, asset) => total + asset.size,
    0
  );

  // =========================
  // FORMAT SIZE
  // =========================

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";

    const units = [
      "Bytes",
      "KB",
      "MB",
      "GB",
      "TB",
    ];

    const index = Math.floor(
      Math.log(bytes) / Math.log(1024)
    );

    const value =
      bytes / Math.pow(1024, index);

    return `${value.toFixed(
      index === 0 ? 0 : 1
    )} ${units[index]}`;
  };

  // =========================
  // FILTER + SEARCH + SORT
  // =========================

  const filteredAssets = useMemo(() => {
    const result = assets.filter((asset) => {
      const matchesSearch = asset.name
        .toLowerCase()
        .includes(search.trim().toLowerCase());

      let matchesFilter = true;

      if (filter === "images") {
        matchesFilter = asset.file_type.startsWith("image/");
      }

      if (filter === "files") {
        matchesFilter = !asset.file_type.startsWith("image/");
      }

      if (filter === "folders") {
        matchesFilter = false;
      }

      return matchesSearch && matchesFilter;
    });

    return result.sort((a, b) => {
      switch (sort) {
        case "recent":
          return (
            new Date(b.created_at).getTime() -
            new Date(a.created_at).getTime()
          );

        case "oldest":
          return (
            new Date(a.created_at).getTime() -
            new Date(b.created_at).getTime()
          );

        case "name-asc":
          return a.name.localeCompare(b.name);

        case "name-desc":
          return b.name.localeCompare(a.name);

        case "largest":
          return b.size - a.size;

        case "smallest":
          return a.size - b.size;

        default:
          return 0;
      }
    });
  }, [assets, filter, search, sort]);

  return (
    <div className="min-h-screen bg-[#ffffff] text-[#111827]">
      <input
        ref={fileInputRef}
        type="file"
        multiple
        onChange={handleFileChange}
        className="hidden"
      />

      <div className="flex min-h-screen">
        <main className="flex-1 bg-[#ffffff]">
          <div className="px-8 pb-10 pt-5">

            {/* PAGE HEADER */}

            <div className="mt-5 flex items-start justify-between">
              <div>
                <h1 className="text-[31px] font-semibold tracking-[-0.04em] text-[#111111]">
                  Assets
                </h1>

                <p className="mt-1 text-[14px] text-[#667085]">
                  Upload and organize your images,
                  files and design resources.
                </p>
              </div>

              <button
                onClick={openFilePicker}
                disabled={uploading}
                className="flex h-[46px] items-center gap-2 rounded-xl bg-gradient-to-r from-[#5c45e8] to-[#6b4ff4] px-5 text-[13px] font-semibold text-white shadow-[0_8px_20px_rgba(92,69,232,0.18)] transition hover:opacity-95 disabled:cursor-not-allowed disabled:opacity-60"
              >
                <Upload size={16} />

                {uploading
                  ? "Uploading..."
                  : "Upload asset"}
              </button>
            </div>

            {/* STATS */}

            <section className="mt-7 grid grid-cols-4 gap-4">

              {/* TOTAL */}

              <div className="rounded-2xl border border-[#e8eaf0] bg-white p-5">
                <div className="flex items-center gap-4">
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#f3efff] text-[#6547ef]">
                    <Folder size={20} />
                  </div>

                  <div>
                    <p className="text-[13px] font-medium text-[#667085]">
                      Total assets
                    </p>

                    <p className="mt-1 text-[25px] font-semibold tracking-[-0.04em] text-[#111111]">
                      {totalAssets}
                    </p>
                  </div>
                </div>

                <p className="mt-4 text-[12px] text-[#8c95a5]">
                  All files in your workspace
                </p>
              </div>

              {/* IMAGES */}

              <div className="rounded-2xl border border-[#e8eaf0] bg-white p-5">
                <div className="flex items-center gap-4">
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#f3efff] text-[#6547ef]">
                    <ImageIcon size={20} />
                  </div>

                  <div>
                    <p className="text-[13px] font-medium text-[#667085]">
                      Images
                    </p>

                    <p className="mt-1 text-[25px] font-semibold tracking-[-0.04em] text-[#111111]">
                      {totalImages}
                    </p>
                  </div>
                </div>

                <p className="mt-4 text-[12px] text-[#8c95a5]">
                  JPG, PNG, SVG and more
                </p>
              </div>

              {/* FILES */}

              <div className="rounded-2xl border border-[#e8eaf0] bg-white p-5">
                <div className="flex items-center gap-4">
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#f3efff] text-[#6547ef]">
                    <FileIcon size={20} />
                  </div>

                  <div>
                    <p className="text-[13px] font-medium text-[#667085]">
                      Files
                    </p>

                    <p className="mt-1 text-[25px] font-semibold tracking-[-0.04em] text-[#111111]">
                      {totalFiles}
                    </p>
                  </div>
                </div>

                <p className="mt-4 text-[12px] text-[#8c95a5]">
                  PDF, DOC, ZIP and more
                </p>
              </div>

              {/* STORAGE */}

              <div className="rounded-2xl border border-[#e8eaf0] bg-white p-5">
                <div className="flex items-center gap-4">
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#f3efff] text-[#6547ef]">
                    <Layers3 size={20} />
                  </div>

                  <div>
                    <p className="text-[13px] font-medium text-[#667085]">
                      Storage used
                    </p>

                    <p className="mt-1 text-[25px] font-semibold tracking-[-0.04em] text-[#111111]">
                      {formatBytes(totalStorage)}
                    </p>
                  </div>
                </div>

                <p className="mt-4 text-[12px] text-[#8c95a5]">
                  of 10 GB
                </p>
              </div>

            </section>

            {/* UPLOAD AREA */}

            <section
              onDragOver={handleDragOver}
              onDrop={handleDrop}
              className="mt-5 rounded-2xl border border-dashed border-[#c7bdfd] bg-[#fdfcff]"
            >
              <div className="relative flex min-h-[240px] items-center justify-center overflow-hidden px-8">

                <div className="flex flex-col items-center">
                  <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[#f3efff] text-[#6547ef]">
                    <Upload size={24} />
                  </div>

                  <h2 className="mt-4 text-[16px] font-semibold text-[#111827]">
                    Drag and drop your files here
                  </h2>

                  <p className="mt-1 text-[13px] text-[#7c8595]">
                    or click to browse from your device
                  </p>

                  <button
                    onClick={openFilePicker}
                    disabled={uploading}
                    className="mt-5 rounded-xl bg-gradient-to-r from-[#5f45e8] to-[#6c4ff5] px-6 py-3 text-[13px] font-semibold text-white shadow-sm disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {uploading
                      ? "Uploading..."
                      : "Browse files"}
                  </button>
                </div>

              </div>
            </section>

            {/* FILTER BAR */}

            <section className="mt-5 flex items-center justify-between rounded-2xl border border-[#e8eaf0] bg-white p-3">

              <div className="flex items-center gap-2">
                {(
                  [
                    ["all", "All"],
                    ["images", "Images"],
                    ["files", "Files"],
                    ["folders", "Folders"],
                  ] as const
                ).map(([value, label]) => (
                  <button
                    key={value}
                    onClick={() => setFilter(value)}
                    className={
                      filter === value
                        ? "rounded-xl bg-gradient-to-r from-[#5c45e8] to-[#694df3] px-4 py-2.5 text-[12px] font-semibold text-white"
                        : "rounded-xl border border-[#e7e8ed] px-4 py-2.5 text-[12px] font-medium text-[#596273] transition hover:bg-[#f9fafb]"
                    }
                  >
                    {label}
                  </button>
                ))}
              </div>

              <div className="flex items-center gap-2">

                <div className="flex h-10 w-[250px] items-center gap-2 rounded-xl border border-[#e7e8ed] px-3">
                  <Search
                    size={15}
                    className="text-[#9ca3af]"
                  />

                  <input
                    type="text"
                    value={search}
                    onChange={(event) =>
                      setSearch(event.target.value)
                    }
                    placeholder="Search assets..."
                    className="w-full bg-transparent text-[12px] outline-none placeholder:text-[#9ca3af]"
                  />
                </div>

                <div className="relative">
                  <select
                    value={sort}
                    onChange={(e) => setSort(e.target.value as SortType)}
                    className="h-10 min-w-[165px] appearance-none rounded-xl border border-[#e7e8ed] bg-white pl-4 pr-10 text-[12px] font-medium text-[#475467] outline-none transition hover:border-[#d7d9e0] focus:border-[#a99cf9]"
                  >
                    <option value="recent">Recently added</option>
                    <option value="oldest">Oldest first</option>

                    <option value="name-asc">
                      Name A–Z
                    </option>

                    <option value="name-desc">
                      Name Z–A
                    </option>

                    <option value="largest">
                      Largest first
                    </option>

                    <option value="smallest">
                      Smallest first
                    </option>
                  </select>

                  <ChevronDown
                    size={14}
                    className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[#667085]"
                  />
                </div>

                <button
                  onClick={() => setView("grid")}
                  className={
                    view === "grid"
                      ? "flex h-10 w-10 items-center justify-center rounded-xl border border-[#bcaefd] bg-[#f7f4ff] text-[#6547ef]"
                      : "flex h-10 w-10 items-center justify-center rounded-xl border border-[#e7e8ed] text-[#667085]"
                  }
                >
                  <Grid2X2 size={16} />
                </button>

                <button
                  onClick={() => setView("list")}
                  className={
                    view === "list"
                      ? "flex h-10 w-10 items-center justify-center rounded-xl border border-[#bcaefd] bg-[#f7f4ff] text-[#6547ef]"
                      : "flex h-10 w-10 items-center justify-center rounded-xl border border-[#e7e8ed] text-[#667085]"
                  }
                >
                  <List size={16} />
                </button>

              </div>
            </section>

            {/* LOADING */}

            {loading && (
              <section className="mt-5 flex min-h-[300px] items-center justify-center rounded-2xl border border-[#e8eaf0] bg-white">
                <p className="text-[13px] text-[#8a93a3]">
                  Loading assets...
                </p>
              </section>
            )}

            {/* EMPTY STATE */}

            {!loading &&
              filteredAssets.length === 0 && (
                <section className="mt-5 flex min-h-[300px] flex-col items-center justify-center rounded-2xl border border-[#e8eaf0] bg-white px-6">
                  <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[#f3efff] text-[#6547ef]">
                    <Folder size={26} />
                  </div>

                  <h3 className="mt-5 text-[16px] font-semibold text-[#111827]">
                    {assets.length === 0
                      ? "You don't have any assets yet"
                      : "No assets found"}
                  </h3>

                  <p className="mt-2 text-[13px] text-[#8a93a3]">
                    {assets.length === 0
                      ? "Upload your first asset to get started."
                      : "Try another search or filter."}
                  </p>

                  {assets.length === 0 && (
                    <button
                      onClick={openFilePicker}
                      disabled={uploading}
                      className="mt-5 flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#5c45e8] to-[#6b4ff4] px-5 py-3 text-[13px] font-semibold text-white shadow-sm disabled:opacity-60"
                    >
                      <Upload size={15} />

                      Upload your first asset
                    </button>
                  )}
                </section>
              )}

            {/* GRID */}

            {!loading &&
              filteredAssets.length > 0 &&
              view === "grid" && (
                <section className="mt-5 grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-4">

                  {filteredAssets.map((asset) => {
                    const isImage =
                      asset.file_type.startsWith(
                        "image/"
                      );

                    return (
                      <div
                        key={asset.id}
                        className="group overflow-hidden rounded-2xl border border-[#e8eaf0] bg-white transition hover:border-[#d7d2f8] hover:shadow-[0_12px_30px_rgba(30,24,70,0.06)]"
                      >
                        <div className="relative flex aspect-[4/3] items-center justify-center overflow-hidden bg-[#f7f7fa]">

                          {isImage &&
                          asset.preview_url ? (
                            <img
                              src={asset.preview_url}
                              alt={asset.name}
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-[#f3efff] text-[#6547ef]">
                              <FileIcon size={27} />
                            </div>
                          )}

                          <button
                            onClick={() =>
                              deleteAsset(asset)
                            }
                            className="absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-xl border border-[#ececf1] bg-white text-[#667085] opacity-0 shadow-sm transition hover:text-red-500 group-hover:opacity-100"
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>

                        <div className="flex items-center justify-between gap-3 p-4">
                          <div className="min-w-0">
                            <p className="truncate text-[13px] font-semibold text-[#242936]">
                              {asset.name}
                            </p>

                            <p className="mt-1 text-[11px] text-[#98a0af]">
                              {formatBytes(
                                asset.size
                              )}
                            </p>
                          </div>

                          <MoreVertical
                            size={16}
                            className="shrink-0 text-[#98a0af]"
                          />
                        </div>
                      </div>
                    );
                  })}

                </section>
              )}

            {/* LIST */}

            {!loading &&
              filteredAssets.length > 0 &&
              view === "list" && (
                <section className="mt-5 overflow-hidden rounded-2xl border border-[#e8eaf0] bg-white">

                  {filteredAssets.map((asset) => {
                    const isImage =
                      asset.file_type.startsWith(
                        "image/"
                      );

                    return (
                      <div
                        key={asset.id}
                        className="flex items-center justify-between border-b border-[#eef0f4] px-5 py-4 last:border-none"
                      >
                        <div className="flex min-w-0 items-center gap-4">

                          <div className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-[#f3efff] text-[#6547ef]">
                            {isImage &&
                            asset.preview_url ? (
                              <img
                                src={
                                  asset.preview_url
                                }
                                alt={asset.name}
                                className="h-full w-full object-cover"
                              />
                            ) : (
                              <FileIcon size={20} />
                            )}
                          </div>

                          <div className="min-w-0">
                            <p className="truncate text-[13px] font-semibold text-[#242936]">
                              {asset.name}
                            </p>

                            <p className="mt-1 text-[11px] text-[#98a0af]">
                              {formatBytes(
                                asset.size
                              )}
                            </p>
                          </div>
                        </div>

                        <button
                          onClick={() =>
                            deleteAsset(asset)
                          }
                          className="flex h-9 w-9 items-center justify-center rounded-xl text-[#98a0af] transition hover:bg-red-50 hover:text-red-500"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    );
                  })}

                </section>
              )}

          </div>
        </main>
      </div>
    </div>
  );
}