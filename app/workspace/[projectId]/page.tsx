"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";

import {
  ChevronDown,
  Undo2,
  Redo2,
  Minus,
  Plus,
  Share2,
  Download,
  MousePointer2,
  Frame,
  Type,
  Square,
  Circle,
  Minus as LineIcon,
  PenTool,
  Image as ImageIcon,
  LayoutTemplate,
  Component,
  Shapes,
  Palette,
  Layers3,
  Settings,
  CircleHelp,
  Grid2X2,
  Loader2,
  Upload,
  AlignLeft,
  AlignCenter,
  AlignRight,
} from "lucide-react";

import { supabase } from "@/lib/supabase";
import Canvas from "@/components/workspace/Canvas";
import { useEditorStore } from "@/store/useEditorStore";

type Project = {
  id: string;
  name: string;
  description: string | null;
  created_at: string;
  updated_at: string;
};

type WorkspaceTab = "design" | "assets" | "styles" | "layers";

export default function ProjectWorkspacePage() {
  const params = useParams();
  const projectId = params.projectId as string;

  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [userInitial, setUserInitial] = useState("U");
  const [projectName, setProjectName] = useState("");
  const [savingName, setSavingName] = useState(false);

  const [workspaceTab, setWorkspaceTab] =
    useState<WorkspaceTab>("design");

  const {
    activeTool,
    setActiveTool,
    zoom,
    setZoom,
  } = useEditorStore();

  useEffect(() => {
    if (!projectId) return;

    const loadProject = async () => {
      setLoading(true);
      setError("");

      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user) {
        setError("You need to sign in first.");
        setLoading(false);
        return;
      }

      const fullName =
        user.user_metadata?.full_name ||
        user.user_metadata?.name ||
        user.email?.split("@")[0] ||
        "User";

      const firstName = fullName.trim().split(" ")[0];

      setUserInitial(
        firstName.charAt(0).toUpperCase()
      );

      const { data, error: projectError } =
        await supabase
          .from("projects")
          .select(
            "id, name, description, created_at, updated_at"
          )
          .eq("id", projectId)
          .eq("user_id", user.id)
          .single();

      if (projectError) {
        console.error(
          "Load project error:",
          projectError
        );

        setError("Project not found.");
        setLoading(false);
        return;
      }

      setProject(data);
      setProjectName(data.name);
      setLoading(false);
    };

    loadProject();
  }, [projectId]);

  const saveProjectName = async () => {
    if (!project) return;

    const trimmedName = projectName.trim();

    if (!trimmedName) {
      setProjectName(project.name);
      return;
    }

    if (trimmedName === project.name) return;

    setSavingName(true);

    const { error } = await supabase
      .from("projects")
      .update({
        name: trimmedName,
      })
      .eq("id", project.id);

    if (error) {
      console.error(
        "Update project name error:",
        error
      );

      setProjectName(project.name);
      setSavingName(false);
      return;
    }

    setProject((prev) =>
      prev
        ? {
            ...prev,
            name: trimmedName,
          }
        : prev
    );

    window.dispatchEvent(
      new Event("designhub:projects-changed")
    );

    setSavingName(false);
  };

  const tools = [
    {
      id: "select",
      label: "Select",
      shortcut: "V",
      icon: MousePointer2,
    },
    {
      id: "frame",
      label: "Frame",
      shortcut: "F",
      icon: Frame,
    },
    {
      id: "text",
      label: "Text",
      shortcut: "T",
      icon: Type,
    },
    {
      id: "rectangle",
      label: "Rectangle",
      shortcut: "R",
      icon: Square,
    },
    {
      id: "circle",
      label: "Circle",
      shortcut: "O",
      icon: Circle,
    },
    {
      id: "line",
      label: "Line",
      shortcut: "L",
      icon: LineIcon,
    },
    {
      id: "pen",
      label: "Pen",
      shortcut: "P",
      icon: PenTool,
    },
    {
      id: "image",
      label: "Image",
      shortcut: "I",
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
  ];

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#F7F8FC]">
        <div className="flex items-center gap-3 text-sm text-[#6B7280]">
          <Loader2
            size={18}
            className="animate-spin text-[#6C5DD3]"
          />
          Loading project...
        </div>
      </main>
    );
  }

  if (error || !project) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#F7F8FC]">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-[#111827]">
            Project not found
          </h1>

          <p className="mt-2 text-sm text-[#6B7280]">
            This project doesn&apos;t exist or
            you don&apos;t have access to it.
          </p>

          <Link
            href="/dashboard"
            className="mt-5 inline-flex h-11 items-center rounded-xl bg-[#6C5DD3] px-5 text-sm font-semibold text-white"
          >
            Back to Dashboard
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="flex h-screen flex-col overflow-hidden bg-[#F6F7FA]">

      {/* TOPBAR */}
      <header className="flex h-[72px] shrink-0 items-center border-b border-[#E8E9EF] bg-white">

        {/* LOGO */}
        <div className="flex h-full w-[90px] shrink-0 items-center justify-center border-r border-[#ECECF1]">
          <Link href="/dashboard">
            <img
              src="/images/favicon.svg"
              alt="DesignHub"
              className="h-8 w-8"
            />
          </Link>
        </div>

        {/* PROJECT */}
        <div className="flex min-w-[330px] items-center gap-2 px-6">
          <Link
            href="/dashboard/projects"
            className="text-[13px] font-medium text-[#7A8190] transition hover:text-[#111827]"
          >
            My Projects
          </Link>

          <span className="text-[#C1C5CF]">
            /
          </span>

          <input
            value={projectName}
            onChange={(e) =>
              setProjectName(e.target.value)
            }
            onBlur={saveProjectName}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.currentTarget.blur();
              }
            }}
            className="max-w-[190px] rounded-lg bg-transparent px-1 py-1 text-[13px] font-semibold text-[#111827] outline-none hover:bg-[#F7F7FA] focus:bg-[#F7F7FA]"
          />

          <ChevronDown
            size={14}
            className="text-[#8A91A1]"
          />

          <span className="ml-1 text-[10px] text-[#8A91A1]">
            {savingName
              ? "Saving..."
              : "Saved"}
          </span>
        </div>

        {/* CENTER TOOLS */}
        <div className="flex flex-1 items-center justify-center">
          <div className="flex items-center gap-1 rounded-2xl bg-[#F8F8FB] p-1.5">
            {tools.slice(0, 6).map((tool) => {
              const Icon = tool.icon;
              const active =
                activeTool === tool.id;

              return (
                <button
                  key={tool.id}
                  type="button"
                  title={tool.label}
                  onClick={() =>
                    setActiveTool(tool.id as any)
                  }
                  className={`flex h-9 w-9 items-center justify-center rounded-xl transition ${
                    active
                      ? "bg-[#EEE9FF] text-[#6C5DD3]"
                      : "text-[#4B5563] hover:bg-white hover:text-[#111827]"
                  }`}
                >
                  <Icon
                    size={17}
                    strokeWidth={1.8}
                  />
                </button>
              );
            })}

            <div className="mx-1 h-5 w-px bg-[#E3E4E9]" />

            <button
              className="flex h-9 w-9 items-center justify-center rounded-xl text-[#9CA3AF] hover:bg-white"
            >
              <Undo2 size={16} />
            </button>

            <button
              className="flex h-9 w-9 items-center justify-center rounded-xl text-[#9CA3AF] hover:bg-white"
            >
              <Redo2 size={16} />
            </button>
          </div>
        </div>

        {/* RIGHT */}
        <div className="flex h-full items-center gap-3 px-5">
          <div className="flex h-10 items-center rounded-xl border border-[#E5E7EB] bg-white">
            <button
              type="button"
              onClick={() =>
                setZoom(
                  Math.max(
                    0.25,
                    zoom - 0.1
                  )
                )
              }
              className="flex h-full w-9 items-center justify-center text-[#4B5563]"
            >
              <Minus size={15} />
            </button>

            <span className="min-w-[55px] text-center text-xs font-semibold text-[#111827]">
              {Math.round(zoom * 100)}%
            </span>

            <button
              type="button"
              onClick={() =>
                setZoom(
                  Math.min(
                    4,
                    zoom + 0.1
                  )
                )
              }
              className="flex h-full w-9 items-center justify-center text-[#4B5563]"
            >
              <Plus size={15} />
            </button>
          </div>

          <button className="flex h-10 items-center gap-2 rounded-xl border border-[#DDDDE5] px-4 text-sm font-semibold text-[#374151]">
            <Download size={15} />
            Export
          </button>

          <button className="flex h-10 items-center gap-2 rounded-xl bg-[#6C5DD3] px-4 text-sm font-semibold text-white transition hover:bg-[#5B4DC9]">
            <Share2 size={15} />
            Share
          </button>

          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#6C5DD3] text-xs font-semibold text-white">
            {userInitial}
          </div>
        </div>
      </header>

      {/* WORKSPACE */}
      <div className="flex min-h-0 flex-1">

        {/* SMALL RAIL */}
        <aside className="flex w-[90px] shrink-0 flex-col justify-between border-r border-[#ECECF1] bg-white py-4">

          <div className="space-y-1 px-2">
            <RailButton
              active={workspaceTab === "design"}
              icon={Grid2X2}
              label="Design"
              onClick={() =>
                setWorkspaceTab("design")
              }
            />

            <RailButton
              active={workspaceTab === "assets"}
              icon={ImageIcon}
              label="Assets"
              onClick={() =>
                setWorkspaceTab("assets")
              }
            />

            <RailButton
              active={workspaceTab === "styles"}
              icon={Palette}
              label="Styles"
              onClick={() =>
                setWorkspaceTab("styles")
              }
            />

            <RailButton
              active={workspaceTab === "layers"}
              icon={Layers3}
              label="Layers"
              onClick={() =>
                setWorkspaceTab("layers")
              }
            />
          </div>

          <div className="space-y-2 px-2">
            <RailButton
              icon={CircleHelp}
              label="Help"
            />

            <RailButton
              icon={Settings}
              label="Settings"
            />
          </div>
        </aside>

        {/* LEFT PANEL */}
        <aside className="hide-scrollbar w-[245px] shrink-0 overflow-y-auto border-r border-[#E7E8ED] bg-white">

          {workspaceTab === "design" && (
            <>
              <div className="px-5 pb-5 pt-6">
                <p className="mb-4 text-[10px] font-bold uppercase tracking-[0.16em] text-[#A0A5B1]">
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
                        type="button"
                        onClick={() =>
                          setActiveTool(
                            tool.id as any
                          )
                        }
                        className={`flex h-10 w-full items-center rounded-xl px-3 text-sm transition ${
                          active
                            ? "bg-[#F0ECFF] font-semibold text-[#6C5DD3]"
                            : "text-[#374151] hover:bg-[#F7F7FA]"
                        }`}
                      >
                        <Icon
                          size={17}
                          className="mr-3"
                        />

                        <span>
                          {tool.label}
                        </span>

                        <span className="ml-auto rounded-md bg-[#F4F4F7] px-1.5 py-0.5 text-[10px] text-[#8B91A0]">
                          {tool.shortcut}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="border-t border-[#EEEEF2] px-5 py-5">
                <p className="mb-4 text-[10px] font-bold uppercase tracking-[0.16em] text-[#A0A5B1]">
                  Assets
                </p>

                <div className="space-y-1">
                  {assets.map((item) => {
                    const Icon = item.icon;

                    return (
                      <button
                        key={item.label}
                        className="flex h-10 w-full items-center rounded-xl px-3 text-sm text-[#374151] transition hover:bg-[#F7F7FA]"
                      >
                        <Icon
                          size={17}
                          className="mr-3 text-[#6C5DD3]"
                        />

                        {item.label}
                      </button>
                    );
                  })}
                </div>
              </div>
            </>
          )}

          {workspaceTab === "assets" && (
            <PanelPlaceholder
              title="Assets"
              text="Templates, images and uploaded files will appear here."
              icon={ImageIcon}
            />
          )}

          {workspaceTab === "styles" && (
            <PanelPlaceholder
              title="Styles"
              text="Colors, typography and reusable styles will appear here."
              icon={Palette}
            />
          )}

          {workspaceTab === "layers" && (
            <PanelPlaceholder
              title="Layers"
              text="Your canvas layers will appear here."
              icon={Layers3}
            />
          )}
        </aside>

        {/* CANVAS */}
        <Canvas />

        {/* RIGHT PANEL */}
        <aside className="hide-scrollbar w-[285px] shrink-0 overflow-y-auto border-l border-[#E7E8ED] bg-white">

          <div className="flex h-[54px] items-end gap-7 border-b border-[#ECECF1] px-5">
            <button className="h-full border-b-2 border-[#6C5DD3] pt-1 text-xs font-semibold text-[#6C5DD3]">
              Design
            </button>

            <button className="h-full pt-1 text-xs font-medium text-[#8B91A0]">
              Prototype
            </button>
          </div>

          {/* POSITION */}
          <InspectorSection title="Position">
            <div className="mb-4 flex gap-2">
              <InspectorIcon
                icon={AlignLeft}
              />
              <InspectorIcon
                icon={AlignCenter}
              />
              <InspectorIcon
                icon={AlignRight}
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <InputBox label="X" value="0" />
              <InputBox label="Y" value="0" />

              <InputBox
                label="W"
                value="1080"
              />

              <InputBox
                label="H"
                value="720"
              />
            </div>
          </InspectorSection>

          {/* LAYER */}
          <InspectorSection title="Layer">
            <div className="flex items-center justify-between text-xs text-[#5F6675]">
              <span>Opacity</span>

              <span className="font-medium text-[#111827]">
                100%
              </span>
            </div>

            <div className="mt-3 h-1.5 rounded-full bg-[#EEEEF3]">
              <div className="h-full w-full rounded-full bg-[#6C5DD3]" />
            </div>
          </InspectorSection>

          {/* FILL */}
          <InspectorSection
            title="Fill"
            action="+"
          >
            <div className="flex h-10 items-center gap-2 rounded-xl border border-[#E6E7EC] px-3">
              <div className="h-5 w-5 rounded-md border border-[#D8DAE2] bg-[#EEE9FE]" />

              <span className="text-xs font-medium text-[#374151]">
                #EEE9FE
              </span>

              <span className="ml-auto text-xs text-[#8B91A0]">
                100%
              </span>
            </div>
          </InspectorSection>

          {/* STROKE */}
          <InspectorSection
            title="Stroke"
            action="+"
          >
            <div className="flex h-10 items-center gap-2 rounded-xl border border-[#E6E7EC] px-3">
              <div className="h-5 w-5 rounded-md bg-[#6C5DD3]" />

              <span className="text-xs font-medium text-[#374151]">
                #6C5DD3
              </span>

              <span className="ml-auto text-xs text-[#8B91A0]">
                1 px
              </span>
            </div>
          </InspectorSection>

          <InspectorSection
            title="Effects"
            action="+"
          />

          <InspectorSection
            title="Export"
            action="+"
          />
        </aside>
      </div>
    </main>
  );
}

