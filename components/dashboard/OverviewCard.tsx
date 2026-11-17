"use client";

import { useEffect, useState } from "react";
import {
  FolderKanban,
  Layers3,
  ImageIcon,
  Users,
} from "lucide-react";

import { supabase } from "@/lib/supabase";

export default function OverviewCards() {
  const [projectCount, setProjectCount] = useState(0);
  const [loading, setLoading] = useState(true);

  const loadProjectCount = async () => {
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      setLoading(false);
      return;
    }

    const { count, error } = await supabase
      .from("projects")
      .select("*", {
        count: "exact",
        head: true,
      })
      .eq("user_id", user.id);

    if (error) {
      console.error("Project count error:", error);
      setLoading(false);
      return;
    }

    setProjectCount(count ?? 0);
    setLoading(false);
  };

  useEffect(() => {
    loadProjectCount();

    const handleProjectsChanged = () => {
      loadProjectCount();
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

  const overviewItems = [
    {
      title: "Projects",
      value: loading ? "--" : projectCount,
      description:
        projectCount === 0
          ? "Create your first project"
          : `${projectCount} saved project${
              projectCount === 1 ? "" : "s"
            }`,
      icon: FolderKanban,
    },
    {
      title: "Designs",
      value: 0,
      description: "Start designing now",
      icon: Layers3,
    },
    {
      title: "Assets",
      value: 0,
      description: "Upload or import assets",
      icon: ImageIcon,
    },
    {
      title: "Team Members",
      value: 0,
      description: "Invite your team",
      icon: Users,
    },
  ];

  return (
    <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {overviewItems.map((item) => {
        const Icon = item.icon;

        return (
          <div
            key={item.title}
            className="
              flex
              min-h-[106px]
              items-center
              rounded-[16px]
              border border-[#E8E9EF]
              bg-white
              px-5
              py-4
              transition-all
              duration-200
              hover:border-[#DDD8F8]
            "
          >
            {/* ICON */}
            <div className="flex h-[52px] w-[52px] shrink-0 items-center justify-center rounded-[14px] bg-[#F1EDFF]">
              <Icon
                size={25}
                strokeWidth={1.8}
                className="text-[#6C5DD3]"
              />
            </div>

            {/* CONTENT */}
            <div className="ml-4 min-w-0">
              <p className="text-[25px] font-bold leading-none tracking-[-0.6px] text-[#111827]">
                {item.value}
              </p>

              <h3 className="mt-1 text-[13px] font-medium text-[#374151]">
                {item.title}
              </h3>

              <p className="mt-1 truncate text-[11px] text-[#6B7280]">
                {item.description}
              </p>
            </div>
          </div>
        );
      })}
    </section>
  );
}