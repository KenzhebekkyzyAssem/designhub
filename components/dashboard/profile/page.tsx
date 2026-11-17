"use client";

import { FolderPlus } from "lucide-react";

export default function ProjectsPage() {
  return (
    <div className="min-h-full bg-[#F7F8FC] p-8">

      {/* Header */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-[30px] font-bold tracking-[-1px] text-[#111827]">
            Projects
          </h1>

          <p className="mt-1 text-sm text-[#6B7280]">
            Create, organize and manage your design projects.
          </p>
        </div>

        <button className="flex h-11 items-center gap-2 rounded-xl bg-[#6C5DD3] px-5 text-sm font-semibold text-white transition hover:bg-[#5A4BCE]">
          <FolderPlus size={18} />
          Create Project
        </button>
      </div>

      {/* Empty state */}
      <div className="flex min-h-[520px] items-center justify-center rounded-[24px] border border-[#E7E7EF] bg-white">

        <div className="flex max-w-[420px] flex-col items-center text-center">

          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-[#F1EBFF]">
            <FolderPlus
              size={30}
              strokeWidth={1.8}
              className="text-[#6C5DD3]"
            />
          </div>

          <h2 className="mt-6 text-[24px] font-bold tracking-[-0.5px] text-[#111827]">
            No projects yet
          </h2>

          <p className="mt-2 text-sm leading-6 text-[#6B7280]">
            Create your first project and start designing in your
            DesignHub workspace.
          </p>

          <button className="mt-6 flex h-11 items-center gap-2 rounded-xl bg-[#6C5DD3] px-6 text-sm font-semibold text-white transition hover:bg-[#5A4BCE]">
            <FolderPlus size={17} />
            Create Project
          </button>

        </div>

      </div>

    </div>
  );
}