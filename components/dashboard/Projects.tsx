"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  FolderPlus,
  ArrowRight,
  Loader2,
  FolderKanban,
  MoreHorizontal,
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

export default function Projects() {
  const router = useRouter();

  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [duplicatingId, setDuplicatingId] = useState<string | null>(null);
  const [projectToDelete, setProjectToDelete] =
    useState<Project | null>(null);
  const [deletingId, setDeletingId] =
    useState<string | null>(null);
  const [error, setError] = useState("");

  const loadProjects = async () => {
    setLoading(true);
    setError("");

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      setError("You need to sign in first.");
      setLoading(false);
      return;
    }

    const { data, error: projectsError } = await supabase
      .from("projects")
      .select("id, name, description, created_at, updated_at")
      .eq("user_id", user.id)
      .order("updated_at", {
        ascending: false,
      })
      .limit(3);

    if (projectsError) {
      console.error("Load projects error:", projectsError);
      setError("Could not load projects.");
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

  const createProject = async () => {
    if (creating) return;

    setCreating(true);
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

      const { data: project, error: projectError } =
        await supabase
          .from("projects")
          .insert({
            user_id: user.id,
            name: "Untitled Project",
          })
          .select()
          .single();

      if (projectError) throw projectError;

      router.push(`/workspace/${project.id}`);
    } catch (err) {
      console.error("Create project error:", err);

      setError(
        err instanceof Error
          ? err.message
          : "Could not create project."
      );
    } finally {
      setCreating(false);
    }
  };

  const duplicateProject = async (project: Project) => {
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

      const { data: duplicatedProject, error: duplicateError } =
        await supabase
          .from("projects")
          .insert({
            user_id: user.id,
            name: `${project.name} Copy`,
            description: project.description,
          })
          .select()
          .single();

      if (duplicateError) {
        throw duplicateError;
      }

      setProjects((prev) => [
        duplicatedProject,
        ...prev,
      ]);

      window.dispatchEvent(
        new Event("designhub:projects-changed")
      );

      setOpenMenuId(null);
    } catch (err) {
      console.error("Duplicate project error:", err);

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

      if (deleteError) {
        throw deleteError;
      }

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
      console.error("Delete project error:", err);

      setError(
        err instanceof Error
          ? err.message
          : "Could not delete project."
      );
    } finally {
      setDeletingId(null);
    }
  };

  if (loading) {
    return (
      <section className="flex h-full min-h-[370px] items-center justify-center rounded-[24px] border border-[#E8E9EF] bg-white">
        <div className="flex items-center gap-2 text-xs text-[#6B7280]">
          <Loader2
            size={16}
            className="animate-spin text-[#6C5DD3]"
          />
          Loading projects...
        </div>
      </section>
    );
  }

  return (
    <>
      <section className="flex h-full flex-col rounded-[24px] border border-[#E8E9EF] bg-white p-6">

        {/* HEADER */}
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-[18px] font-bold tracking-[-0.4px] text-[#111827]">
              Projects
            </h2>

            <p className="mt-1 text-xs text-[#6B7280]">
              Create, organize and continue working.
            </p>
          </div>

          <Link
            href="/dashboard/projects"
            className="flex shrink-0 items-center gap-1.5 whitespace-nowrap text-xs font-semibold text-[#6C5DD3] transition hover:gap-2"
          >
            View all
            <ArrowRight size={14} />
          </Link>
        </div>

        {/* NO PROJECTS */}
        {projects.length === 0 ? (
          <div className="mt-6 flex min-h-[260px] flex-1 flex-col items-center justify-center rounded-[20px] border border-dashed border-[#DDD8F8] bg-[#FCFBFF] px-6 py-8 text-center">

            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#F3EEFF]">
              <FolderPlus
                size={26}
                strokeWidth={1.8}
                className="text-[#6C5DD3]"
              />
            </div>

            <h3 className="mt-4 text-[17px] font-bold text-[#111827]">
              No projects yet
            </h3>

            <p className="mt-2 max-w-[330px] text-xs leading-5 text-[#6B7280]">
              Create your first project and keep all your files,
              assets and collaboration inside one workspace.
            </p>

            <button
              type="button"
              onClick={createProject}
              disabled={creating}
              className="mt-5 inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-[#6C5DD3] px-6 text-xs font-semibold text-white transition hover:bg-[#5A4BCE] disabled:opacity-60"
            >
              {creating ? (
                <>
                  <Loader2
                    size={15}
                    className="animate-spin"
                  />
                  Creating...
                </>
              ) : (
                <>
                  <FolderPlus size={15} />
                  Create Project
                </>
              )}
            </button>
          </div>
        ) : (
          /* EXISTING PROJECTS */
          <div className="mt-6 grid flex-1 grid-cols-1 gap-3">
            {projects.map((project) => (
              <div
                key={project.id}
                className="group relative flex min-h-[84px] w-full items-center gap-4 rounded-[16px] border border-[#E8E9EF] bg-white p-4 transition-all hover:border-[#DDD8F8] hover:bg-[#FCFBFF]"
              >
                {/* PROJECT */}
                <button
                  type="button"
                  onClick={() =>
                    router.push(`/workspace/${project.id}`)
                  }
                  className="flex min-w-0 flex-1 items-center gap-4 text-left"
                >
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#F3EEFF]">
                    <FolderKanban
                      size={20}
                      strokeWidth={1.8}
                      className="text-[#6C5DD3]"
                    />
                  </div>

                  <div className="min-w-0 flex-1">
                    <h3 className="truncate text-[13px] font-semibold text-[#111827]">
                      {project.name}
                    </h3>

                    <p className="mt-1 text-[11px] text-[#6B7280]">
                      {formatLastEdited(project.updated_at)}
                    </p>
                  </div>
                </button>

                {/* MORE */}
                <button
                  type="button"
                  onClick={() =>
                    setOpenMenuId(
                      openMenuId === project.id
                        ? null
                        : project.id
                    )
                  }
                  className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-[#9CA3AF] transition hover:bg-[#F1EDFF] hover:text-[#6C5DD3]"
                >
                  <MoreHorizontal size={17} />
                </button>

                {/* MENU */}
                {openMenuId === project.id && (
                  <div className="absolute right-3 top-[58px] z-30 w-[165px] rounded-xl border border-[#E8E9EF] bg-white p-1.5 shadow-[0_12px_35px_rgba(17,24,39,0.12)]">
                    <button
                      type="button"
                      disabled={duplicatingId === project.id}
                      onClick={() => duplicateProject(project)}
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
            ))}

            {/* NEW PROJECT */}
            <button
              type="button"
              onClick={createProject}
              disabled={creating}
              className="flex h-11 items-center justify-center gap-2 rounded-xl border border-dashed border-[#D9D4F5] text-xs font-semibold text-[#6C5DD3] transition hover:bg-[#F8F6FF]"
            >
              {creating ? (
                <Loader2
                  size={15}
                  className="animate-spin"
                />
              ) : (
                <FolderPlus size={15} />
              )}

              New Project
            </button>
          </div>
        )}

        {error && (
          <p className="mt-3 text-xs text-red-500">
            {error}
          </p>
        )}
      </section>

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
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-[400px] rounded-[22px] border border-[#E8E9EF] bg-white p-6 shadow-[0_24px_70px_rgba(17,24,39,0.18)]"
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-[14px] bg-red-50">
              <Trash2
                size={21}
                strokeWidth={1.8}
                className="text-red-500"
              />
            </div>

            <h3 className="mt-5 text-[18px] font-bold tracking-[-0.3px] text-[#111827]">
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
                onClick={() => setProjectToDelete(null)}
                className="h-10 rounded-xl border border-[#E5E7EB] px-4 text-xs font-semibold text-[#374151] transition hover:bg-[#F7F8FA] disabled:opacity-50"
              >
                Cancel
              </button>

              <button
                type="button"
                disabled={!!deletingId}
                onClick={deleteProject}
                className="flex h-10 min-w-[88px] items-center justify-center gap-2 rounded-xl bg-red-500 px-4 text-xs font-semibold text-white transition hover:bg-red-600 disabled:cursor-not-allowed disabled:opacity-60"
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
    </>
  );
}