"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { supabase } from "@/lib/supabase";
import {
  Check,
  ChevronDown,
  Copy,
  Mail,
  MoreHorizontal,
  Search,
  Trash2,
  UserPlus,
  Users,
  X,
} from "lucide-react";

type TeamRole = "Admin" | "Editor" | "Viewer";
type TeamStatus = "Active" | "Pending";

type TeamMember = {
  id: string;
  source: "member" | "invitation";
  name: string;
  email: string;
  role: TeamRole;
  status: TeamStatus;
  created_at: string;
  token?: string;
};

type TeamMemberRow = {
  id: string;
  name: string | null;
  email: string;
  role: TeamRole;
  created_at: string;
};

type InvitationRow = {
  id: string;
  email: string;
  role: TeamRole;
  status: "Pending" | "Accepted" | "Cancelled";
  created_at: string;
  token: string;
};

const roles: TeamRole[] = ["Admin", "Editor", "Viewer"];

export default function TeamPage() {
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  const [inviteOpen, setInviteOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<TeamRole>("Editor");
  const [roleOpen, setRoleOpen] = useState(false);
  const [inviting, setInviting] = useState(false);

  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadTeam();
  }, []);

  useEffect(() => {
    function handleMouseDown(event: MouseEvent) {
      if (
        activeMenuId &&
        menuRef.current &&
        !menuRef.current.contains(event.target as Node)
      ) {
        setActiveMenuId(null);
      }
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key !== "Escape") return;

      setActiveMenuId(null);
      setRoleOpen(false);

      if (!inviting) {
        setInviteOpen(false);
      }
    }

    document.addEventListener("mousedown", handleMouseDown);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("mousedown", handleMouseDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [activeMenuId, inviting]);

  async function loadTeam() {
    try {
      setLoading(true);

      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user) {
        setMembers([]);
        return;
      }

      const [membersResult, invitationsResult] = await Promise.all([
        supabase
          .from("team_members")
          .select("id, name, email, role, created_at")
          .eq("owner_id", user.id)
          .order("created_at", { ascending: false }),

        supabase
          .from("team_invitations")
          .select("id, email, role, status, token, created_at")
          .eq("owner_id", user.id)
          .eq("status", "Pending")
          .order("created_at", { ascending: false }),
      ]);

      if (membersResult.error) {
        console.error("Load team members error:", membersResult.error);
      }

      if (invitationsResult.error) {
        console.error(
          "Load team invitations error:",
          invitationsResult.error
        );
      }

      const activeMembers: TeamMember[] = (
        (membersResult.data ?? []) as TeamMemberRow[]
      ).map((item) => ({
        id: item.id,
        source: "member",
        name: item.name?.trim() || item.email.split("@")[0],
        email: item.email,
        role: item.role,
        status: "Active",
        created_at: item.created_at,
      }));

      const pendingMembers: TeamMember[] = (
        (invitationsResult.data ?? []) as InvitationRow[]
      ).map((item) => ({
        id: item.id,
        source: "invitation",
        name: item.email.split("@")[0],
        email: item.email,
        role: item.role,
        status: "Pending",
        created_at: item.created_at,
        token: item.token,
      }));

      setMembers([...pendingMembers, ...activeMembers]);
    } finally {
      setLoading(false);
    }
  }

  const filteredMembers = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    if (!query) return members;

    return members.filter(
      (member) =>
        member.name.toLowerCase().includes(query) ||
        member.email.toLowerCase().includes(query) ||
        member.role.toLowerCase().includes(query) ||
        member.status.toLowerCase().includes(query)
    );
  }, [members, searchQuery]);

  function resetInviteForm() {
    setEmail("");
    setRole("Editor");
    setRoleOpen(false);
  }

  function closeInvite() {
    if (inviting) return;

    setInviteOpen(false);
    resetInviteForm();
  }

  async function handleInvite() {
    const normalizedEmail = email.trim().toLowerCase();

    if (!normalizedEmail || !normalizedEmail.includes("@")) {
      alert("Enter a valid email address.");
      return;
    }

    try {
      setInviting(true);

      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user) {
        alert("Please log in first.");
        return;
      }

      const alreadyExists = members.some(
        (member) => member.email.toLowerCase() === normalizedEmail
      );

      if (alreadyExists) {
        alert(
          "This person is already a member or has a pending invitation."
        );
        return;
      }

      const { data, error } = await supabase
        .from("team_invitations")
        .insert({
          owner_id: user.id,
          email: normalizedEmail,
          role,
          status: "Pending",
        })
        .select("id, email, role, status, token, created_at")
        .single();

      if (error) {
        console.error("Invite error:", error);

        if (error.code === "23505") {
          alert("This email already has a pending invitation.");
        } else {
          alert("Could not create invitation.");
        }

        return;
      }

      const invitation = data as InvitationRow;

      const { error: sendError } = await supabase.functions.invoke(
        "send-team-invite",
        {
          body: {
            invitationId: invitation.id,
          },
        }
      );

      if (sendError) {
        console.error("Send invitation email error:", sendError);

        try {
          const response = sendError.context as Response | undefined;

          if (response) {
            console.error("Function status:", response.status);

            const responseBody = await response.clone().text();

            console.error("Function response:", responseBody);
          }
        } catch (debugError) {
          console.error(
            "Could not read function response:",
            debugError
          );
        }

        setMembers((current) => [
          {
            id: invitation.id,
            source: "invitation",
            name: invitation.email.split("@")[0],
            email: invitation.email,
            role: invitation.role,
            status: "Pending",
            created_at: invitation.created_at,
            token: invitation.token,
          },
          ...current,
        ]);

        setInviteOpen(false);
        resetInviteForm();

        alert(
          "Invitation was saved, but the email could not be sent. You can still copy the invite link from the team list."
        );

        return;
      }

      setMembers((current) => [
        {
          id: invitation.id,
          source: "invitation",
          name: invitation.email.split("@")[0],
          email: invitation.email,
          role: invitation.role,
          status: "Pending",
          created_at: invitation.created_at,
          token: invitation.token,
        },
        ...current,
      ]);

      setInviteOpen(false);
      resetInviteForm();
    } finally {
      setInviting(false);
    }
  }

  async function copyInviteLink(member: TeamMember) {
    if (member.source !== "invitation" || !member.token) return;

    const link = `${window.location.origin}/invite/${member.token}`;

    try {
      await navigator.clipboard.writeText(link);
      setActiveMenuId(null);
    } catch (error) {
      console.error("Copy invitation link error:", error);
      alert(link);
    }
  }

  async function cancelInvitation(member: TeamMember) {
    if (member.source !== "invitation") return;

    const confirmed = window.confirm(
      `Cancel invitation for ${member.email}?`
    );

    if (!confirmed) return;

    const { error } = await supabase
      .from("team_invitations")
      .update({
        status: "Cancelled",
        updated_at: new Date().toISOString(),
      })
      .eq("id", member.id);

    if (error) {
      console.error("Cancel invitation error:", error);
      alert("Could not cancel invitation.");
      return;
    }

    setMembers((current) =>
      current.filter((item) => item.id !== member.id)
    );

    setActiveMenuId(null);
  }

  async function removeMember(member: TeamMember) {
    if (member.source !== "member") return;

    const confirmed = window.confirm(
      `Remove ${member.email} from your team?`
    );

    if (!confirmed) return;

    const { error } = await supabase
      .from("team_members")
      .delete()
      .eq("id", member.id);

    if (error) {
      console.error("Remove member error:", error);
      alert("Could not remove member.");
      return;
    }

    setMembers((current) =>
      current.filter((item) => item.id !== member.id)
    );

    setActiveMenuId(null);
  }

  return (
    <main className="min-h-full bg-white px-6 pb-10 pt-7 md:px-8 xl:px-10">
      {/* HEADER */}
      <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-[24px] font-semibold tracking-[-0.04em] text-[#20242f]">
            Team
          </h1>

          <p className="mt-1.5 max-w-[560px] text-[11px] leading-5 text-[#8d94a3]">
            Invite people to your workspace and manage how they collaborate
            with you.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setInviteOpen(true)}
          className="flex h-[42px] shrink-0 items-center justify-center gap-2 rounded-[11px] bg-[#6547ef] px-[18px] text-[11px] font-semibold text-white shadow-[0_8px_22px_rgba(101,71,239,0.18)] transition hover:bg-[#5c3fe5]"
        >
          <UserPlus size={15} />
          Invite member
        </button>
      </div>

      {/* SEARCH */}
      <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative w-full sm:max-w-[340px]">
          <Search
            size={15}
            className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-[#a0a6b2]"
          />

          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search team members..."
            className="h-[42px] w-full rounded-[11px] border border-[#e4e6eb] bg-white pl-10 pr-3.5 text-[11px] text-[#343946] outline-none placeholder:text-[#a4aab6] transition focus:border-[#9b8bf5] focus:ring-4 focus:ring-[#6547ef]/5"
          />
        </div>

        {!loading && members.length > 0 && (
          <p className="text-[10px] font-medium text-[#989eaa]">
            {members.length}{" "}
            {members.length === 1 ? "member" : "members"}
          </p>
        )}
      </div>

      {/* LOADING */}
      {loading ? (
        <section className="mt-6 overflow-hidden rounded-[18px] border border-[#e8eaf0] bg-white">
          <div className="grid grid-cols-[1.6fr_1fr_.8fr_44px] border-b border-[#eceef2] bg-[#fafafb] px-5 py-3">
            <div className="h-2.5 w-14 animate-pulse rounded-full bg-[#e8eaf0]" />
            <div className="h-2.5 w-10 animate-pulse rounded-full bg-[#e8eaf0]" />
            <div className="h-2.5 w-10 animate-pulse rounded-full bg-[#e8eaf0]" />
            <div />
          </div>

          {Array.from({ length: 4 }).map((_, index) => (
            <div
              key={index}
              className="grid grid-cols-[1.6fr_1fr_.8fr_44px] items-center border-b border-[#f0f1f4] px-5 py-4 last:border-b-0"
            >
              <div className="flex items-center gap-3">
                <div className="h-9 w-9 animate-pulse rounded-full bg-[#f0eefb]" />

                <div>
                  <div className="h-2.5 w-24 animate-pulse rounded-full bg-[#e9ebef]" />
                  <div className="mt-2 h-2 w-36 animate-pulse rounded-full bg-[#f0f1f4]" />
                </div>
              </div>

              <div className="h-2.5 w-12 animate-pulse rounded-full bg-[#edf0f3]" />
              <div className="h-5 w-14 animate-pulse rounded-full bg-[#f3f4f6]" />
              <div />
            </div>
          ))}
        </section>
      ) : members.length === 0 ? (
        /* EMPTY STATE */
        <section className="mt-6 flex min-h-[430px] items-center justify-center rounded-[24px] border border-dashed border-[#dfe2e9] bg-[#fcfcfd] px-6 py-12">
          <div className="max-w-[430px] text-center">
            <div className="relative mx-auto flex h-[94px] w-[94px] items-center justify-center rounded-[28px] bg-[#efecff]">
              <div className="absolute -right-2 top-2 flex h-8 w-8 items-center justify-center rounded-[10px] border-4 border-[#fcfcfd] bg-white text-[#6547ef] shadow-[0_8px_22px_rgba(35,32,70,0.08)]">
                <UserPlus size={15} />
              </div>

              <Users
                size={38}
                strokeWidth={1.7}
                className="text-[#6547ef]"
              />
            </div>

            <h2 className="mt-6 text-[18px] font-semibold tracking-[-0.025em] text-[#2a2f3a]">
              Build your team
            </h2>

            <p className="mx-auto mt-2.5 max-w-[360px] text-[11px] leading-5 text-[#8e95a3]">
              Invite teammates, assign roles and work together across your
              DesignHub workspace.
            </p>

            <button
              type="button"
              onClick={() => setInviteOpen(true)}
              className="mt-6 inline-flex h-[42px] items-center justify-center gap-2 rounded-[11px] bg-[#6547ef] px-5 text-[11px] font-semibold text-white shadow-[0_8px_22px_rgba(101,71,239,0.16)] transition hover:bg-[#5c3fe5]"
            >
              <UserPlus size={15} />
              Invite your first member
            </button>

            <div className="mt-8 rounded-[14px] border border-[#ece9ff] bg-[#f8f6ff] px-4 py-3.5 text-left">
              <p className="text-[10px] leading-5 text-[#746d91]">
                <span className="font-semibold text-[#5f52a4]">
                  Tip:
                </span>{" "}
                Roles help you control who can manage settings, edit
                content or only view your workspace.
              </p>
            </div>
          </div>
        </section>
      ) : filteredMembers.length === 0 ? (
        /* NO RESULTS */
        <section className="mt-6 flex min-h-[280px] items-center justify-center rounded-[20px] border border-dashed border-[#e0e3e9] bg-[#fcfcfd] px-6 text-center">
          <div>
            <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-[13px] bg-[#f1eeff] text-[#6547ef]">
              <Search size={18} />
            </div>

            <p className="mt-4 text-[13px] font-semibold text-[#343946]">
              No matching members
            </p>

            <p className="mt-1.5 text-[10px] text-[#969ca9]">
              Try another name, email, role or status.
            </p>

            <button
              type="button"
              onClick={() => setSearchQuery("")}
              className="mt-4 h-[36px] rounded-[10px] border border-[#e2e4e9] bg-white px-4 text-[10px] font-semibold text-[#606878] transition hover:bg-[#f7f7f9]"
            >
              Clear search
            </button>
          </div>
        </section>
      ) : (
        /* TEAM LIST */
        <section className="mt-6 overflow-visible rounded-[18px] border border-[#e8eaf0] bg-white">
          <div className="grid grid-cols-[1.6fr_1fr_.8fr_44px] border-b border-[#eceef2] bg-[#fafafb] px-5 py-3 text-[9px] font-semibold uppercase tracking-[0.08em] text-[#a0a6b2]">
            <span>Member</span>
            <span>Role</span>
            <span>Status</span>
            <span />
          </div>

          {filteredMembers.map((member) => (
            <div
              key={`${member.source}-${member.id}`}
              className="grid grid-cols-[1.6fr_1fr_.8fr_44px] items-center border-b border-[#f0f1f4] px-5 py-4 last:border-b-0"
            >
              <div className="flex min-w-0 items-center gap-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#efecff] text-[11px] font-semibold uppercase text-[#6547ef]">
                  {member.name.charAt(0)}
                </div>

                <div className="min-w-0">
                  <p className="truncate text-[11px] font-semibold text-[#343946]">
                    {member.name}
                  </p>

                  <p className="mt-0.5 truncate text-[9px] text-[#969ca9]">
                    {member.email}
                  </p>
                </div>
              </div>

              <span className="text-[10px] font-medium text-[#697180]">
                {member.role}
              </span>

              <span
                className={`inline-flex w-fit rounded-full px-2.5 py-1 text-[9px] font-semibold ${
                  member.status === "Active"
                    ? "bg-[#edf9f1] text-[#4d9664]"
                    : "bg-[#fff7e8] text-[#b68534]"
                }`}
              >
                {member.status}
              </span>

              <div
                className="relative"
                ref={
                  activeMenuId === member.id ? menuRef : undefined
                }
              >
                <button
                  type="button"
                  onClick={() =>
                    setActiveMenuId((current) =>
                      current === member.id ? null : member.id
                    )
                  }
                  className="flex h-8 w-8 items-center justify-center rounded-[9px] text-[#9ba1ae] transition hover:bg-[#f4f4f7] hover:text-[#555d6b]"
                >
                  <MoreHorizontal size={16} />
                </button>

                {activeMenuId === member.id && (
                  <div className="absolute bottom-[38px] right-0 z-50 w-[178px] rounded-[12px] border border-[#e5e7ed] bg-white p-1.5 shadow-[0_12px_32px_rgba(25,25,40,0.12)]">
                    {member.source === "invitation" && (
                      <button
                        type="button"
                        onClick={() => copyInviteLink(member)}
                        className="flex w-full items-center gap-2 rounded-[9px] px-3 py-2.5 text-left text-[10px] font-medium text-[#555d6b] transition hover:bg-[#f6f6f8]"
                      >
                        <Copy size={13} />
                        Copy invite link
                      </button>
                    )}

                    <button
                      type="button"
                      onClick={() =>
                        member.source === "invitation"
                          ? cancelInvitation(member)
                          : removeMember(member)
                      }
                      className="flex w-full items-center gap-2 rounded-[9px] px-3 py-2.5 text-left text-[10px] font-medium text-[#d85858] transition hover:bg-[#fff3f3]"
                    >
                      <Trash2 size={13} />

                      {member.source === "invitation"
                        ? "Cancel invitation"
                        : "Remove member"}
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </section>
      )}

      {/* INVITE MODAL */}
      {inviteOpen && (
        <div
          className="fixed inset-0 z-[60] flex items-center justify-center bg-[#111827]/20 px-4 py-8 backdrop-blur-[2px]"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) closeInvite();
          }}
        >
          <div className="w-full max-w-[480px] rounded-[22px] border border-[#e6e7ec] bg-white p-6 shadow-[0_30px_90px_rgba(22,20,40,0.16)]">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-[19px] font-semibold tracking-[-0.03em] text-[#20242f]">
                  Invite team member
                </h2>

                <p className="mt-1.5 text-[11px] leading-5 text-[#9097a5]">
                  Create an invitation to join your DesignHub workspace.
                </p>
              </div>

              <button
                type="button"
                disabled={inviting}
                onClick={closeInvite}
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[10px] text-[#969dac] transition hover:bg-[#f5f5f7] hover:text-[#4f5665] disabled:opacity-40"
              >
                <X size={17} />
              </button>
            </div>

            <div className="mt-6">
              <label className="text-[10px] font-semibold text-[#5f6675]">
                Email address
              </label>

              <div className="relative mt-2">
                <Mail
                  size={15}
                  className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-[#a2a8b4]"
                />

                <input
                  autoFocus
                  type="email"
                  value={email}
                  disabled={inviting}
                  onChange={(e) => setEmail(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      handleInvite();
                    }
                  }}
                  placeholder="name@example.com"
                  className="h-[45px] w-full rounded-[11px] border border-[#e2e5eb] pl-10 pr-3.5 text-[12px] text-[#343946] outline-none placeholder:text-[#a7adb8] focus:border-[#9685f7] focus:ring-4 focus:ring-[#6547ef]/5 disabled:bg-[#fafafa]"
                />
              </div>
            </div>

            <div className="relative mt-5">
              <label className="text-[10px] font-semibold text-[#5f6675]">
                Role
              </label>

              <button
                type="button"
                disabled={inviting}
                onClick={() =>
                  setRoleOpen((current) => !current)
                }
                className="mt-2 flex h-[45px] w-full items-center justify-between rounded-[11px] border border-[#e2e5eb] bg-white px-3.5 text-[12px] text-[#444b5b] transition hover:border-[#d6d9df] disabled:opacity-50"
              >
                <span>{role}</span>

                <ChevronDown
                  size={16}
                  className={`text-[#969dab] transition-transform ${
                    roleOpen ? "rotate-180" : ""
                  }`}
                />
              </button>

              {roleOpen && (
                <div className="absolute left-0 top-[72px] z-20 w-full rounded-[13px] border border-[#e4e6ec] bg-white p-1.5 shadow-[0_16px_45px_rgba(30,30,50,0.12)]">
                  {roles.map((item) => (
                    <button
                      key={item}
                      type="button"
                      onClick={() => {
                        setRole(item);
                        setRoleOpen(false);
                      }}
                      className={`flex w-full items-center justify-between rounded-[9px] px-3 py-2.5 text-left text-[11px] transition ${
                        role === item
                          ? "bg-[#f2efff] font-semibold text-[#6547ef]"
                          : "text-[#535b6b] hover:bg-[#f7f7f9]"
                      }`}
                    >
                      <div>
                        <p>{item}</p>

                        <p className="mt-0.5 text-[9px] font-normal text-[#999fac]">
                          {item === "Admin"
                            ? "Manage members and workspace settings"
                            : item === "Editor"
                              ? "Create and edit workspace content"
                              : "View workspace content only"}
                        </p>
                      </div>

                      {role === item && <Check size={14} />}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="mt-6 rounded-[13px] border border-[#ece9ff] bg-[#faf8ff] px-4 py-3">
              <p className="text-[9px] leading-4 text-[#7c7594]">
                The invitation will be saved in Supabase and sent to
                this email address with a secure invitation link.
              </p>
            </div>

            <div className="mt-6 flex justify-end gap-2.5">
              <button
                type="button"
                disabled={inviting}
                onClick={closeInvite}
                className="h-[42px] rounded-[11px] border border-[#e2e4ea] px-5 text-[11px] font-semibold text-[#606879] transition hover:bg-[#f8f8fa] disabled:opacity-40"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handleInvite}
                disabled={inviting || !email.trim()}
                className="flex h-[42px] items-center gap-2 rounded-[11px] bg-[#6547ef] px-5 text-[11px] font-semibold text-white shadow-[0_8px_20px_rgba(101,71,239,0.18)] transition hover:bg-[#5c3fe5] disabled:cursor-not-allowed disabled:opacity-45"
              >
                <UserPlus size={14} />
                {inviting ? "Inviting..." : "Send invite"}
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}