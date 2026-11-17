"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import {
  LayoutDashboard,
  FolderKanban,
  Lightbulb,
  Image,
  LayoutTemplate,
  Palette,
  Component,
  Users,
  Plug,
  Activity,
  Trash2,
  Settings,
  ChevronDown,
} from "lucide-react";

import { supabase } from "@/lib/supabase";

export default function Sidebar() {
  const pathname = usePathname();

  const [userName, setUserName] = useState("User");
  const [userInitial, setUserInitial] = useState("U");

  useEffect(() => {
    const loadUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) return;

      const name =
        user.user_metadata?.full_name ||
        user.user_metadata?.name ||
        user.email?.split("@")[0] ||
        "User";

      setUserName(name);
      setUserInitial(name.charAt(0).toUpperCase());
    };

    loadUser();
  }, []);

  const mainNavigation = [
    {
      name: "Dashboard",
      href: "/dashboard",
      icon: LayoutDashboard,
    },
    {
      name: "Projects",
      href: "/dashboard/projects",
      icon: FolderKanban,
    },
    {
      name: "Inspiration",
      href: "/dashboard/inspiration",
      icon: Lightbulb,
    },
    {
      name: "Assets",
      href: "/dashboard/assets",
      icon: Image,
    },
    {
      name: "Templates",
      href: "/dashboard/templates",
      icon: LayoutTemplate,
      badge: "Soon",
    },
    {
      name: "Brand Kits",
      href: "/dashboard/brand-kits",
      icon: Palette,
    },
    {
      name: "Components",
      href: "/dashboard/components",
      icon: Component,
    },
    {
      name: "Team",
      href: "/dashboard/team",
      icon: Users,
    },
  ];

  const secondaryNavigation = [
    {
      name: "Integrations",
      href: "/dashboard/integrations",
      icon: Plug,
    },
    {
      name: "Activity",
      href: "/dashboard/activity",
      icon: Activity,
    },
    {
      name: "Trash",
      href: "/dashboard/trash",
      icon: Trash2,
    },
  ];

  const isActive = (href: string) => {
    if (href === "/dashboard") {
      return pathname === "/dashboard";
    }

    return pathname.startsWith(href);
  };

  return (
    <aside className="fixed left-0 top-0 z-50 flex h-screen w-[230px] flex-col border-r border-[#ECECF2] bg-white">
      {/* LOGO */}
      <div className="mb-4 flex h-[72px] shrink-0 items-center px-4">
        <Link href="/dashboard" className="flex items-center">
          <img
            src="/logos/logo.svg"
            alt="DesignHub"
            className="h-7 w-auto object-contain"
          />
        </Link>
      </div>

      {/* NAVIGATION */}
      <div className="hide-scrollbar flex-1 overflow-y-auto px-4">
        {/* MAIN NAVIGATION */}
        <nav className="space-y-1">
          {mainNavigation.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.href);

            return (
              <Link
                key={item.name}
                href={item.href}
                className={`
                  group flex h-[44px] items-center gap-3
                  rounded-xl px-3
                  text-[14px] font-medium
                  transition-all duration-200
                  ${
                    active
                      ? "bg-[#F2EEFF] text-[#6C5DD3]"
                      : "text-[#596174] hover:bg-[#F8F7FC] hover:text-[#111827]"
                  }
                `}
              >
                <Icon
                  size={18}
                  strokeWidth={1.8}
                  className={
                    active
                      ? "text-[#6C5DD3]"
                      : "text-[#697386] transition group-hover:text-[#111827]"
                  }
                />

                <span>{item.name}</span>

                {"badge" in item && item.badge && (
                  <span
                    className={`
                      ml-auto rounded-md px-2 py-0.5
                      text-[9px] font-semibold uppercase tracking-[0.04em]
                      ${
                        active
                          ? "bg-white/70 text-[#6C5DD3]"
                          : "bg-[#F3F1FB] text-[#8A7ED8]"
                      }
                    `}
                  >
                    {item.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* DIVIDER */}
        <div className="my-5 h-px bg-[#EEEEF3]" />

        {/* SECONDARY NAVIGATION */}
        <nav className="space-y-1">
          {secondaryNavigation.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.href);

            return (
              <Link
                key={item.name}
                href={item.href}
                className={`
                  group flex h-[44px] items-center gap-3
                  rounded-xl px-3
                  text-[14px] font-medium
                  transition-all duration-200
                  ${
                    active
                      ? "bg-[#F2EEFF] text-[#6C5DD3]"
                      : "text-[#596174] hover:bg-[#F8F7FC] hover:text-[#111827]"
                  }
                `}
              >
                <Icon
                  size={18}
                  strokeWidth={1.8}
                  className={
                    active
                      ? "text-[#6C5DD3]"
                      : "text-[#697386] transition group-hover:text-[#111827]"
                  }
                />

                <span>{item.name}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      {/* BOTTOM */}
      <div className="shrink-0 border-t border-[#EEEEF3] bg-white px-4 py-4">
        {/* USER */}
        <button
          type="button"
          className="flex w-full items-center justify-between rounded-xl p-2 transition hover:bg-[#F8F7FC]"
        >
          <div className="flex min-w-0 items-center gap-3">
            {/* USER INITIAL */}
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#6C5DD3] text-sm font-semibold text-white">
              {userInitial}
            </div>

            {/* USER INFO */}
            <div className="min-w-0 text-left">
              <p className="truncate text-[13px] font-semibold text-[#111827]">
                {userName}
              </p>

              <p className="mt-0.5 text-[11px] text-[#8A91A1]">Free Plan</p>
            </div>
          </div>

          <ChevronDown
            size={16}
            strokeWidth={1.8}
            className="shrink-0 text-[#697386]"
          />
        </button>

        {/* DIVIDER */}
        <div className="my-3 h-px bg-[#EEEEF3]" />

        {/* SETTINGS */}
        <Link
          href="/dashboard/settings"
          className={`
            flex h-[42px] items-center gap-3 rounded-xl px-3
            text-[14px] font-medium transition-all duration-200
            ${
              isActive("/dashboard/settings")
                ? "bg-[#F2EEFF] text-[#6C5DD3]"
                : "text-[#596174] hover:bg-[#F8F7FC] hover:text-[#111827]"
            }
          `}
        >
          <Settings
            size={18}
            strokeWidth={1.8}
            className={
              isActive("/dashboard/settings")
                ? "text-[#6C5DD3]"
                : "text-[#697386]"
            }
          />
          Settings
        </Link>
      </div>
    </aside>
  );
}