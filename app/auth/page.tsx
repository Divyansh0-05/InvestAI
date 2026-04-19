"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useEffect, useState } from "react";
import { getSupabaseBrowserClient } from "@/lib/supabase-browser";

type AuthMode = "login" | "signup";

export default function AuthPage() {
  const router = useRouter();
  const supabase = getSupabaseBrowserClient();
  const [mode, setMode] = useState<AuthMode>("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [infoMessage, setInfoMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    let isMounted = true;

    async function loadSession() {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (session && isMounted) {
        router.replace("/chat");
      }
    }

    void loadSession();

    return () => {
      isMounted = false;
    };
  }, [router, supabase]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmitting(true);
    setErrorMessage("");
    setInfoMessage("");

    try {
      if (mode === "signup") {
        const { error } = await supabase.auth.signUp({ email, password });

        if (error) {
          setErrorMessage(error.message);
          return;
        }

        setInfoMessage("Check your email to confirm your account!");
        return;
      }

      const { error } = await supabase.auth.signInWithPassword({ email, password });

      if (error) {
        setErrorMessage(error.message);
        return;
      }

      router.push("/chat");
      router.refresh();
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center px-4 py-10">
      <div className="w-full max-w-md rounded-[32px] border border-[#dcfce7] bg-white/95 p-6 shadow-[0_24px_80px_rgba(22,163,74,0.15)] backdrop-blur-sm sm:p-8">
        <div className="text-center">
          <Link href="/" className="text-sm font-semibold uppercase tracking-[0.24em] text-green-700">
            investAI
          </Link>
          <h1 className="mt-4 font-['Plus_Jakarta_Sans'] text-3xl font-bold text-[#111827]">
            Welcome back
          </h1>
          <p className="mt-2 text-sm leading-6 text-[#6B7280]">
            Login karo ya naya account banao, phir apne financial dost ke saath chat shuru karo.
          </p>
        </div>

        <div className="mt-8 flex rounded-full bg-[#F0FDF4] p-1">
          <button
            type="button"
            onClick={() => {
              setMode("login");
              setErrorMessage("");
              setInfoMessage("");
            }}
            className={`flex-1 rounded-full px-4 py-2 text-sm font-semibold transition ${
              mode === "login" ? "bg-green-600 text-white shadow-sm" : "text-green-700"
            }`}
          >
            Login
          </button>
          <button
            type="button"
            onClick={() => {
              setMode("signup");
              setErrorMessage("");
              setInfoMessage("");
            }}
            className={`flex-1 rounded-full px-4 py-2 text-sm font-semibold transition ${
              mode === "signup" ? "bg-green-600 text-white shadow-sm" : "text-green-700"
            }`}
          >
            Sign Up
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div>
            <label htmlFor="email" className="mb-2 block text-sm font-medium text-[#166534]">
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
              className="w-full rounded-2xl border border-[#D1FAE5] bg-[#F9FAFB] px-4 py-3 text-sm text-[#111827] outline-none transition focus:border-green-500 focus:ring-2 focus:ring-green-200"
              placeholder="you@example.com"
            />
          </div>

          <div>
            <label htmlFor="password" className="mb-2 block text-sm font-medium text-[#166534]">
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              required
              className="w-full rounded-2xl border border-[#D1FAE5] bg-[#F9FAFB] px-4 py-3 text-sm text-[#111827] outline-none transition focus:border-green-500 focus:ring-2 focus:ring-green-200"
              placeholder="At least 6 characters"
            />
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full rounded-full bg-green-600 px-4 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-green-700 disabled:cursor-not-allowed disabled:bg-slate-300"
          >
            {isSubmitting ? "Please wait..." : mode === "login" ? "Login" : "Create account"}
          </button>
        </form>

        {infoMessage ? <p className="mt-4 text-sm text-green-700">{infoMessage}</p> : null}
        {errorMessage ? <p className="mt-4 text-sm text-red-600">{errorMessage}</p> : null}
      </div>
    </main>
  );
}
