"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import Link from "next/link";
import { ArrowLeft, Check } from "lucide-react";

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(false);
  const router = useRouter();

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleRegister = async () => {
    if (!isLogin && password !== confirmPassword) {
      alert("Passwords do not match!");
      return;
    }

    setLoading(true);

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
        },
      },
    });

    setLoading(false);

    if (error) {
      alert(error.message);
      return;
    }

    router.push("/workspace/new");
  };

  const handleLogin = async () => {
    setLoading(true);

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    setLoading(false);

    if (error) {
      alert(error.message);
      return;
    }

    router.push("/dashboard");
  };

  const handleGoogleLogin = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: "http://localhost:3000/dashboard",
      },
    });

    if (error) {
      alert(error.message);
      console.error(error);
    }
  };

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#F8F9FC] flex items-center justify-center py-10">
      
      {/* BACKGROUND GLOWS */}
      <div className="absolute -left-20 -top-20 h-[550px] w-[550px] rounded-full bg-[#7C5CFC]/20 blur-[120px] pointer-events-none" />
      <div className="absolute -right-20 -bottom-20 h-[550px] w-[550px] rounded-full bg-[#A78BFA]/20 blur-[120px] pointer-events-none" />

      {/* Main Container */}
      <div className="relative z-10 mx-auto flex w-full max-w-[1240px] items-center justify-between gap-12 px-8">
        
        {/* LEFT SECTION */}
        <div className="hidden flex-1 lg:block">
          <Link href="/" className="inline-flex items-center gap-3">
            <img
              src="/logos/logo.svg"
              alt="DesignHub"
              className="h-8 w-auto"
            />
          </Link>

          <div className="mt-10 max-w-[440px]">
            <span className="inline-block rounded-full bg-[#F3EEFF] px-4 py-1.5 text-xs font-semibold uppercase tracking-wider text-[#6C5DD3]">
              DESIGN PLATFORM
            </span>

            <h1 className="mt-6 text-[44px] font-bold leading-[52px] tracking-[-1.5px] text-[#111827]">
              Everything you need
              <br />
              to build beautiful
              <br />
              <span className="text-[#6C5DD3]">design projects.</span>
            </h1>

            <p className="mt-5 text-[15px] leading-[26px] text-[#6B7280]">
              Collaborate with your team, manage files, organize
              projects and build faster in one beautiful workspace.
            </p>

            <div className="mt-8 space-y-3.5">
              <div className="flex items-center gap-3 text-sm font-medium text-[#374151]">
                <div className="flex h-5 w-5 items-center justify-center rounded-full bg-[#F3EEFF] text-[#6C5DD3]">
                  <Check size={13} strokeWidth={2.5} />
                </div>
                <span>Unlimited projects</span>
              </div>

              <div className="flex items-center gap-3 text-sm font-medium text-[#374151]">
                <div className="flex h-5 w-5 items-center justify-center rounded-full bg-[#F3EEFF] text-[#6C5DD3]">
                  <Check size={13} strokeWidth={2.5} />
                </div>
                <span>Team collaboration</span>
              </div>

              <div className="flex items-center gap-3 text-sm font-medium text-[#374151]">
                <div className="flex h-5 w-5 items-center justify-center rounded-full bg-[#F3EEFF] text-[#6C5DD3]">
                  <Check size={13} strokeWidth={2.5} />
                </div>
                <span>Beautiful workspace</span>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT SECTION */}
        <div className="w-full max-w-[500px] mx-auto">
          <div className="rounded-[28px] border border-[#ECECEC] bg-white p-7 sm:p-8 shadow-[0_20px_60px_rgba(17,24,39,0.06)]">
            
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#6B7280] transition hover:text-[#111827]"
            >
              <ArrowLeft size={14} />
              Back to home
            </Link>

            <h2 className="mt-4 text-[24px] font-bold tracking-[-0.5px] text-[#111827]">
              {isLogin ? "Welcome back" : "Create your account"}
            </h2>

            <p className="mt-1 text-[13px] leading-5 text-[#6B7280]">
              {isLogin
                ? "Log in to continue your work."
                : "Start building your workspace in less than a minute."}
            </p>

            {/* Form */}
            <div className="mt-5 space-y-3">
              {!isLogin && (
                <div>
                  <label className="mb-1 block text-[11px] font-semibold uppercase tracking-wider text-[#374151]">
                    Full Name
                  </label>
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Enter your full name"
                    className="h-10 w-full rounded-xl border border-[#E5E7EB] bg-white px-3.5 text-xs font-medium text-[#111827] placeholder:text-gray-400 outline-none transition-all focus:border-[#6C5DD3] focus:ring-4 focus:ring-[#6C5DD3]/10"
                  />
                </div>
              )}

              <div>
                <label className="mb-1 block text-[11px] font-semibold uppercase tracking-wider text-[#374151]">
                  Email
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  className="h-10 w-full rounded-xl border border-[#E5E7EB] bg-white px-3.5 text-xs font-medium text-[#111827] placeholder:text-gray-400 outline-none transition-all focus:border-[#6C5DD3] focus:ring-4 focus:ring-[#6C5DD3]/10"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-[11px] font-semibold uppercase tracking-wider text-[#374151]">
                    Password
                  </label>
                  {isLogin && (
                    <Link
                      href="#"
                      className="text-[11px] font-semibold text-[#6C5DD3] hover:underline"
                    >
                      Forgot password?
                    </Link>
                  )}
                </div>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  className="h-10 w-full rounded-xl border border-[#E5E7EB] bg-white px-3.5 text-xs font-medium text-[#111827] placeholder:text-gray-400 outline-none transition-all focus:border-[#6C5DD3] focus:ring-4 focus:ring-[#6C5DD3]/10"
                />
              </div>

              {!isLogin && (
                <div>
                  <label className="mb-1 block text-[11px] font-semibold uppercase tracking-wider text-[#374151]">
                    Confirm Password
                  </label>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Confirm your password"
                    className="h-10 w-full rounded-xl border border-[#E5E7EB] bg-white px-3.5 text-xs font-medium text-[#111827] placeholder:text-gray-400 outline-none transition-all focus:border-[#6C5DD3] focus:ring-4 focus:ring-[#6C5DD3]/10"
                  />
                </div>
              )}
            </div>

            {/* Submit Button */}
            <button
              onClick={isLogin ? handleLogin : handleRegister}
              disabled={loading}
              className="
                mt-6
                h-10
                w-full
                rounded-xl
                bg-[#6C5DD3]
                text-xs
                font-semibold
                text-white
                transition-all
                duration-300
                hover:bg-[#5A4BCE]
                hover:shadow-[0_10px_25px_rgba(108,93,211,0.25)]
                disabled:opacity-50
              "
            >
              {loading ? "Loading..." : isLogin ? "Log In" : "Create Account"}
            </button>

            {!isLogin && (
              <p className="mt-3 text-center text-[11px] leading-4 text-[#6B7280]">
                By creating an account, you agree to our{" "}
                <Link
                  href="#"
                  className="font-semibold text-[#111827] hover:text-[#6C5DD3]"
                >
                  Terms
                </Link>{" "}
                and{" "}
                <Link
                  href="#"
                  className="font-semibold text-[#111827] hover:text-[#6C5DD3]"
                >
                  Privacy Policy
                </Link>
              </p>
            )}

            {/* Divider */}
            <div className="my-4 flex items-center">
              <div className="h-px flex-1 bg-[#ECECEC]" />
              <span className="mx-3 text-[10px] font-semibold uppercase tracking-wider text-[#9CA3AF]">
                OR
              </span>
              <div className="h-px flex-1 bg-[#ECECEC]" />
            </div>

            {/* Google Button */}
            <button
              onClick={handleGoogleLogin}
              className="
                flex
                h-10
                w-full
                items-center
                justify-center
                gap-2.5
                rounded-xl
                border
                border-[#E5E7EB]
                bg-white
                text-xs
                font-semibold
                text-[#111827]
                transition
                hover:bg-[#F9FAFB]
              "
            >
              <svg className="h-4 w-4" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
              Continue with Google
            </button>

            {/* Bottom Toggle Text */}
            <p className="mt-4 text-center text-xs font-medium text-[#6B7280]">
              {isLogin ? "Don't have an account?" : "Already have an account?"}
              <button
                type="button"
                onClick={() => setIsLogin(!isLogin)}
                className="ml-1 font-semibold text-[#6C5DD3] hover:text-[#5A4BCE]"
              >
                {isLogin ? "Sign Up" : "Log In"}
              </button>
            </p>

          </div>
        </div>

      </div>
    </main>
  );
}