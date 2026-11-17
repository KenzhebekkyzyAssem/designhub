"use client";

import { useMemo, useState } from "react";
import {
  Bookmark,
  ChevronDown,
  Grid2X2,
  LayoutTemplate,
  List,
  Search,
  X,
} from "lucide-react";

type Template = {
  id: number;
  title: string;
  category: string;
  image: string;
};

const categories = [
  "All",
  "Instagram Post",
  "Instagram Story",
  "Presentation",
  "Poster",
  "Web / Landing Page",
  "Resume",
  "Logo",
];

const templates: Template[] = [
  // Кейін өз дизайндарын осында қосасың.
  // Мысалы:
  //
  // {
  //   id: 1,
  //   title: "Minimal Interior",
  //   category: "Instagram Post",
  //   image: "/templates/minimal-interior.jpg",
  // },
];

export default function TemplatesPage() {
  const [activeTab, setActiveTab] = useState<"discover" | "saved">("discover");
  const [activeCategory, setActiveCategory] = useState("All");
  const [search, setSearch] = useState("");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [sort, setSort] = useState<"recent" | "title">("recent");

  const displayedTemplates = useMemo(() => {
    let result = [...templates];

    if (activeCategory !== "All") {
      result = result.filter(
        (template) => template.category === activeCategory
      );
    }

    if (search.trim()) {
      const query = search.toLowerCase();

      result = result.filter(
        (template) =>
          template.title.toLowerCase().includes(query) ||
          template.category.toLowerCase().includes(query)
      );
    }

    if (sort === "title") {
      result.sort((a, b) => a.title.localeCompare(b.title));
    }

    return result;
  }, [activeCategory, search, sort]);

  return (
    <main className="min-h-screen bg-white px-8 pb-12 pt-9 text-[#111827]">
      {/* HEADER */}

      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-[31px] font-semibold tracking-[-0.04em] text-[#111111]">
            Templates
          </h1>

          <p className="mt-1.5 text-[13px] text-[#7b8495]">
            Choose a template and start creating faster.
          </p>
        </div>
      </div>

      {/* TABS */}

      <div className="mt-8 border-b border-[#ececf1]">
        <div className="flex gap-8">
          <button
            type="button"
            onClick={() => setActiveTab("discover")}
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
            type="button"
            onClick={() => setActiveTab("saved")}
            className={`relative pb-3 text-[13px] font-semibold ${
              activeTab === "saved"
                ? "text-[#6047ed]"
                : "text-[#8a93a3]"
            }`}
          >
            Saved

            {activeTab === "saved" && (
              <span className="absolute bottom-[-1px] left-0 h-[2px] w-full rounded-full bg-[#6047ed]" />
            )}
          </button>
        </div>
      </div>

      {/* DISCOVER */}

      {activeTab === "discover" && (
        <>
          {/* CATEGORIES */}

          <section className="mt-5 flex flex-wrap items-center gap-2">
            {categories.map((category) => {
              const active = activeCategory === category;

              return (
                <button
                  key={category}
                  type="button"
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
          </section>

          {/* SEARCH / SORT / VIEW */}

          <section className="mt-5 flex items-center justify-between">
            <div className="flex h-10 w-[280px] items-center gap-2 rounded-xl border border-[#e7e8ed] bg-white px-3">
              <Search size={15} className="shrink-0 text-[#9ca3af]" />

              <input
                type="text"
                placeholder="Search templates..."
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

            <div className="flex items-center gap-2">
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

          {/* CONTENT */}

          <section className="mt-5">
            {displayedTemplates.length === 0 ? (
              <div className="flex min-h-[380px] flex-col items-center justify-center rounded-2xl border border-dashed border-[#dedfe6] bg-[#fcfcfd] px-6 text-center">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#f3efff] text-[#6547ef]">
                  <LayoutTemplate size={22} />
                </div>

                <h3 className="mt-5 text-[15px] font-semibold text-[#252936]">
                  Templates coming soon
                </h3>

                <p className="mt-2 max-w-[380px] text-[11px] leading-5 text-[#8b93a1]">
                  Your custom templates will appear here when you add them.
                </p>
              </div>
            ) : (
              <div
                className={
                  viewMode === "grid"
                    ? "grid grid-cols-4 gap-5"
                    : "flex flex-col gap-3"
                }
              >
                {displayedTemplates.map((template) => (
                  <article
                    key={template.id}
                    className={
                      viewMode === "grid"
                        ? "group overflow-hidden rounded-2xl border border-[#e7e8ed] bg-white transition duration-200 hover:-translate-y-[2px] hover:border-[#d8d2fb] hover:shadow-[0_14px_35px_rgba(40,32,90,0.08)]"
                        : "group flex overflow-hidden rounded-2xl border border-[#e7e8ed] bg-white transition hover:border-[#d8d2fb]"
                    }
                  >
                    <div
                      className={
                        viewMode === "grid"
                          ? "relative aspect-[4/3] overflow-hidden bg-[#f5f5f7]"
                          : "relative h-[140px] w-[220px] shrink-0 overflow-hidden bg-[#f5f5f7]"
                      }
                    >
                      <img
                        src={template.image}
                        alt={template.title}
                        className="h-full w-full object-cover"
                      />

                      <button
                        type="button"
                        className="absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-xl border border-white/70 bg-white/90 text-[#657084] shadow-sm backdrop-blur"
                      >
                        <Bookmark size={15} />
                      </button>
                    </div>

                    <div
                      className={
                        viewMode === "grid"
                          ? "p-4"
                          : "flex flex-1 flex-col justify-center p-5"
                      }
                    >
                      <h3 className="truncate text-[13px] font-semibold text-[#222735]">
                        {template.title}
                      </h3>

                      <p className="mt-1.5 text-[10px] text-[#8a93a3]">
                        {template.category}
                      </p>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </section>
        </>
      )}

      {/* SAVED */}

      {activeTab === "saved" && (
        <section className="mt-5">
          <div className="flex min-h-[380px] flex-col items-center justify-center rounded-2xl border border-dashed border-[#dedfe6] bg-[#fcfcfd] px-6 text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#f3efff] text-[#6547ef]">
              <Bookmark size={22} />
            </div>

            <h3 className="mt-5 text-[15px] font-semibold text-[#252936]">
              No saved templates yet
            </h3>

            <p className="mt-2 max-w-[360px] text-[11px] leading-5 text-[#8b93a1]">
              Templates you save will appear here.
            </p>
          </div>
        </section>
      )}
    </main>
  );
}