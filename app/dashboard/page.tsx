import Hero from "@/components/dashboard/Hero";
import OverviewCards from "@/components/dashboard/OverviewCard";
import QuickActions from "@/components/dashboard/QuickActions";
import Projects from "@/components/dashboard/Projects";
import ContinueWorking from "@/components/dashboard/ContinueWorking";
import ConnectedTools from "@/components/dashboard/ConnectedTools";
import RecentAssets from "@/components/dashboard/RecentAssets";
import ActivityFeed from "@/components/dashboard/ActivityFeed";

export default function DashboardPage() {
  return (
    <div className="min-h-full bg-[#F7F8FC] px-6 pb-6 pt-4">
      <div className="space-y-4">

        {/* HERO */}
        <Hero />

        {/* OVERVIEW CARDS */}
        <OverviewCards />

        {/* QUICK ACCESS */}
        <QuickActions />

        {/* PROJECTS + CONTINUE WORKING + CONNECTED TOOLS */}
        <div className="grid grid-cols-1 items-stretch gap-4 xl:grid-cols-12">

          {/* PROJECTS */}
          <div className="flex min-w-0 xl:col-span-4">
            <div className="w-full">
              <Projects />
            </div>
          </div>

          {/* CONTINUE WORKING */}
          <div className="flex min-w-0 xl:col-span-4">
            <div className="w-full">
              <ContinueWorking />
            </div>
          </div>

          {/* CONNECTED TOOLS */}
          <div className="flex min-w-0 xl:col-span-4">
            <div className="w-full">
              <ConnectedTools />
            </div>
          </div>

        </div>

        {/* RECENT ASSETS + ACTIVITY FEED */}
<div className="grid grid-cols-1 items-stretch gap-4 xl:grid-cols-2">
  <div className="min-w-0">
    <RecentAssets />
  </div>

  <div className="min-w-0">
    <ActivityFeed />
  </div>
</div>

      </div>
    </div>
  );
}