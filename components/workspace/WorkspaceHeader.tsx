"use client";

import Link from "next/link";
import {
  ChevronDown,
  Undo2,
  Redo2,
  Minus,
  Plus,
  Share2,
  Download,
  Crown,
} from "lucide-react";

import { useEditorStore } from "@/store/useEditorStore";

export default function WorkspaceHeader() {
  const {
    projectName,
    setProjectName,
    zoom,
    setZoom,
  } = useEditorStore();

  const zoomPercent = Math.round(zoom * 100);

  const zoomOut = () => {
    setZoom(zoom - 0.1);
  };

  const zoomIn = () => {
    setZoom(zoom + 0.1);
  };

  return (
    <header className="flex h-[72px] shrink-0 items-center border-b border-[#E8E8ED] bg-white px-5">

      {/* ================= LEFT ================= */}

      <div className="flex min-w-0 flex-1 items-center">

        {/* Logo */}
        <Link
          href="/dashboard"
          className="flex shrink-0 items-center"
          title="Back to Dashboard"
        >
          <img
            src="/logos/logo.svg"
            alt="DesignHub"
            className="h-8 w-auto"
          />
        </Link>

        <div className="mx-5 h-7 w-px bg-[#E8E8ED]" />

        {/* Project name */}
        <div className="flex min-w-0 items-center gap-2">

          <input
            value={projectName}
            onChange={(event) =>
              setProjectName(event.target.value)
            }
            className="max-w-[180px] truncate rounded-lg bg-transparent px-2 py-1.5 text-sm font-semibold text-[#111827] outline-none transition hover:bg-[#F7F7FA] focus:bg-[#F7F7FA]"
          />

          <ChevronDown
            size={15}
            className="shrink-0 text-[#8B8F99]"
          />

        </div>

        {/* Saved */}
        <div className="ml-4 flex shrink-0 items-center gap-2 text-xs text-[#8B8F99]">
          <span className="h-2 w-2 rounded-full bg-[#22C55E]" />
          Saved
        </div>

      </div>

      {/* ================= CENTER ================= */}

      <div className="absolute left-1/2 flex -translate-x-1/2 items-center gap-3">

        {/* Undo / Redo */}
        <div className="flex items-center rounded-xl border border-[#E8E8ED] bg-[#FAFAFC] p-1">

          <button
            type="button"
            className="flex h-8 w-8 items-center justify-center rounded-lg text-[#6B7280] transition hover:bg-white hover:text-[#111827]"
            title="Undo"
          >
            <Undo2 size={16} />
          </button>

          <button
            type="button"
            className="flex h-8 w-8 items-center justify-center rounded-lg text-[#6B7280] transition hover:bg-white hover:text-[#111827]"
            title="Redo"
          >
            <Redo2 size={16} />
          </button>

        </div>

        {/* Zoom */}
        <div className="flex items-center rounded-xl border border-[#E8E8ED] bg-[#FAFAFC] p-1">

          <button
            type="button"
            onClick={zoomOut}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-[#6B7280] transition hover:bg-white hover:text-[#111827]"
            title="Zoom out"
          >
            <Minus size={15} />
          </button>

          <button
            type="button"
            onClick={() => setZoom(1)}
            className="min-w-[58px] rounded-lg px-2 py-2 text-xs font-semibold text-[#374151] transition hover:bg-white"
            title="Reset zoom"
          >
            {zoomPercent}%
          </button>

          <button
            type="button"
            onClick={zoomIn}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-[#6B7280] transition hover:bg-white hover:text-[#111827]"
            title="Zoom in"
          >
            <Plus size={15} />
          </button>

        </div>

      </div>

      {/* ================= RIGHT ================= */}

      <div className="flex flex-1 items-center justify-end gap-2">

        <button
          type="button"
          className="flex h-10 items-center gap-2 rounded-xl border border-[#E5E7EB] bg-white px-4 text-sm font-semibold text-[#374151] transition hover:bg-[#F8F8FA]"
        >
          <Crown
            size={16}
            className="text-[#6C5DD3]"
          />
          Upgrade
        </button>

        <button
          type="button"
          className="flex h-10 items-center gap-2 rounded-xl border border-[#E5E7EB] bg-white px-4 text-sm font-semibold text-[#374151] transition hover:bg-[#F8F8FA]"
        >
          <Share2 size={16} />
          Share
        </button>

        <button
          type="button"
          className="flex h-10 items-center gap-2 rounded-xl bg-[#6C5DD3] px-5 text-sm font-semibold text-white shadow-[0_8px_20px_rgba(108,93,211,0.18)] transition hover:bg-[#5A4BCE]"
        >
          <Download size={16} />
          Export
        </button>

        {/* Profile */}
        <Link
          href="/dashboard/profile"
          className="ml-1 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#6C5DD3] text-sm font-semibold text-white transition hover:bg-[#5A4BCE]"
        >
          A
        </Link>

      </div>

    </header>
  );
}