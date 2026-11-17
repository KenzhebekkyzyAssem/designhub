"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Check,
  ChevronRight,
  Search,
  Sparkles,
  X,
} from "lucide-react";

import { supabase } from "@/lib/supabase";

type Status = "available" | "connected" | "soon";

type ConnectedAccount = {
  provider: string;
  provider_account_id: string | null;
  provider_account_name: string | null;
  provider_account_email: string | null;
  provider_account_avatar: string | null;
  connected_at: string | null;
};

type Integration = {
  id: string;
  name: string;
  description: string;
  category: string;
  status: Status;
  logo: string;
  account?: ConnectedAccount;
};

const integrations: Integration[] = [
  {
    id: "figma",
    name: "Figma",
    description:
      "Import your files, preview designs and keep everything in sync.",
    category: "Design",
    status: "available",
    logo: "figma",
  },
  {
    id: "slack",
    name: "Slack",
    description:
      "Get updates, notifications and share work with your team.",
    category: "Communication",
    status: "available",
    logo: "slack",
  },
  {
    id: "github",
    name: "GitHub",
    description:
      "Connect repositories and track development together.",
    category: "Development",
    status: "available",
    logo: "github",
  },
  {
    id: "drive",
    name: "Google Drive",
    description:
      "Access your files and assets from Google Drive.",
    category: "Storage",
    status: "available",
    logo: "drive",
  },
  {
    id: "dropbox",
    name: "Dropbox",
    description:
      "Organize and use your assets from Dropbox.",
    category: "Storage",
    status: "available",
    logo: "dropbox",
  },
  {
    id: "notion",
    name: "Notion",
    description:
      "Bring your docs, wikis and knowledge into DesignHub.",
    category: "Productivity",
    status: "available",
    logo: "notion",
  },
  {
    id: "linear",
    name: "Linear",
    description:
      "Sync issues and project progress in real time.",
    category: "Development",
    status: "soon",
    logo: "linear",
  },
  {
    id: "miro",
    name: "Miro",
    description:
      "Collaborate on boards and bring ideas to life.",
    category: "Design",
    status: "soon",
    logo: "miro",
  },
  {
    id: "onedrive",
    name: "OneDrive",
    description:
      "Store and access your files from OneDrive.",
    category: "Storage",
    status: "soon",
    logo: "onedrive",
  },
];

const categories = [
  "All",
  "Design",
  "Development",
  "Communication",
  "Storage",
];

