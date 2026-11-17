"use client";

import {
  MousePointer2,
  Frame,
  Type,
  Square,
  Circle,
  Minus,
  PenTool,
  Image as ImageIcon,
  Component,
  LayoutTemplate,
  Shapes,
  Palette,
  Blend,
} from "lucide-react";

import { useEditorStore } from "@/store/useEditorStore";
import { Tool } from "@/types/editor";

const tools: {
  id: Tool;
  label: string;
  icon: React.ElementType;
}[] = [
  {
    id: "select",
    label: "Select",
    icon: MousePointer2,
  },
  {
    id: "frame",
    label: "Frame",
    icon: Frame,
  },
  {
    id: "text",
    label: "Text",
    icon: Type,
  },
  {
    id: "rectangle",
    label: "Rectangle",
    icon: Square,
  },
  {
    id: "circle",
    label: "Circle",
    icon: Circle,
  },
  {
    id: "line",
    label: "Line",
    icon: Minus,
  },
  {
    id: "image",
    label: "Image",
    icon: ImageIcon,
  },
];

const assets = [
  {
    label: "Templates",
    icon: LayoutTemplate,
  },
  {
    label: "Components",
    icon: Component,
  },
  {
    label: "Images",
    icon: ImageIcon,
  },
  {
    label: "Icons",
    icon: Shapes,
  },
  {
    label: "Illustrations",
    icon: PenTool,
  },
];

const styles = [
  {
    label: "Colors",
    icon: Palette,
  },
  {
    label: "Typography",
    icon: Type,
  },
  {
    label: "Gradients",
    icon: Blend,
  },
];

export default function LeftSidebar() {
  const {
    activeTool,
    setActiveTool,
  } = useEditorStore();

  return (
    <aside className="workspace-scroll h-full w-[240px] shrink-0 border-r border-[#E8E8ED] bg-white px-4 py-5">

      {/* Tools */}
      <section>

        <p className="mb-3 px-2 text-[10px] font-bold uppercase tracking-[0.15em] text-[#9CA3AF]">
          Tools
        </p>

        <div className="space-y-1">

          {tools.map((tool) => {
            const Icon = tool.icon;

            const active =
              activeTool === tool.id;

            return (
              <button
                key={tool.id}
                onClick={() =>
                  setActiveTool(tool.id)
                }
                className={`group flex h-10 w-full items-center gap-3 rounded-xl px-3 text-left text-sm transition-all duration-200 ${
                  active
                    ? "bg-[#F1EDFF] font-semibold text-[#6C5DD3]"
                    : "text-[#4B5563] hover:bg-[#F8F8FA] hover:text-[#111827]"
                }`}
              >
                <Icon
                  size={18}
                  strokeWidth={
                    active ? 2 : 1.7
                  }
                  className={`shrink-0 ${
                    active
                      ? "text-[#6C5DD3]"
                      : "text-[#6B7280] group-hover:text-[#111827]"
                  }`}
                />

                <span>
                  {tool.label}
                </span>

                {active && (
                  <span className="ml-auto h-1.5 w-1.5 rounded-full bg-[#6C5DD3]" />
                )}

              </button>
            );
          })}

        </div>

      </section>

      {/* Assets */}
      <section className="mt-6 border-t border-[#EEEEF2] pt-5">

        <p className="mb-3 px-2 text-[10px] font-bold uppercase tracking-[0.15em] text-[#9CA3AF]">
          Assets
        </p>

        <div className="space-y-1">

          {assets.map((item) => {
            const Icon = item.icon;

            return (
              <button
                key={item.label}
                className="group flex h-10 w-full items-center gap-3 rounded-xl px-3 text-left text-sm text-[#4B5563] transition hover:bg-[#F8F8FA] hover:text-[#111827]"
              >
                <Icon
                  size={18}
                  strokeWidth={1.7}
                  className="shrink-0 text-[#7C6BE8] transition group-hover:text-[#6C5DD3]"
                />

                <span>
                  {item.label}
                </span>

              </button>
            );
          })}

        </div>

      </section>

      {/* Styles */}
      <section className="mt-6 border-t border-[#EEEEF2] pt-5">

        <p className="mb-3 px-2 text-[10px] font-bold uppercase tracking-[0.15em] text-[#9CA3AF]">
          Styles
        </p>

        <div className="space-y-1">

          {styles.map((item) => {
            const Icon = item.icon;

            return (
              <button
                key={item.label}
                className="group flex h-10 w-full items-center gap-3 rounded-xl px-3 text-left text-sm text-[#4B5563] transition hover:bg-[#F8F8FA] hover:text-[#111827]"
              >
                <Icon
                  size={18}
                  strokeWidth={1.7}
                  className="shrink-0 text-[#7C6BE8] transition group-hover:text-[#6C5DD3]"
                />

                <span>
                  {item.label}
                </span>

              </button>
            );
          })}

        </div>

      </section>

    </aside>
  );
}