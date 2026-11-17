import Sidebar from "@/components/dashboard/Sidebar";
import Topbar from "@/components/dashboard/Topbar";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="h-screen overflow-hidden bg-[#F7F8FC]">

      {/* SIDEBAR */}
      <Sidebar />

      {/* TOPBAR */}
      <div className="fixed left-[230px] right-0 top-0 z-30">
        <Topbar />
      </div>

      {/* CONTENT */}
      <main
        className="
          hide-scrollbar
          ml-[230px]
          h-screen
          overflow-y-auto
          bg-[#F7F8FC]
          pt-[100px]
        "
      >
        {children}
      </main>

    </div>
  );
}