export default function IntegrationsPage() {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");

  const [connectedAccounts, setConnectedAccounts] =
  useState<ConnectedAccount[]>([]);
  const [integrationsLoading, setIntegrationsLoading] = useState(true);

  const [selectedId, setSelectedId] = useState<string | null>("slack");
  const [requestOpen, setRequestOpen] = useState(false);

  const [toolName, setToolName] = useState("");
  const [reason, setReason] = useState("");

  const [oauthNotice, setOauthNotice] = useState<{
  type: "success" | "error";
  text: string;
} | null>(null);

  useEffect(() => {
    let mounted = true;

    const loadIntegrations = async () => {
      setIntegrationsLoading(true);

      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (!mounted) return;

      if (userError) {
        console.error("Failed to load current user:", userError);
        setConnectedAccounts([]);
        setIntegrationsLoading(false);
        return;
      }

      if (!user) {
        setConnectedAccounts([]);
        setIntegrationsLoading(false);
        return;
      }

      const { data, error } = await supabase
  .from("user_integrations")
  .select(`
    provider,
    provider_account_id,
    provider_account_name,
    provider_account_email,
    provider_account_avatar,
    connected_at
  `)
  .eq("user_id", user.id)
  .eq("status", "connected");

      if (!mounted) return;

      if (error) {
        console.error("Failed to load integrations:", error);
        setConnectedAccounts([]);
        setIntegrationsLoading(false);
        return;
      }

      setConnectedAccounts(data ?? []);

      setIntegrationsLoading(false);
    };

    loadIntegrations();

    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
  const params = new URLSearchParams(
    window.location.search
  );

  if (params.get("integration") !== "figma") {
    return;
  }

  const status = params.get("status");

  setSelectedId("figma");

  if (status === "success") {
    setOauthNotice({
      type: "success",
      text: "Figma has been connected successfully.",
    });
  }

  if (status === "error") {
    setOauthNotice({
      type: "error",
      text: "Failed to connect Figma. Please try again.",
    });
  }

  const url = new URL(window.location.href);

  url.searchParams.delete("integration");
  url.searchParams.delete("status");
  url.searchParams.delete("message");

  window.history.replaceState(null, "", url.toString());
}, []);

  const integrationsWithStatus = useMemo<Integration[]>(() => {
  return integrations.map((integration) => {
    if (integration.status === "soon") {
      return integration;
    }

    const account = connectedAccounts.find(
      (item) => item.provider === integration.id
    );

    return {
      ...integration,
      status: account ? "connected" : "available",
      account,
    };
  });
}, [connectedAccounts]);

  const selected = useMemo(
    () =>
      integrationsWithStatus.find(
        (integration) => integration.id === selectedId
      ) ?? null,
    [integrationsWithStatus, selectedId]
  );

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();

    return integrationsWithStatus.filter((item) => {
      const matchesSearch =
        !query ||
        item.name.toLowerCase().includes(query) ||
        item.description.toLowerCase().includes(query);

      const matchesCategory =
        category === "All" || item.category === category;

      return matchesSearch && matchesCategory;
    });
  }, [search, category, integrationsWithStatus]);

  return (
    <main className="min-h-screen bg-[#FAFAFB]">
      <div className="mx-auto max-w-[1400px] px-8 py-10">
        <div className="flex items-start gap-8">
          {/* MAIN CONTENT */}
          <section className="min-w-0 flex-1">
            {/* HEADER */}
            <div className="flex items-start justify-between">
              <div>
                <h1 className="text-[30px] font-bold tracking-tight text-[#171923]">
                  Integrations
                </h1>

                <p className="mt-1.5 text-[13px] text-[#818897]">
                  Connect DesignHub with the tools you already use and keep
                  your workflow in one place.
                </p>
              </div>

              <button
                onClick={() => setRequestOpen(true)}
                className="flex h-10 items-center gap-2 rounded-xl border border-[#E2E4E9] bg-white px-4 text-[12px] font-semibold text-[#303542] shadow-sm transition hover:bg-[#FAFAFB]"
              >
                <span className="flex h-5 w-5 items-center justify-center rounded-full border border-[#747B89] text-[12px] leading-none">
                  +
                </span>
                Request integration
              </button>
            </div>

            {oauthNotice && (
  <div
    role="status"
    className={`mt-5 flex items-center justify-between
      rounded-xl border px-4 py-3 text-[13px]
      ${
        oauthNotice.type === "success"
          ? "border-[#CBEAD8] bg-[#EAF8F0] text-[#2F9863]"
          : "border-red-200 bg-red-50 text-red-600"
      }`}
  >
    <span>{oauthNotice.text}</span>

    <button
      onClick={() => setOauthNotice(null)}
      aria-label="Close notification"
    >
      <X size={16} />
    </button>
  </div>
)}
            <div className="mt-8 flex items-center justify-between gap-4">
              <div className="relative w-[320px] shrink-0">
                <Search
                  size={16}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-[#A5ABB6]"
                />

                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search integrations..."
                  className="h-11 w-full rounded-xl border border-[#E4E6EB] bg-white pl-11 pr-4 text-[13px] text-[#313642] outline-none transition placeholder:text-[#A5ABB7] focus:border-[#BFB4FF] focus:ring-4 focus:ring-[#F4F1FF]"
                />
              </div>

              <div className="flex flex-wrap items-center justify-end gap-2">
                {categories.map((item) => {
                  const active = category === item;

                  return (
                    <button
                      key={item}
                      onClick={() => setCategory(item)}
                      className={`h-10 rounded-full border px-4 text-[12px] font-medium transition ${
                        active
                          ? "border-[#C9BEFF] bg-[#F2EFFF] text-[#6547EF]"
                          : "border-[#E4E6EA] bg-white text-[#717989] hover:bg-[#F9F9FA]"
                      }`}
                    >
                      {item}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* GRID */}
            {integrationsLoading ? (
              <div className="mt-6 flex min-h-[300px] items-center justify-center rounded-[20px] border border-[#E6E8ED] bg-white">
                <div className="h-6 w-6 animate-spin rounded-full border-2 border-[#E8E4FF] border-t-[#6547EF]" />
              </div>
            ) : filtered.length > 0 ? (
              <div className="mt-6 grid grid-cols-3 gap-4">
                {filtered.map((integration) => (
                  <IntegrationCard
                    key={integration.id}
                    integration={integration}
                    selected={selectedId === integration.id}
                    onOpen={() => {
                      setSelectedId(integration.id);
                      setRequestOpen(false);
                    }}
                  />
                ))}
              </div>
            ) : (
              <div className="mt-6 flex min-h-[300px] flex-col items-center justify-center rounded-[20px] border border-dashed border-[#E2E4E9] bg-white">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#F3F0FF] text-[#6547EF]">
                  <Search size={20} />
                </div>

                <p className="mt-4 text-[14px] font-semibold text-[#292D36]">
                  No integrations found
                </p>

                <p className="mt-1 text-[12px] text-[#979DA9]">
                  Try another search or category.
                </p>
              </div>
            )}

            {/* REQUEST CTA */}
            <div className="mt-6 flex items-center justify-between rounded-[20px] border border-[#E8E3FF] bg-gradient-to-r from-[#FCFBFF] to-[#F8F5FF] px-6 py-5 shadow-sm">
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-[#ECE7FF] bg-white text-[#6547EF] shadow-sm">
                  <Sparkles size={20} />
                </div>

                <div>
                  <p className="text-[14px] font-semibold text-[#272B35]">
                    Missing a tool?
                  </p>

                  <p className="mt-0.5 text-[12px] text-[#8C93A1]">
                    Tell us which integration would make your workflow even
                    better.
                  </p>
                </div>
              </div>

              <button
                onClick={() => setRequestOpen(true)}
                className="h-10 rounded-xl bg-[#6547EF] px-5 text-[12px] font-semibold text-white shadow-md transition hover:bg-[#5C3FE4]"
              >
                Request integration
              </button>
            </div>
          </section>

          {/* RIGHT PANEL */}
          <aside className="sticky top-8 w-[340px] shrink-0">
            {requestOpen ? (
              <RequestIntegration
                toolName={toolName}
                setToolName={setToolName}
                reason={reason}
                setReason={setReason}
                onClose={() => setRequestOpen(false)}
              />
            ) : selected ? (
              <IntegrationDetails
                integration={selected}
                onClose={() => setSelectedId(null)}
              />
            ) : null}
          </aside>
        </div>
      </div>
    </main>
  );
}

function IntegrationCard({
  integration,
  selected,
  onOpen,
}: {
  integration: Integration;
  selected: boolean;
  onOpen: () => void;
}) {
  return (
    <button
      onClick={onOpen}
      className={`group flex min-h-[185px] flex-col rounded-[20px] border bg-white p-5 text-left transition-all duration-200 ${
        selected
          ? "border-[#6547EF] ring-2 ring-[#6547EF]/10 shadow-[0_8px_25px_rgba(101,71,239,0.08)]"
          : "border-[#E6E8ED] hover:-translate-y-1 hover:border-[#D8D5E8] hover:shadow-[0_10px_25px_rgba(31,33,45,0.05)]"
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <IntegrationLogo integration={integration} />
        <StatusBadge status={integration.status} />
      </div>

      <div className="mt-4">
        <h3 className="text-[14px] font-semibold text-[#21252E]">
          {integration.name}
        </h3>

        <p className="mt-1.5 line-clamp-2 text-[11px] leading-[17px] text-[#7E8695]">
          {integration.description}
        </p>
      </div>

      <div className="mt-auto flex items-center justify-between pt-4">
        <CardAction integration={integration} />

        <ChevronRight
          size={16}
          className="text-[#A0A6B1] transition group-hover:translate-x-0.5 group-hover:text-[#6547EF]"
        />
      </div>
    </button>
  );
}

function CardAction({ integration }: { integration: Integration }) {
  if (integration.status === "connected") {
    return (
      <div className="flex items-center gap-1.5 text-[11px] font-medium text-[#32A068]">
        <Check size={13} strokeWidth={2.6} />
        Connected
      </div>
    );
  }

  return (
    <span className="rounded-lg border border-[#DDD7FF] bg-[#F9F7FF] px-3.5 py-1.5 text-[10px] font-medium text-[#6547EF]">
      {integration.status === "soon" ? "Notify me" : "Connect"}
    </span>
  );
}

function StatusBadge({ status }: { status: Status }) {
  if (status === "connected") {
    return (
      <span className="flex items-center gap-1.5 rounded-full bg-[#EAF8F0] px-3 py-1 text-[10px] font-semibold text-[#2F9863]">
        <span className="h-1.5 w-1.5 rounded-full bg-[#42B77B]" />
        Connected
      </span>
    );
  }

  if (status === "soon") {
    return (
      <span className="rounded-full bg-[#F2F3F5] px-3 py-1 text-[10px] font-medium text-[#858C98]">
        Coming soon
      </span>
    );
  }

  return (
    <span className="rounded-full bg-[#F1EEFF] px-3 py-1 text-[10px] font-medium text-[#6547EF]">
      Available
    </span>
  );
}

function IntegrationDetails({
  integration,
  onClose,
}: {
  integration: Integration;
  onClose: () => void;
}) {
  const [connecting, setConnecting] = useState(false);

const [connectionError, setConnectionError] =
  useState("");

async function connectFigma() {
  try {
    setConnecting(true);
    setConnectionError("");

    const {
      data: { session },
      error: sessionError,
    } = await supabase.auth.getSession();

    if (sessionError || !session) {
      throw new Error(
        "Please log in to DesignHub first."
      );
    }

    const response = await fetch(
      "/api/integrations/figma/connect",
      {
        method: "POST",

        headers: {
          Authorization:
            `Bearer ${session.access_token}`,
        },
      }
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(
        data.error || "Failed to connect Figma."
      );
    }

    if (!data.authorizationUrl) {
      throw new Error(
        "Authorization URL is missing."
      );
    }

    window.location.assign(data.authorizationUrl);

  } catch (error) {
    setConnectionError(
      error instanceof Error
        ? error.message
        : "Something went wrong."
    );

    setConnecting(false);
  }
}
  return (
    <div className="rounded-[20px] border border-[#E5E7EC] bg-white p-6 shadow-[0_14px_38px_rgba(25,27,35,0.06)]">
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 items-center gap-3.5">
          <IntegrationLogo integration={integration} large />

          <div className="min-w-0">
            <h2 className="truncate text-[16px] font-semibold tracking-tight text-[#1D212A]">
              {integration.name}
            </h2>
            <div className="mt-1">
              <StatusBadge status={integration.status} />
            </div>
          </div>
        </div>

        <button
          onClick={onClose}
          className="shrink-0 rounded-lg p-1.5 text-[#9298A5] transition hover:bg-[#F5F5F7]"
        >
          <X size={18} />
        </button>
      </div>

      <p className="mt-5 text-[12px] leading-[18px] text-[#737B8A]">
        {integration.description}
      </p>

      {integration.status === "available" && (
        <>
          <div className="mt-6">
            <p className="text-[12px] font-semibold text-[#252934]">
              What you can do
            </p>

            <div className="mt-3.5 space-y-3">
              <Permission text={`Connect your ${integration.name} account`} />
              <Permission text="Bring your work into DesignHub" />
              <Permission text="Keep your workspace organized" />
            </div>
          </div>

          {connectionError && integration.id === "figma" && (
  <div className="mt-4 rounded-xl border border-red-100 bg-red-50 p-3 text-[12px] text-red-600">
    {connectionError}
  </div>
)}

<button
  onClick={
    integration.id === "figma"
      ? connectFigma
      : undefined
  }
  disabled={connecting || integration.id !== "figma"}
  className="mt-7 h-11 w-full rounded-xl bg-[#6547EF] text-[12px] font-semibold text-white shadow-md transition hover:bg-[#5B3FDE] disabled:cursor-not-allowed disabled:opacity-60"
>
  {connecting
    ? "Connecting..."
    : `Connect ${integration.name}`}
</button>
        </>
      )}

      {integration.status === "connected" && (
        <>
          <div className="mt-6">
            <p className="text-[12px] font-semibold text-[#252934]">
              Connected account
            </p>

            <div className="mt-3 flex items-center justify-between rounded-xl border border-[#ECECF1] bg-[#FCFCFD] p-3">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#6547EF] text-[12px] font-semibold text-white">
                  A
                </div>

                <div>
                  <p className="text-[12px] font-medium text-[#292E38]">
                    DesignHub account
                  </p>
                  <p className="text-[10px] text-[#9BA1AD]">Connected</p>
                </div>
              </div>

              <span className="text-[#979DA8]">•••</span>
            </div>
          </div>

          <div className="mt-5">
            <p className="text-[12px] font-semibold text-[#252934]">
              Permissions
            </p>

            <div className="mt-3.5 space-y-3">
              <Permission text="Read files you choose to import" />
              <Permission text="Read comments and file metadata" />
              <Permission text="Access team and project information" />
            </div>
          </div>

          <button className="mt-7 h-11 w-full rounded-xl border border-[#FFA4A4] text-[12px] font-semibold text-[#F04444] transition hover:bg-[#FFF7F7]">
            Disconnect
          </button>
        </>
      )}

      {integration.status === "soon" && (
        <div className="mt-6 rounded-xl border border-[#ECE8FF] bg-[#F9F7FF] p-4">
          <p className="text-[12px] font-medium text-[#4E456F]">
            This integration is coming soon.
          </p>

          <p className="mt-1 text-[11px] leading-4 text-[#9189A8]">
            Get notified when it becomes available.
          </p>

          <button className="mt-4 rounded-lg border border-[#D8D1FF] bg-white px-4 py-2 text-[11px] font-semibold text-[#6547EF] shadow-sm">
            Notify me
          </button>
        </div>
      )}
    </div>
  );
}

function Permission({ text }: { text: string }) {
  return (
    <div className="flex items-center gap-2.5 text-[11px] leading-4 text-[#687180]">
      <div className="flex h-[18px] w-[18px] shrink-0 items-center justify-center rounded-full bg-[#EEE9FF] text-[#6547EF]">
        <Check size={10} strokeWidth={3} />
      </div>
      {text}
    </div>
  );
}

function RequestIntegration({
  toolName,
  setToolName,
  reason,
  setReason,
  onClose,
}: {
  toolName: string;
  setToolName: (value: string) => void;
  reason: string;
  setReason: (value: string) => void;
  onClose: () => void;
}) {
  return (
    <div className="rounded-[20px] border border-[#E5E7EC] bg-white p-6 shadow-[0_14px_38px_rgba(25,27,35,0.06)]">
      <div className="flex items-center justify-between">
        <h2 className="text-[16px] font-semibold text-[#1E222C]">
          Request integration
        </h2>

        <button
          onClick={onClose}
          className="rounded-lg p-1.5 text-[#8E95A3] hover:bg-[#F5F5F7]"
        >
          <X size={18} />
        </button>
      </div>

      <div className="mt-5">
        <label className="text-[11px] font-medium text-[#343945]">
          Tool name
        </label>

        <input
          value={toolName}
          onChange={(e) => setToolName(e.target.value)}
          placeholder="e.g. Trello"
          className="mt-2 h-11 w-full rounded-xl border border-[#E4E6EB] px-3.5 text-[12px] outline-none placeholder:text-[#A8AEBA] focus:border-[#BDB1FF] focus:ring-4 focus:ring-[#F3F0FF]"
        />
      </div>

      <div className="mt-4">
        <div className="flex items-center justify-between">
          <label className="text-[11px] font-medium text-[#343945]">
            Why would you use it?
          </label>

          <span className="text-[10px] text-[#A2A8B4]">
            {reason.length}/500
          </span>
        </div>

        <textarea
          value={reason}
          maxLength={500}
          onChange={(e) => setReason(e.target.value)}
          placeholder="Describe how this tool would help your workflow..."
          className="mt-2 h-[120px] w-full resize-none rounded-xl border border-[#E4E6EB] p-3.5 text-[12px] leading-5 outline-none placeholder:text-[#A8AEBA] focus:border-[#BDB1FF] focus:ring-4 focus:ring-[#F3F0FF]"
        />
      </div>

      <div className="mt-6 flex justify-end gap-2.5">
        <button
          onClick={onClose}
          className="h-10 rounded-xl border border-[#E4E6EB] px-4 text-[11px] font-medium text-[#68707F] transition hover:bg-[#F9F9FA]"
        >
          Cancel
        </button>

        <button
          disabled={!toolName.trim()}
          className="h-10 rounded-xl bg-[#6547EF] px-5 text-[11px] font-semibold text-white shadow-md disabled:cursor-not-allowed disabled:opacity-40"
        >
          Send request
        </button>
      </div>
    </div>
  );
}

/* =========================================================
   BRAND LOGOS — PERFECTED SVG SIZES & CENTERING
   ========================================================= */

function IntegrationLogo({
  integration,
  large = false,
}: {
  integration: Integration;
  large?: boolean;
}) {
  const wrap = large
    ? "flex h-11 w-11 shrink-0 items-center justify-center"
    : "flex h-9 w-9 shrink-0 items-center justify-center";

  const normal = large ? "h-10 w-10" : "h-8 w-8";

  /* FIGMA */
  if (integration.logo === "figma") {
    return (
      <div className={wrap}>
        <svg
          className={large ? "h-10 w-7" : "h-8 w-[22px]"}
          viewBox="0 0 38 57"
          fill="none"
          aria-hidden="true"
        >
          <path d="M19 28.5C19 23.806 22.806 20 27.5 20C32.194 20 36 23.806 36 28.5C36 33.194 32.194 37 27.5 37C22.806 37 19 33.194 19 28.5Z" fill="#1ABCFE" />
          <path d="M2 47.5C2 42.806 5.806 39 10.5 39H19V47.5C19 52.194 15.194 56 10.5 56C5.806 56 2 52.194 2 47.5Z" fill="#0ACF83" />
          <path d="M2 28.5C2 23.806 5.806 20 10.5 20H19V37H10.5C5.806 37 2 33.194 2 28.5Z" fill="#A259FF" />
          <path d="M2 10.5C2 5.806 5.806 2 10.5 2H19V19H10.5C5.806 19 2 15.194 2 10.5Z" fill="#F24E1E" />
          <path d="M19 2H27.5C32.194 2 36 5.806 36 10.5C36 15.194 32.194 19 27.5 19H19V2Z" fill="#FF7262" />
        </svg>
      </div>
    );
  }

  /* SLACK */
  if (integration.logo === "slack") {
    return (
      <div className={wrap}>
        <svg className={normal} viewBox="0 0 127 127" fill="none" aria-hidden="true">
          <path d="M27.2 80.1c0 7.5-6.1 13.6-13.6 13.6S0 87.6 0 80.1s6.1-13.6 13.6-13.6h13.6v13.6Z" fill="#E01E5A" />
          <path d="M34 80.1c0-7.5 6.1-13.6 13.6-13.6s13.6 6.1 13.6 13.6v34c0 7.5-6.1 13.6-13.6 13.6S34 121.6 34 114.1v-34Z" fill="#E01E5A" />
          <path d="M47.6 27.2C40.1 27.2 34 21.1 34 13.6S40.1 0 47.6 0s13.6 6.1 13.6 13.6v13.6H47.6Z" fill="#36C5F0" />
          <path d="M47.6 34c7.5 0 13.6 6.1 13.6 13.6s-6.1 13.6-13.6 13.6h-34C6.1 61.2 0 55.1 0 47.6S6.1 34 13.6 34h34Z" fill="#36C5F0" />
          <path d="M99.8 47.6c0-7.5 6.1-13.6 13.6-13.6S127 40.1 127 47.6s-6.1 13.6-13.6 13.6H99.8V47.6Z" fill="#2EB67D" />
          <path d="M93 47.6c0 7.5-6.1 13.6-13.6 13.6s-13.6-6.1-13.6-13.6v-34C65.8 6.1 71.9 0 79.4 0S93 6.1 93 13.6v34Z" fill="#2EB67D" />
          <path d="M79.4 99.8c7.5 0 13.6 6.1 13.6 13.6S86.9 127 79.4 127s-13.6-6.1-13.6-13.6V99.8h13.6Z" fill="#ECB22E" />
          <path d="M79.4 93c-7.5 0-13.6-6.1-13.6-13.6s6.1-13.6 13.6-13.6h34c7.5 0 13.6 6.1 13.6 13.6S120.9 93 113.4 93h-34Z" fill="#ECB22E" />
        </svg>
      </div>
    );
  }

  /* GITHUB */
  if (integration.logo === "github") {
    return (
      <div className={wrap}>
        <svg viewBox="0 0 24 24" className={`${normal} fill-black`} aria-hidden="true">
          <path d="M12 .7C5.7.7.6 5.8.6 12.1c0 5 3.3 9.3 7.8 10.8.6.1.8-.3.8-.6v-2.3c-3.2.7-3.9-1.4-3.9-1.4-.5-1.3-1.3-1.7-1.3-1.7-1-.7.1-.7.1-.7 1.2.1 1.8 1.2 1.8 1.2 1 1.8 2.7 1.3 3.4 1 .1-.8.4-1.3.7-1.6-2.6-.3-5.3-1.3-5.3-5.7 0-1.3.5-2.3 1.2-3.1-.1-.3-.5-1.5.1-3.1 0 0 1-.3 3.2 1.2a11 11 0 0 1 5.8 0c2.2-1.5 3.2-1.2 3.2-1.2.6 1.6.2 2.8.1 3.1.8.8 1.2 1.8 1.2 3.1 0 4.4-2.7 5.4-5.3 5.7.4.4.8 1.1.8 2.1v3.1c0 .4.2.7.8.6a11.5 11.5 0 0 0 7.8-10.8C23.4 5.8 18.3.7 12 .7Z" />
        </svg>
      </div>
    );
  }

  /* GOOGLE DRIVE */
  if (integration.logo === "drive") {
    return (
      <div className={wrap}>
        <svg
          className={large ? "h-9 w-10" : "h-7 w-8"}
          viewBox="0 0 256 229"
          fill="none"
          aria-hidden="true"
        >
          <path d="M87.4 0h81.2L256 151.3h-81.2L87.4 0Z" fill="#FFBA00" />
          <path d="M87.4 0 0 151.3l40.6 70.3L128 70.3 87.4 0Z" fill="#00AC47" />
          <path d="M40.6 221.6h174.8l40.6-70.3H81.2l-40.6 70.3Z" fill="#2684FC" />
          <path d="M0 151.3 40.6 221.6 81.2 151.3H0Z" fill="#0066DA" />
          <path d="M174.8 151.3h81.2l-40.6 70.3-40.6-70.3Z" fill="#EA4335" />
          <path d="M87.4 0 128 70.3l40.6-70.3H87.4Z" fill="#00832D" />
        </svg>
      </div>
    );
  }

  /* DROPBOX */
/* =========================
   DROPBOX
   ========================= */

if (integration.logo === "dropbox") {
  return (
    <div className={`${wrap} flex shrink-0 items-center justify-center`}>
      <svg
        viewBox="-35.3175 -50 306.085 300"
        className={large ? "h-[38px] w-[46px]" : "h-[30px] w-[37px]"}
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        <path
          d="M58.86 75l58.87-37.5L58.86 0 0 37.5z"
          fill="#0061FF"
        />

        <path
          d="M176.59 75l58.86-37.5L176.59 0l-58.86 37.5z"
          fill="#0061FF"
        />

        <path
          d="M117.73 112.5L58.86 75 0 112.5 58.86 150z"
          fill="#0061FF"
        />

        <path
          d="M176.59 150l58.86-37.5L176.59 75l-58.86 37.5z"
          fill="#0061FF"
        />

        <path
          d="M176.59 162.5L117.73 125l-58.87 37.5 58.87 37.5z"
          fill="#0061FF"
        />
      </svg>
    </div>
  );
}


if (integration.logo === "notion") {
  return (
    <div className={`${wrap} flex shrink-0 items-center justify-center`}>
      <svg
        viewBox="0 0 100 100"
        className={large ? "h-[38px] w-[38px]" : "h-[31px] w-[31px]"}
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        <path
          d="M6.017 4.313l55.333 -4.087c6.797 -0.583 8.543 -0.19 12.817 2.917l17.663 12.443c2.913 2.14 3.883 2.723 3.883 5.053v68.243c0 4.277 -1.553 6.807 -6.99 7.193L24.467 99.967c-4.08 0.193 -6.023 -0.39 -8.16 -3.113L3.3 79.94c-2.333 -3.113 -3.3 -5.443 -3.3 -8.167V11.113c0 -3.497 1.553 -6.413 6.017 -6.8z"
          fill="#fff"
        />

        <path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M61.35 0.227l-55.333 4.087C1.553 4.7 0 7.617 0 11.113v60.66c0 2.723 0.967 5.053 3.3 8.167l13.007 16.913c2.137 2.723 4.08 3.307 8.16 3.113l64.257 -3.89c5.433 -0.387 6.99 -2.917 6.99 -7.193V20.64c0 -2.21 -0.873 -2.847 -3.443 -4.733L74.167 3.143c-4.273 -3.107 -6.02 -3.5 -12.817 -2.917zM25.92 19.523c-5.247 0.353 -6.437 0.433 -9.417 -1.99L8.927 11.507c-0.77 -0.78 -0.383 -1.753 1.557 -1.947l53.193 -3.887c4.467 -0.39 6.793 1.167 8.54 2.527l9.123 6.61c0.39 0.197 1.36 1.36 0.193 1.36l-54.933 3.307 -0.68 0.047zM19.803 88.3V30.367c0 -2.53 0.777 -3.697 3.103 -3.893L86 22.78c2.14 -0.193 3.107 1.167 3.107 3.693v57.547c0 2.53 -0.39 4.67 -3.883 4.863l-60.377 3.5c-3.493 0.193 -5.043 -0.97 -5.043 -4.083zm59.6 -54.827c0.387 1.75 0 3.5 -1.75 3.7l-2.91 0.577v42.773c-2.527 1.36 -4.853 2.137 -6.797 2.137 -3.107 0 -3.883 -0.973 -6.21 -3.887l-19.03 -29.94v28.967l6.02 1.363s0 3.5 -4.857 3.5l-13.39 0.777c-0.39 -0.78 0 -2.723 1.357 -3.11l3.497 -0.97v-38.3L30.48 40.667c-0.39 -1.75 0.58 -4.277 3.3 -4.473l14.367 -0.967 19.8 30.327v-26.83l-5.047 -0.58c-0.39 -2.143 1.163 -3.7 3.103 -3.89l13.4 -0.78z"
          fill="#000"
        />
      </svg>
    </div>
  );
}
  /* LINEAR */
if (integration.logo === "linear") {
  return (
    <div className={wrap}>
      <svg
        className={large ? "h-10 w-10" : "h-8 w-8"}
        viewBox="0 0 702 689"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        <path
          d="M495.79 532.418C475.337 537.372 453.976 540 432 540C282.883 540 162 419.117 162 270C162 247.675 164.709 225.982 169.817 205.233L495.79 532.418ZM575.226 498.922C563.762 506.109 551.72 512.456 539.186 517.884L184.514 161.894C189.987 149.381 196.38 137.362 203.61 125.925L575.226 498.922ZM432 0C581.117 0 702 120.883 702 270C702 351.616 665.787 424.773 608.553 474.282L228.374 92.6904C277.872 35.8937 350.744 0 432 0Z"
          fill="black"
        />

        <path
          d="M538.002 689L567.047 660.063L432.547 525.063L298.047 390.063L230.797 322.563L163.547 255.063L29.0469 120.062L0.00175852 149L269.002 419L392.542 543L538.002 689Z"
          fill="white"
        />
      </svg>
    </div>
  );
}
  /* MIRO */
if (integration.logo === "miro") {
  return (
    <div className={`${wrap} flex shrink-0 items-center justify-center`}>
      <svg
        viewBox="0 0 100 100"
        className={large ? "h-[40px] w-[40px]" : "h-[32px] w-[32px]"}
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        {/* Miro yellow background */}
        <path
          d="M21.6632 -0.000366211H78.3368C90.293 -0.000366211 100 9.70665 100 21.6628V78.3364C100 90.2926 90.293 99.9996 78.3368 99.9996H21.6632C9.70702 99.9996 0 90.2926 0 78.3364V21.6628C0 9.70665 9.70702 -0.000366211 21.6632 -0.000366211Z"
          fill="#FFD02F"
        />

        {/* Original Miro mark */}
        <path
          d="M69.488 12.4886H58.5084L67.6531 28.5584L47.5288 12.4886H36.5492L46.6114 32.1393L25.5697 12.4886H14.5901L25.5697 37.496L14.5901 87.5107H25.5697L46.6114 33.915L36.5492 87.5107H47.5288L67.6531 30.3637L58.5084 87.5107H69.488L89.6123 24.9775L69.488 12.4886Z"
          fill="#050038"
        />
      </svg>
    </div>
  );
}
  /* ONEDRIVE */
if (integration.logo === "onedrive") {
  return (
    <div className={`${wrap} flex shrink-0 items-center justify-center`}>
      <svg
        viewBox="-1.1321 4.7266 34.0569 21.467"
        className={large ? "h-[34px] w-[48px]" : "h-[28px] w-[40px]"}
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        {/* Dark blue */}
        <path
          d="M12.202 11.193v-.001l6.718 4.024 4.003-1.685A6.477 6.477 0 0 1 25.5 13c.148 0 .294.007.439.016a10 10 0 0 0-18.041-3.013L8 10a7.96 7.96 0 0 1 4.202 1.193z"
          fill="#0364B8"
        />

        {/* Blue */}
        <path
          d="M12.203 11.192A7.96 7.96 0 0 0 8 10l-.102.003a7.997 7.997 0 0 0-6.46 12.57L7.36 20.08l2.634-1.108 5.863-2.468 3.062-1.288z"
          fill="#0078D4"
        />

        {/* Light blue */}
        <path
          d="M25.939 13.016A6.577 6.577 0 0 0 25.5 13a6.477 6.477 0 0 0-2.576.532l-4.004 1.684 1.161.695 3.805 2.279 1.66.994 5.677 3.4a6.5 6.5 0 0 0-5.284-9.568z"
          fill="#1490DF"
        />

        {/* Front cloud */}
        <path
          d="M25.546 19.184l-1.66-.994-3.805-2.28-1.16-.694-3.063 1.288-5.863 2.468L7.36 20.08l-5.924 2.493A7.989 7.989 0 0 0 8 26h17.5a6.498 6.498 0 0 0 5.723-3.416z"
          fill="#28A8EA"
        />
      </svg>
    </div>
  );
}

  return null;
}
