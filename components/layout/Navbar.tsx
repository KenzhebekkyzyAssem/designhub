"use client";

import Link from "next/link";

const navItems = [
  { name: "Features", href: "#" },
  { name: "Solutions", href: "#" },
  { name: "Pricing", href: "#" },
  { name: "FAQ", href: "#" },
  { name: "About", href: "#" },
];

export default function Navbar() {
  return (
    <header className="fixed left-0 right-0 top-0 z-50 bg-white/80 backdrop-blur-md">
      <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-6 lg:px-5">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-3">
          <img
            src="/logos/logo.svg"
            alt="DesignHub"
            className="h-7 w-auto"
          />
        </Link>

        {/* Navigation */}
        <nav className="hidden items-center gap-10 lg:flex">
          {navItems.map((item) => (
            <Link
              key={item.name}
              href={item.href}
              className="text-[15px] font-medium text-[#111827] transition hover:text-[#6C5DD3]"
            >
              {item.name}
            </Link>
          ))}
        </nav>

        {/* Actions */}
        <div className="flex items-center gap-4">
          {/* Логин батырмасы /login бетіне апарады */}
          <Link
            href="/login"
            className="rounded-xl border border-gray-200 bg-white px-6 py-3 text-sm font-medium text-[#111827] transition hover:bg-gray-50"
          >
            Log in
          </Link>

          {/* Get Started батырмасы /auth (тіркелу) бетіне апарады */}
          <Link
            href="/auth"
            className="rounded-xl bg-[#6C5DD3] px-6 py-3 text-sm font-medium text-white transition hover:bg-[#5A4BCE]"
          >
            Get Started
          </Link>
        </div>
      </div>
    </header>
  );
}