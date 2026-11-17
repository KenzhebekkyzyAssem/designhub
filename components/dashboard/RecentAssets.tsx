"use client";

import Link from "next/link";
import { FolderPlus, ArrowRight } from "lucide-react";

export default function RecentAssets() {
  return (
    <section className="flex h-full flex-col rounded-[24px] border border-[#E8E9EF] bg-white p-6">
      {/* HEADER */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-[18px] font-bold tracking-[-0.4px] text-[#111827]">
            Recent Assets
          </h2>

          <p className="mt-1 text-xs text-[#6B7280]">
            Your recently added assets
          </p>
        </div>

        <Link
          href="/dashboard/assets"
          className="flex shrink-0 items-center gap-1.5 whitespace-nowrap text-xs font-semibold text-[#6C5DD3] transition hover:gap-2"
        >
          View all
          <ArrowRight size={14} />
        </Link>
      </div>

      {/* EMPTY STATE */}
      <div className="mt-5 flex min-h-[210px] flex-1 flex-col items-center justify-center rounded-[20px] border border-dashed border-[#DDD8F8] bg-[#FCFBFF] px-6 py-8 text-center">
        {/* ICON */}
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#F3EEFF]">
          <FolderPlus
            size={25}
            strokeWidth={1.8}
            className="text-[#6C5DD3]"
          />
        </div>

        <h3 className="mt-4 text-[16px] font-bold text-[#111827]">
          No assets yet
        </h3>

        <p className="mt-1.5 max-w-[280px] text-xs leading-5 text-[#6B7280]">
          Upload files or import from other tools.
        </p>
      </div>
    </section>
  );
}