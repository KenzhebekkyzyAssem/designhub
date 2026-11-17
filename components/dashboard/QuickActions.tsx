"use client";

import Link from "next/link";
import {
  Lightbulb,
  ImageIcon,
  Shapes,
  Type,
  Palette,
  LayoutTemplate,
  Component,
} from "lucide-react";

const quickItems = [
  {
    title: "Inspiration",
    description: "Moodboards & references",
    href: "/dashboard/inspiration",
    icon: Lightbulb,
  },
  {
    title: "Images",
    description: "Beautiful photos",
    href: "/dashboard/assets",
    icon: ImageIcon,
  },
  {
    title: "Icons",
    description: "Find the perfect icons",
    href: "/dashboard/assets",
    icon: Shapes,
  },
  {
    title: "Fonts",
    description: "Discover typography",
    href: "/dashboard/assets",
    icon: Type,
  },
  {
    title: "Colors",
    description: "Create color palettes",
    href: "/dashboard/assets",
    icon: Palette,
  },
  {
    title: "Templates",
    description: "Ready to use designs",
    href: "/dashboard/templates",
    icon: LayoutTemplate,
  },
  {
    title: "Components",
    description: "Reusable design elements",
    href: "/dashboard/components",
    icon: Component,
  },
];

export default function QuickAccess() {
  return (
    <section className="rounded-[18px] border border-[#E8E9EF] bg-white p-5">
      {/* HEADER */}
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-[16px] font-semibold text-[#111827]">
            Quick Access
          </h2>

          <p className="mt-1 text-[12px] text-[#6B7280]">
            Jump into your most used tools and resources
          </p>
        </div>
      </div>

      {/* ITEMS */}
      <div className="mt-4 grid grid-cols-2 gap-3 md:grid-cols-4 xl:grid-cols-7">
        {quickItems.map((item) => {
          const Icon = item.icon;

          return (
            <Link
              key={item.title}
              href={item.href}
              className="
                group
                flex min-h-[92px]
                items-start gap-3
                rounded-[14px]
                border border-[#E9EAF0]
                bg-white
                p-3
                transition-all duration-200
                hover:border-[#DDD8F8]
                hover:bg-[#FCFBFF]
                hover:shadow-[0_8px_24px_rgba(108,93,211,0.05)]
              "
            >
              {/* ICON */}
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#F1EDFF]">
                <Icon
                  size={18}
                  strokeWidth={1.8}
                  className="text-[#6C5DD3]"
                />
              </div>

              {/* TEXT */}
              <div className="min-w-0">
                <h3 className="text-[12px] font-semibold text-[#111827]">
                  {item.title}
                </h3>

                <p className="mt-1 text-[10px] leading-[15px] text-[#6B7280]">
                  {item.description}
                </p>
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}