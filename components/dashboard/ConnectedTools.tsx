"use client";

import Link from "next/link";
import { Plug, Plus } from "lucide-react";

export default function ConnectedTools() {
  return (
    <section className="flex h-full flex-col rounded-[24px] border border-[#E8E9EF] bg-white p-6">
      {/* HEADER */}
      <div>
        <h2 className="text-[18px] font-bold tracking-[-0.4px] text-[#111827]">
          Connected Tools
        </h2>

        <p className="mt-1 text-xs text-[#6B7280]">
          Connect your favorite design tools
        </p>
      </div>

      {/* EMPTY STATE */}
      <div className="mt-6 flex min-h-[260px] flex-1 flex-col items-center justify-center rounded-[20px] border border-dashed border-[#DDD8F8] bg-[#FCFBFF] px-6 text-center">
        
        {/* ICON */}
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#F3EEFF]">
          <Plug
            size={26}
            strokeWidth={1.8}
            className="text-[#6C5DD3]"
          />
        </div>

        {/* TITLE */}
        <h3 className="mt-5 text-[17px] font-bold text-[#111827]">
          No tools connected
        </h3>

        {/* DESCRIPTION */}
        <p className="mt-2 max-w-[260px] text-xs leading-5 text-[#6B7280]">
          Connect your design tools to access everything from one workspace.
        </p>

        {/* CONNECT BUTTON */}
        <Link
          href="/dashboard/integrations"
          className="
            mt-5
            inline-flex
            h-11
            items-center
            justify-center
            gap-2
            rounded-xl
            bg-[#6C5DD3]
            px-5
            text-xs
            font-semibold
            text-white
            transition-all
            duration-200
            hover:bg-[#5A4BCE]
          "
        >
          <Plus size={16} strokeWidth={2} />
          Connect a tool
        </Link>
      </div>
    </section>
  );
}