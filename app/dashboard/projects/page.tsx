"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Search,
  Grid2X2,
  List,
  MoreHorizontal,
  Plus,
  ImageIcon,
  Loader2,
  Copy,
  Trash2,
} from "lucide-react";

import { supabase } from "@/lib/supabase";

type Project = {
  id: string;
  name: string;
  description: string | null;
  created_at: string;
  updated_at: string;
};

function formatLastEdited(date: string) {
  const updated = new Date(date);
  const now = new Date();

  const diffMs = now.getTime() - updated.getTime();
  const diffMinutes = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMinutes < 1) {
    return "Edited just now";
  }

  if (diffMinutes < 60) {
    return `Edited ${diffMinutes}m ago`;
  }

  if (diffHours < 24) {
    return `Edited ${diffHours}h ago`;
  }

  if (diffDays === 1) {
    return "Edited yesterday";
  }

  if (diffDays < 7) {
    return `Edited ${diffDays}d ago`;
  }

  return `Edited ${updated.toLocaleDateString()}`;
}

export default function ProjectsPage() {
  const router = useRouter();

  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");

  const [activeTab, setActiveTab] = useState<
    "all" | "recent"
  >("all");

  const [view, setView] = useState<
    "grid" | "list"
  >("grid");

  const [openMenuId, setOpenMenuId] =
    useState<string | null>(null);
  const [duplicatingId, setDuplicatingId] =
    useState<string | null>(null);
  const [projectToDelete, setProjectToDelete] =
    useState<Project | null>(null);
  const [deletingId, setDeletingId] =
    useState<string | null>(null);
  const [error, setError] = useState("");

  const loadProjects = async () => {
    setLoading(true);

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      setProjects([]);
      setLoading(false);
      return;
    }

    const { data, error } = await supabase
      .from("projects")
      .select(
        "id, name, description, created_at, updated_at"
      )
      .eq("user_id", user.id)
      .order("updated_at", {
        ascending: false,
      });

    if (error) {
      console.error("Load projects error:", error);
      setProjects([]);
      setLoading(false);
      return;
    }

    setProjects(data || []);
    setLoading(false);
  };

  useEffect(() => {
    loadProjects();

    const handleProjectsChanged = () => {
      loadProjects();
    };

    window.addEventListener(
      "designhub:projects-changed",
      handleProjectsChanged
    );

    return () => {
      window.removeEventListener(
        "designhub:projects-changed",
        handleProjectsChanged
      );
    };
  }, []);

  const filteredProjects = useMemo(() => {
    let result = [...projects];

    // Search
    if (search.trim()) {
      result = result.filter((project) =>
        project.name
          .toLowerCase()
          .includes(search.toLowerCase())
      );
    }

    // Recent
    if (activeTab === "recent") {
      const sevenDaysAgo =
        Date.now() - 7 * 24 * 60 * 60 * 1000;

      result = result.filter(
        (project) =>
          new Date(project.updated_at).getTime() >=
          sevenDaysAgo
      );
    }

    return result;
  }, [projects, search, activeTab]);

  const createProject = async () => {
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) return;

    const { data: project, error } = await supabase
      .from("projects")
      .insert({
        user_id: user.id,
        name: "Untitled Project",
      })
      .select()
      .single();

    if (error) {
      console.error("Create project error:", error);
      return;
    }

    window.dispatchEvent(
      new Event("designhub:projects-changed")
    );

    router.push(`/workspace/${project.id}`);
  };

  const duplicateProject = async (
    project: Project
  ) => {
    if (duplicatingId) return;

    setDuplicatingId(project.id);
    setError("");

    try {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError) throw userError;
      if (!user) {
        throw new Error("You need to sign in first.");
      }

      const {
        data: duplicatedProject,
        error: duplicateError,
      } = await supabase
        .from("projects")
        .insert({
          user_id: user.id,
          name: `${project.name} Copy`,
          description: project.description,
        })
        .select()
        .single();

      if (duplicateError) throw duplicateError;

      setProjects((prev) => [
        duplicatedProject,
        ...prev,
      ]);

      window.dispatchEvent(
        new Event("designhub:projects-changed")
      );

      setOpenMenuId(null);
    } catch (err) {
      console.error("Duplicate error:", err);

      setError(
        err instanceof Error
          ? err.message
          : "Could not duplicate project."
      );
    } finally {
      setDuplicatingId(null);
    }
  };

  const deleteProject = async () => {
    if (!projectToDelete || deletingId) return;

    setDeletingId(projectToDelete.id);
    setError("");

    try {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError) throw userError;
      if (!user) {
        throw new Error("You need to sign in first.");
      }

      const { error: deleteError } = await supabase
        .from("projects")
        .delete()
        .eq("id", projectToDelete.id)
        .eq("user_id", user.id);

      if (deleteError) throw deleteError;

      setProjects((prev) =>
        prev.filter(
          (project) =>
            project.id !== projectToDelete.id
        )
      );

      window.dispatchEvent(
        new Event("designhub:projects-changed")
      );

      setProjectToDelete(null);
      setOpenMenuId(null);
    } catch (err) {
      console.error("Delete error:", err);

      setError(
        err instanceof Error
          ? err.message
          : "Could not delete project."
      );
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <main className="min-h-full bg-[#F7F8FC] px-7 py-7">
      {/* HEADER */}

      <div className="flex items-start justify-between gap-6">
        <div>
          <h1 className="text-[28px] font-bold tracking-[-0.8px] text-[#111827]">
            Projects
          </h1>

          <p className="mt-1.5 text-[13px] text-[#6B7280]">
            Manage and organize all your design projects
          </p>
        </div>

        <button
          type="button"
          onClick={createProject}
          className="flex h-11 items-center justify-center gap-2 rounded-xl bg-[#6C5DD3] px-5 text-[13px] font-semibold text-white transition hover:bg-[#5C4DC7]"
        >
          <Plus size={17} />
          New Project
        </button>
      </div>

      {/* SEARCH + VIEW */}

      <div className="mt-8 flex items-center justify-between gap-5">
        <div className="relative w-full max-w-[475px]">
          <Search
            size={17}
            className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[#9CA3AF]"
          />

          <input
            value={search}
            onChange={(e) =>
              setSearch(e.target.value)
            }
            placeholder="Search projects..."
            className="h-12 w-full rounded-xl border border-[#E1E3EA] bg-white pl-11 pr-4 text-[13px] text-[#111827] outline-none transition placeholder:text-[#9CA3AF] focus:border-[#CFC8F7]"
          />
        </div>

        <div className="flex h-12 rounded-xl border border-[#E1E3EA] bg-white p-1">
          <button
            type="button"
            onClick={() => setView("grid")}
            className={`flex items-center gap-2 rounded-lg px-4 text-[12px] font-semibold transition ${
              view === "grid"
                ? "bg-[#F2EFFF] text-[#6C5DD3]"
                : "text-[#4B5563]"
            }`}
          >
            <Grid2X2 size={16} />
            Grid
          </button>

          <button
            type="button"
            onClick={() => setView("list")}
            className={`flex items-center gap-2 rounded-lg px-4 text-[12px] font-semibold transition ${
              view === "list"
                ? "bg-[#F2EFFF] text-[#6C5DD3]"
                : "text-[#4B5563]"
            }`}
          >
            <List size={16} />
            List
          </button>
        </div>
      </div>

      {/* TABS */}

      <div className="mt-7 border-b border-[#E3E5EB]">
        <div className="flex gap-8">
          <button
            onClick={() => setActiveTab("all")}
            className={`relative pb-4 text-[13px] font-semibold ${
              activeTab === "all"
                ? "text-[#6C5DD3]"
                : "text-[#4B5563]"
            }`}
          >
            All projects

            {activeTab === "all" && (
              <span className="absolute bottom-[-1px] left-0 h-[2px] w-full bg-[#6C5DD3]" />
            )}
          </button>

          <button
            onClick={() => setActiveTab("recent")}
            className={`relative pb-4 text-[13px] font-semibold ${
              activeTab === "recent"
                ? "text-[#6C5DD3]"
                : "text-[#4B5563]"
            }`}
          >
            Recent

            {activeTab === "recent" && (
              <span className="absolute bottom-[-1px] left-0 h-[2px] w-full bg-[#6C5DD3]" />
            )}
          </button>
        </div>
      </div>

      {error && (
        <p className="mt-4 text-xs text-red-500">
          {error}
        </p>
      )}

      {/* LOADING */}

      {loading && (
        <div className="flex min-h-[350px] items-center justify-center">
          <Loader2
            size={22}
            className="animate-spin text-[#6C5DD3]"
          />
        </div>
      )}

      {/* EMPTY */}

      {!loading && filteredProjects.length === 0 && (
        <div className="flex min-h-[380px] flex-col items-center justify-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#F2EFFF]">
            <ImageIcon
              size={23}
              className="text-[#6C5DD3]"
            />
          </div>

          <h2 className="mt-4 text-[16px] font-semibold text-[#111827]">
            No projects yet
          </h2>

          <p className="mt-2 text-[12px] text-[#7B8190]">
            Create your first project to get started.
          </p>
        </div>
      )}

      {/* GRID */}

      {!loading &&
        view === "grid" &&
        filteredProjects.length > 0 && (
          <div className="mt-6 grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
            {filteredProjects.map((project) => (
              <article
                key={project.id}
                className="overflow-hidden rounded-[18px] border border-[#E2E4EA] bg-white transition hover:-translate-y-[2px] hover:border-[#D8D3F3]"
              >
                <button
                  type="button"
                  onClick={() =>
                    router.push(
                      `/workspace/${project.id}`
                    )
                  }
                  className="block w-full text-left"
                >
                  <div className="p-2">
                    <div className="flex aspect-[16/9] items-center justify-center rounded-[13px] bg-[#F2EFFF]">
                      <div className="flex flex-col items-center">
                        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/70">
                          <ImageIcon
                            size={20}
                            className="text-[#8B8F9C]"
                          />
                        </div>

                        <span className="mt-2 text-[10px] text-[#8B8F9C]">
                          No preview yet
                        </span>
                      </div>
                    </div>
                  </div>
                </button>

                <div className="flex items-end justify-between gap-4 px-5 pb-5 pt-2">
                  <button
                    type="button"
                    onClick={() =>
                      router.push(
                        `/workspace/${project.id}`
                      )
                    }
                    className="min-w-0 flex-1 text-left"
                  >
                    <h2 className="truncate text-[15px] font-semibold text-[#111827]">
                      {project.name}
                    </h2>

                    <p className="mt-1.5 text-[12px] text-[#7B8190]">
                      {formatLastEdited(
                        project.updated_at
                      )}
                    </p>
                  </button>

                  <div className="relative">
                    <button
                      type="button"
                      onClick={() =>
                        setOpenMenuId(
                          openMenuId === project.id
                            ? null
                            : project.id
                        )
                      }
                      className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[10px] border border-[#E3E5EB] text-[#6B7280] transition hover:bg-[#F5F2FF] hover:text-[#6C5DD3]"
                    >
                      <MoreHorizontal size={18} />
                    </button>

                    {openMenuId === project.id && (
                      <div className="absolute bottom-11 right-0 z-40 w-[170px] rounded-xl border border-[#E8E9EF] bg-white p-1.5 shadow-[0_12px_35px_rgba(17,24,39,0.12)]">
                        <button
                          type="button"
                          disabled={
                            duplicatingId === project.id
                          }
                          onClick={() =>
                            duplicateProject(project)
                          }
                          className="flex h-9 w-full items-center gap-2.5 rounded-lg px-3 text-left text-xs font-medium text-[#374151] transition hover:bg-[#F7F5FF] hover:text-[#6C5DD3] disabled:opacity-50"
                        >
                          {duplicatingId === project.id ? (
                            <Loader2
                              size={15}
                              className="animate-spin"
                            />
                          ) : (
                            <Copy size={15} />
                          )}

                          {duplicatingId === project.id
                            ? "Duplicating..."
                            : "Duplicate"}
                        </button>

                        <div className="my-1 border-t border-[#F0F1F4]" />

                        <button
                          type="button"
                          onClick={() => {
                            setProjectToDelete(project);
                            setOpenMenuId(null);
                          }}
                          className="flex h-9 w-full items-center gap-2.5 rounded-lg px-3 text-left text-xs font-medium text-red-500 transition hover:bg-red-50"
                        >
                          <Trash2 size={15} />
                          Delete
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}

      {/* LIST */}

      {!loading &&
        view === "list" &&
        filteredProjects.length > 0 && (
          <div className="mt-6 rounded-[18px] border border-[#E2E4EA] bg-white">
            {filteredProjects.map(
              (project, index) => (
                <div
                  key={project.id}
                  className={`flex w-full items-center gap-4 px-5 py-4 transition hover:bg-[#FAFAFC] ${
                    index !==
                    filteredProjects.length - 1
                      ? "border-b border-[#EEF0F3]"
                      : ""
                  }`}
                >
                  <button
                    type="button"
                    onClick={() =>
                      router.push(
                        `/workspace/${project.id}`
                      )
                    }
                    className="flex min-w-0 flex-1 items-center gap-4 text-left"
                  >
                    <div className="flex h-12 w-[76px] shrink-0 items-center justify-center rounded-lg bg-[#F2EFFF]">
                      <ImageIcon
                        size={18}
                        className="text-[#6C5DD3]"
                      />
                    </div>

                    <div className="min-w-0 flex-1">
                      <h2 className="truncate text-[13px] font-semibold text-[#111827]">
                        {project.name}
                      </h2>

                      <p className="mt-1 text-[11px] text-[#7B8190]">
                        {formatLastEdited(
                          project.updated_at
                        )}
                      </p>
                    </div>
                  </button>

                  <div className="relative">
                    <button
                      type="button"
                      onClick={() =>
                        setOpenMenuId(
                          openMenuId === project.id
                            ? null
                            : project.id
                        )
                      }
                      className="flex h-9 w-9 items-center justify-center rounded-lg text-[#7B8190] transition hover:bg-[#F2EFFF] hover:text-[#6C5DD3]"
                    >
                      <MoreHorizontal size={18} />
                    </button>

                    {openMenuId === project.id && (
                      <div
                        onClick={(e) => e.stopPropagation()}
                        className="absolute bottom-11 right-0 z-50 w-[170px] rounded-xl border border-[#E8E9EF] bg-white p-1.5 shadow-[0_12px_35px_rgba(17,24,39,0.12)]"
                      >
                        <button
                          type="button"
                          disabled={
                            duplicatingId === project.id
                          }
                          onClick={() =>
                            duplicateProject(project)
                          }
                          className="flex h-9 w-full items-center gap-2.5 rounded-lg px-3 text-left text-xs font-medium text-[#374151] transition hover:bg-[#F7F5FF] hover:text-[#6C5DD3] disabled:opacity-50"
                        >
                          {duplicatingId === project.id ? (
                            <Loader2
                              size={15}
                              className="animate-spin"
                            />
                          ) : (
                            <Copy size={15} />
                          )}

                          {duplicatingId === project.id
                            ? "Duplicating..."
                            : "Duplicate"}
                        </button>

                        <div className="my-1 border-t border-[#F0F1F4]" />

                        <button
                          type="button"
                          onClick={() => {
                            setProjectToDelete(project);
                            setOpenMenuId(null);
                          }}
                          className="flex h-9 w-full items-center gap-2.5 rounded-lg px-3 text-left text-xs font-medium text-red-500 transition hover:bg-red-50"
                        >
                          <Trash2 size={15} />
                          Delete
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              )
            )}
          </div>
        )}

      {projectToDelete && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/20 p-4 backdrop-blur-[2px]"
          onClick={() => {
            if (!deletingId) {
              setProjectToDelete(null);
            }
          }}
        >
          <div
            onClick={(e) =>
              e.stopPropagation()
            }
            className="w-full max-w-[400px] rounded-[22px] border border-[#E8E9EF] bg-white p-6 shadow-[0_24px_70px_rgba(17,24,39,0.18)]"
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-[14px] bg-red-50">
              <Trash2
                size={21}
                className="text-red-500"
              />
            </div>

            <h3 className="mt-5 text-[18px] font-bold text-[#111827]">
              Delete project?
            </h3>

            <p className="mt-2 text-[13px] leading-5 text-[#6B7280]">
              Are you sure you want to delete{" "}
              <span className="font-semibold text-[#374151]">
                “{projectToDelete.name}”
              </span>
              ? This action cannot be undone.
            </p>

            <div className="mt-6 flex justify-end gap-2">
              <button
                type="button"
                disabled={!!deletingId}
                onClick={() =>
                  setProjectToDelete(null)
                }
                className="h-10 rounded-xl border border-[#E5E7EB] px-4 text-xs font-semibold text-[#374151] transition hover:bg-[#F7F8FA]"
              >
                Cancel
              </button>

              <button
                type="button"
                disabled={!!deletingId}
                onClick={deleteProject}
                className="flex h-10 min-w-[90px] items-center justify-center gap-2 rounded-xl bg-red-500 px-4 text-xs font-semibold text-white transition hover:bg-red-600 disabled:opacity-60"
              >
                {deletingId ? (
                  <>
                    <Loader2
                      size={14}
                      className="animate-spin"
                    />
                    Deleting...
                  </>
                ) : (
                  <>
                    <Trash2 size={14} />
                    Delete
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}