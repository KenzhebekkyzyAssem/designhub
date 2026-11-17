"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Sparkles } from "lucide-react";
import { supabase } from "@/lib/supabase";

export default function WorkspaceHero() {
  const router = useRouter();
  const [creating, setCreating] = useState(false);

  const handleCreateProject = async () => {
    try {
      setCreating(true);

      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) {
        router.push("/auth/login");
        return;
      }

      const { data, error } = await supabase
        .from("projects")
        .insert([
          {
            name: "Untitled Project",
            description: "Created from workspace hero",
            user_id: user.id,
          },
        ])
        .select()
        .single();

      if (error) {
        console.error("Error creating project:", error.message);
        setCreating(false);
        return;
      }

      if (data) {
        router.push(`/workspace/${data.id}`);
      }
    } catch (err) {
      console.error("Unexpected error:", err);
      setCreating(false);
    }
  };

  return (
    <section
      className="
        relative
        overflow-hidden
        rounded-[28px]
        border border-[#E8E9EF]
        bg-white
        p-10
      "
    >
      {/* RIGHT PURPLE GRADIENT */}
      <div
        className="
          pointer-events-none
          absolute
          inset-y-0
          right-0
          w-[55%]
          bg-gradient-to-l
          from-[#EEE9FF]
          via-[#F7F4FF]/70
          to-transparent
        "
      />

      {/* SOFT PURPLE GLOW */}
      <div
        className="
          pointer-events-none
          absolute
          right-[-60px]
          top-[-100px]
          h-[420px]
          w-[420px]
          rounded-full
          bg-[#8B7CF6]/15
          blur-[100px]
        "
      />

      {/* BOTTOM SOFT GLOW */}
      <div
        className="
          pointer-events-none
          absolute
          bottom-[-180px]
          right-[15%]
          h-[300px]
          w-[500px]
          rounded-full
          bg-[#C4B5FD]/10
          blur-[110px]
        "
      />

      {/* CONTENT */}
      <div className="relative z-10 flex flex-col justify-between gap-8 xl:flex-row">
        {/* LEFT CONTENT */}
        <div className="max-w-[580px]">

          {/* LABEL */}
          <div className="inline-flex items-center gap-2 rounded-full bg-[#F3EEFF] px-4 py-2">
            <Sparkles
              size={16}
              strokeWidth={1.8}
              className="text-[#6C5DD3]"
            />

            <span className="text-xs font-semibold uppercase tracking-[0.15em] text-[#6C5DD3]">
              DesignHub Workspace
            </span>
          </div>

          {/* TITLE */}
          <h1 className="mt-6 text-[40px] font-bold leading-[46px] tracking-[-1.5px] text-[#111827]">
            Everything for
            <br />
            your{" "}
            <span className="text-[#6C5DD3]">
              design workflow.
            </span>
          </h1>

          {/* DESCRIPTION */}
          <p className="mt-5 max-w-[520px] text-[15px] leading-7 text-[#6B7280]">
            Create projects, organize assets, collaborate with your team,
            and keep every design workflow in one intelligent workspace.
          </p>

          {/* ACTIONS */}
          <div className="mt-8 flex flex-wrap items-center gap-3">

            {/* CREATE PROJECT BUTTON */}
            <button
              onClick={handleCreateProject}
              disabled={creating}
              className="
                flex
                h-14
                items-center
                justify-center
                rounded-2xl
                bg-[#6C5DD3]
                px-8
                text-sm
                font-semibold
                text-white
                transition-all
                duration-300
                hover:-translate-y-0.5
                hover:bg-[#5A4BCE]
                hover:shadow-[0_16px_35px_rgba(108,93,211,0.22)]
                disabled:opacity-70
              "
            >
              {creating ? "Creating..." : "Create Project"}
            </button>

            {/* EXPLORE WORKSPACE */}
            <a
              href="/workspace"
              className="
                flex
                h-14
                items-center
                rounded-2xl
                border border-[#E8E9EF]
                bg-white/80
                px-8
                text-sm
                font-medium
                text-[#111827]
                backdrop-blur-sm
                transition-all
                duration-200
                hover:border-[#DDD8F8]
                hover:bg-white
              "
            >
              Explore Workspace
            </a>

          </div>
        </div>
      </div>
    </section>
  );
}