"use client";

import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  Play,
  CreditCard,
  Clock3,
  Monitor,
  Heart,
} from "lucide-react";

export default function Hero() {
  return (
    <section className="relative overflow-hidden bg-white pt-24 pb-16">
      {/* Фондағы жұмсақ оррталық градиент */}
      <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
        <div className="h-[500px] w-[700px] rounded-full bg-gradient-to-tr from-[#EADCF8]/60 via-[#F3EEFF]/40 to-transparent blur-[120px]" />
      </div>

      <div className="relative mx-auto max-w-[1320px] px-8">
        <div className="grid grid-cols-1 items-center gap-10 lg:grid-cols-[1.02fr_1fr]">

          {/* LEFT */}
          <div>
            <span className="inline-flex rounded-full bg-[#F3EEFF] px-5 py-2 text-xs font-semibold uppercase tracking-wider text-[#6C5DD3]">
              ALL-IN-ONE WORKSPACE
            </span>

            <h1 className="mt-8 text-[64px] font-bold leading-[72px] tracking-[-2px] text-[#111827]">
              The hub for
              <br />
              <span className="text-[#6C5DD3]">designers</span> and
              <br />
              their best work.
            </h1>

            <p className="mt-8 max-w-[500px] text-[20px] leading-[36px] text-[#6B7280]">
              DesignHub brings your tools, files, and team together
              in one beautiful workspace.
            </p>

            <div className="mt-10 flex items-center gap-5">
              <Link
                href="/auth"
                className="flex h-16 items-center gap-3 rounded-2xl bg-[#6C5DD3] px-8 font-semibold text-white transition hover:bg-[#5A4BCE]"
              >
                Start Free
                <ArrowRight size={20} />
              </Link>

              <button className="flex h-16 items-center gap-3 rounded-2xl border border-gray-200 bg-white px-8 font-semibold text-[#111827] transition hover:bg-gray-50">
                See How It Works
                <Play size={18} />
              </button>
            </div>

            {/* FEATURES */}
            <div className="mt-12 grid grid-cols-2 gap-6 sm:grid-cols-4">
              <div className="space-y-3">
                <div className="flex h-13 w-13 items-center justify-center rounded-2xl bg-[#F4F0FF] p-3 text-[#6C5DD3]">
                  <CreditCard size={22} />
                </div>
                <p className="text-sm font-medium leading-tight text-[#111827]">
                  No credit card
                  <br />
                  required
                </p>
              </div>

              <div className="space-y-3">
                <div className="flex h-13 w-13 items-center justify-center rounded-2xl bg-[#F4F0FF] p-3 text-[#6C5DD3]">
                  <Clock3 size={22} />
                </div>
                <p className="text-sm font-medium leading-tight text-[#111827]">
                  Setup in
                  <br />
                  30 seconds
                </p>
              </div>

              <div className="space-y-3">
                <div className="flex h-13 w-13 items-center justify-center rounded-2xl bg-[#F4F0FF] p-3 text-[#6C5DD3]">
                  <Monitor size={22} />
                </div>
                <p className="text-sm font-medium leading-tight text-[#111827]">
                  Access
                  <br />
                  anywhere
                </p>
              </div>

              <div className="space-y-3">
                <div className="flex h-13 w-13 items-center justify-center rounded-2xl bg-[#F4F0FF] p-3 text-[#6C5DD3]">
                  <Heart size={22} />
                </div>
                <p className="text-sm font-medium leading-tight text-[#111827]">
                  Loved by
                  <br />
                  designers
                </p>
              </div>
            </div>
          </div>

          <div className="relative">
            <div className="ml-auto w-full max-w-[660px] overflow-hidden rounded-[30px] border border-[#ECECEC] bg-white shadow-[0_30px_80px_rgba(17,24,39,0.12)]">
              <Image
  src="/images/dashboard-preview-2.png"
  alt="Dashboard Preview"
  width={900}
  height={950}
  priority
  className="w-full h-auto rounded-[30px]"
/>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}