function RailButton({
  icon: Icon,
  label,
  active = false,
  onClick,
}: {
  icon: any;
  label: string;
  active?: boolean;
  onClick?: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex w-full flex-col items-center justify-center gap-1 rounded-xl py-3 text-[10px] transition ${
        active
          ? "bg-[#F0ECFF] font-semibold text-[#6C5DD3]"
          : "text-[#697081] hover:bg-[#F7F7FA]"
      }`}
    >
      <Icon size={18} strokeWidth={1.7} />
      <span>{label}</span>
    </button>
  );
}

function PanelPlaceholder({
  icon: Icon,
  title,
  text,
}: {
  icon: any;
  title: string;
  text: string;
}) {
  return (
    <div className="px-5 py-6">
      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#F0ECFF] text-[#6C5DD3]">
        <Icon size={19} />
      </div>

      <h3 className="mt-4 text-sm font-semibold text-[#111827]">
        {title}
      </h3>

      <p className="mt-2 text-xs leading-5 text-[#8B91A0]">
        {text}
      </p>
    </div>
  );
}

function InspectorSection({
  title,
  action,
  children,
}: {
  title: string;
  action?: string;
  children?: React.ReactNode;
}) {
  return (
    <section className="border-b border-[#ECECF1] px-5 py-5">
      <div className="flex items-center justify-between">
        <h3 className="text-xs font-semibold text-[#111827]">
          {title}
        </h3>

        {action && (
          <button className="text-lg font-light text-[#7D8492]">
            {action}
          </button>
        )}
      </div>

      {children && (
        <div className="mt-4">{children}</div>
      )}
    </section>
  );
}

function InspectorIcon({
  icon: Icon,
}: {
  icon: any;
}) {
  return (
    <button className="flex h-8 w-8 items-center justify-center rounded-lg text-[#5F6675] transition hover:bg-[#F5F5F8]">
      <Icon size={15} />
    </button>
  );
}

function InputBox({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="flex h-9 items-center rounded-lg bg-[#F8F8FA] px-3">
      <span className="mr-3 text-[10px] font-medium text-[#A1A6B1]">
        {label}
      </span>

      <span className="text-xs font-medium text-[#374151]">
        {value}
      </span>
    </div>
  );
}