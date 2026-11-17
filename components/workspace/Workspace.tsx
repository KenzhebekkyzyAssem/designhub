"use client";

import WorkspaceHeader from "@/components/workspace/WorkspaceHeader";
import LeftSidebar from "@/components/workspace/LeftSidebar";
import Canvas from "@/components/workspace/Canvas";
import RightPanel from "@/components/workspace/RightPanel";

export default function Workspace() {
  return (
    <main className="flex h-screen min-h-[700px] flex-col overflow-hidden bg-[#F7F8FA] text-[#111827]">

      {/* Topbar */}
      <WorkspaceHeader />

      {/* Editor */}
      <div className="flex min-h-0 flex-1 overflow-hidden">

        {/* Left tools */}
        <LeftSidebar />

        {/* Canvas */}
        <Canvas />

        {/* Properties */}
        <RightPanel />

      </div>

    </main>
  );
}