"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Search, Bell, CircleHelp } from "lucide-react";
import { supabase } from "@/lib/supabase";

export default function Topbar() {
  const [userName, setUserName] = useState("User");
  const [userInitial, setUserInitial] = useState("U");
  const [isFirstVisit, setIsFirstVisit] = useState(false);

  useEffect(() => {
    const loadUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) return;

      const fullName =
        user.user_metadata?.full_name ||
        user.user_metadata?.name ||
        user.email?.split("@")[0] ||
        "User";

      const firstName = fullName.trim().split(" ")[0];

      setUserName(firstName);
      setUserInitial(firstName.charAt(0).toUpperCase());

      const visitKey = `designhub_dashboard_visited_${user.id}`;
      const hasVisited = localStorage.getItem(visitKey);

      if (!hasVisited) {
        setIsFirstVisit(true);
        localStorage.setItem(visitKey, "true");
      } else {
        setIsFirstVisit(false);
      }
    };

    loadUser();
  }, []);

  return (
    <header className="flex h-[100px] w-full items-center justify-between border-b border-[#E8E9EF] bg-white px-8">

      {/* GREETING */}
      <div>
        <h1 className="text-[26px] font-bold tracking-[-0.8px] text-[#111827]">
          {isFirstVisit
            ? `Hello, ${userName}!`
            : `Welcome back, ${userName}!`}
        </h1>

        <p className="mt-1 text-sm text-[#6B7280]">
          {isFirstVisit
            ? "Your creative workspace is ready. Let’s make something amazing."
            : "Pick up where you left off or start something new."}
        </p>
      </div>

      {/* RIGHT */}
      <div className="flex items-center gap-3">

        {/* SEARCH */}
        <div className="relative hidden xl:block">
          <Search
            size={17}
            className="absolute left-4 top-1/2 -translate-y-1/2 text-[#9CA3AF]"
          />

          <input
            type="text"
            placeholder="Search anything..."
            className="
              h-11
              w-[300px]
              rounded-xl
              border
              border-[#E5E7EB]
              bg-white
              pl-11
              pr-14
              text-sm
              text-[#111827]
              outline-none
              transition
              placeholder:text-[#9CA3AF]
              focus:border-[#6C5DD3]
              focus:ring-4
              focus:ring-[#6C5DD3]/5
            "
          />

          <div className="absolute right-3 top-1/2 flex -translate-y-1/2 items-center gap-0.5 rounded-md border border-[#E5E7EB] bg-[#F9FAFB] px-1.5 py-0.5 text-[10px] text-[#6B7280]">
            ⌘ K
          </div>
        </div>

        {/* BELL */}
        <button
          type="button"
          className="flex h-11 w-11 items-center justify-center rounded-xl border border-[#E5E7EB] bg-white text-[#374151] transition hover:bg-[#F8F7FC]"
        >
          <Bell size={18} />
        </button>

        {/* HELP */}
        <button
          type="button"
          className="flex h-11 w-11 items-center justify-center rounded-xl border border-[#E5E7EB] bg-white text-[#374151] transition hover:bg-[#F8F7FC]"
        >
          <CircleHelp size={18} />
        </button>

        {/* AVATAR */}
        <Link
          href="/dashboard/profile"
          className="flex h-11 w-11 items-center justify-center rounded-full bg-[#6C5DD3] text-sm font-semibold text-white transition hover:bg-[#5B4BCC]"
        >
          {userInitial}
        </Link>

      </div>
    </header>
  );
}