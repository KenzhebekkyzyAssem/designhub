"use client";

import Link from "next/link";
import { Clock, ArrowRight } from "lucide-react";

export default function ContinueWorking() {
  return (
    <section className="flex h-full flex-col rounded-[24px] border border-[#E8E9EF] bg-white p-6">
      {/* HEADER */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-[18px] font-bold tracking-[-0.4px] text-[#111827]">
            Continue Working
          </h2>

          <p className="mt-1 text-xs text-[#6B7280]">
            Pick up where you left off
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

      {/* EMPTY STATE */}
      <div className="mt-6 flex min-h-[260px] flex-1 flex-col items-center justify-center rounded-[20px] border border-dashed border-[#DDD8F8] bg-[#FCFBFF] px-6 text-center">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#F3EEFF]">
          <Clock
            size={26}
            strokeWidth={1.8}
            className="text-[#6C5DD3]"
          />
        </div>

        <h3 className="mt-5 text-[17px] font-bold text-[#111827]">
          No recent designs
        </h3>

        <p className="mt-2 max-w-[260px] text-xs leading-5 text-[#6B7280]">
          Your recently edited designs will appear here.
        </p>
      </div>
    </section>
  );
}