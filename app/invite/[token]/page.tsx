"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import {
  CheckCircle2,
  Loader2,
  LogIn,
  ShieldCheck,
  UserPlus,
  XCircle,
} from "lucide-react";

type Invitation = {
  id: string;
  email: string;
  role: "Admin" | "Editor" | "Viewer";
  status: "Pending" | "Accepted" | "Cancelled";
  owner_id: string;
  created_at: string;
};

export default function InvitePage() {
  const params = useParams<{ token: string }>();
  const router = useRouter();

  const token = useMemo(() => params?.token ?? "", [params]);

  const [invitation, setInvitation] = useState<Invitation | null>(null);
  const [loading, setLoading] = useState(true);
  const [accepting, setAccepting] = useState(false);
  const [currentEmail, setCurrentEmail] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [accepted, setAccepted] = useState(false);

  useEffect(() => {
    loadInvitation();
  }, [token]);

  async function loadInvitation() {
    if (!token) {
      setErrorMessage("Invalid invitation link.");
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setErrorMessage(null);

      const {
        data: { user },
      } = await supabase.auth.getUser();

      setCurrentEmail(user?.email ?? null);

      if (!user) {
        return;
      }

      const { data, error } = await supabase.rpc("get_team_invitation", {
        invite_token: token,
      });

      if (error) {
        console.error("Load invitation error:", error);
        setErrorMessage("Could not load this invitation.");
        return;
      }

      const row = Array.isArray(data) ? data[0] : null;

      if (!row) {
        setErrorMessage("This invitation does not exist.");
        return;
      }

      setInvitation(row as Invitation);
    } finally {
      setLoading(false);
    }
  }

  async function acceptInvitation() {
    if (!token || !invitation) return;

    try {
      setAccepting(true);
      setErrorMessage(null);

      const { error } = await supabase.rpc("accept_team_invitation", {
        invite_token: token,
      });

      if (error) {
        console.error("Accept invitation error:", error);

        const message = error.message?.toLowerCase() ?? "";

        if (message.includes("another email")) {
          setErrorMessage(
            `This invitation was sent to ${invitation.email}. Sign in with that email to accept it.`
          );
        } else if (message.includes("no longer pending")) {
          setErrorMessage("This invitation has already been used or cancelled.");
        } else {
          setErrorMessage("Could not accept this invitation.");
        }

        return;
      }

      setAccepted(true);
    } finally {
      setAccepting(false);
    }
  }

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#fafafe] px-5">
        <div className="flex items-center gap-2.5 text-[12px] font-medium text-[#7d8492]">
          <Loader2 size={18} className="animate-spin text-[#6547ef]" />
          Loading invitation...
        </div>
      </main>
    );
  }

  if (!currentEmail) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#fafafe] px-5 py-12">
        <div className="w-full max-w-[470px] rounded-[24px] border border-[#e7e8ee] bg-white p-7 text-center shadow-[0_28px_80px_rgba(34,31,55,0.08)]">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-[20px] bg-[#efecff] text-[#6547ef]">
            <LogIn size={26} />
          </div>

          <h1 className="mt-5 text-[21px] font-semibold tracking-[-0.035em] text-[#252a35]">
            Sign in to continue
          </h1>

          <p className="mx-auto mt-2 max-w-[330px] text-[11px] leading-5 text-[#8d94a2]">
            You need to be signed in to view and accept this DesignHub team
            invitation.
          </p>

          <button
            type="button"
            onClick={() =>
              router.push(`/auth?redirect=${encodeURIComponent(`/invite/${token}`)}`)
            }
            className="mt-6 h-[43px] rounded-[11px] bg-[#6547ef] px-5 text-[11px] font-semibold text-white shadow-[0_8px_22px_rgba(101,71,239,0.18)] transition hover:bg-[#5c3fe5]"
          >
            Sign in
          </button>
        </div>
      </main>
    );
  }

  if (accepted) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#fafafe] px-5 py-12">
        <div className="w-full max-w-[470px] rounded-[24px] border border-[#e7e8ee] bg-white p-7 text-center shadow-[0_28px_80px_rgba(34,31,55,0.08)]">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-[20px] bg-[#eef9f2] text-[#4f9b69]">
            <CheckCircle2 size={28} />
          </div>

          <h1 className="mt-5 text-[21px] font-semibold tracking-[-0.035em] text-[#252a35]">
            You’re in
          </h1>

          <p className="mx-auto mt-2 max-w-[340px] text-[11px] leading-5 text-[#8d94a2]">
            The invitation has been accepted and you’re now part of the team.
          </p>

          <button
            type="button"
            onClick={() => router.push("/dashboard")}
            className="mt-6 h-[43px] rounded-[11px] bg-[#6547ef] px-5 text-[11px] font-semibold text-white shadow-[0_8px_22px_rgba(101,71,239,0.18)] transition hover:bg-[#5c3fe5]"
          >
            Open dashboard
          </button>
        </div>
      </main>
    );
  }

  if (!invitation || errorMessage) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#fafafe] px-5 py-12">
        <div className="w-full max-w-[470px] rounded-[24px] border border-[#e7e8ee] bg-white p-7 text-center shadow-[0_28px_80px_rgba(34,31,55,0.08)]">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-[20px] bg-[#fff1f1] text-[#d85d5d]">
            <XCircle size={27} />
          </div>

          <h1 className="mt-5 text-[21px] font-semibold tracking-[-0.035em] text-[#252a35]">
            Invitation unavailable
          </h1>

          <p className="mx-auto mt-2 max-w-[340px] text-[11px] leading-5 text-[#8d94a2]">
            {errorMessage ?? "This invitation could not be loaded."}
          </p>
        </div>
      </main>
    );
  }

  const emailMatches =
    currentEmail.toLowerCase() === invitation.email.toLowerCase();

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#fafafe] px-5 py-12">
      <div className="w-full max-w-[500px] rounded-[24px] border border-[#e7e8ee] bg-white p-7 shadow-[0_28px_80px_rgba(34,31,55,0.08)]">
        <div className="flex h-14 w-14 items-center justify-center rounded-[18px] bg-[#efecff] text-[#6547ef]">
          <UserPlus size={24} />
        </div>

        <h1 className="mt-5 text-[22px] font-semibold tracking-[-0.04em] text-[#252a35]">
          Join this DesignHub team
        </h1>

        <p className="mt-2 text-[11px] leading-5 text-[#8d94a2]">
          You’ve been invited to collaborate in a DesignHub workspace.
        </p>

        <div className="mt-6 space-y-3 rounded-[16px] border border-[#ebecef] bg-[#fafafb] p-4">
          <div className="flex items-center justify-between gap-4">
            <span className="text-[10px] font-medium text-[#999fac]">
              Invited email
            </span>

            <span className="truncate text-[10px] font-semibold text-[#4c5362]">
              {invitation.email}
            </span>
          </div>

          <div className="flex items-center justify-between gap-4">
            <span className="text-[10px] font-medium text-[#999fac]">
              Role
            </span>

            <span className="rounded-full bg-[#efecff] px-2.5 py-1 text-[9px] font-semibold text-[#6547ef]">
              {invitation.role}
            </span>
          </div>

          <div className="flex items-center justify-between gap-4">
            <span className="text-[10px] font-medium text-[#999fac]">
              Signed in as
            </span>

            <span className="truncate text-[10px] font-semibold text-[#4c5362]">
              {currentEmail}
            </span>
          </div>
        </div>

        {!emailMatches && (
          <div className="mt-4 rounded-[13px] border border-[#f3dddd] bg-[#fff7f7] px-4 py-3">
            <p className="text-[10px] leading-5 text-[#b85d5d]">
              This invitation belongs to another email address. Sign in with{" "}
              <span className="font-semibold">{invitation.email}</span>.
            </p>
          </div>
        )}

        {invitation.status !== "Pending" && (
          <div className="mt-4 rounded-[13px] border border-[#ece5ce] bg-[#fffaf0] px-4 py-3">
            <p className="text-[10px] leading-5 text-[#9d7b36]">
              This invitation is no longer pending.
            </p>
          </div>
        )}

        <div className="mt-6 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-[9px] text-[#999fac]">
            <ShieldCheck size={14} className="text-[#7a68e8]" />
            Secure invitation
          </div>

          <button
            type="button"
            onClick={acceptInvitation}
            disabled={
              accepting ||
              !emailMatches ||
              invitation.status !== "Pending"
            }
            className="flex h-[43px] items-center gap-2 rounded-[11px] bg-[#6547ef] px-5 text-[11px] font-semibold text-white shadow-[0_8px_22px_rgba(101,71,239,0.18)] transition hover:bg-[#5c3fe5] disabled:cursor-not-allowed disabled:opacity-45"
          >
            {accepting ? (
              <>
                <Loader2 size={14} className="animate-spin" />
                Joining...
              </>
            ) : (
              <>
                <CheckCircle2 size={14} />
                Accept invitation
              </>
            )}
          </button>
        </div>
      </div>
    </main>
  );
}
