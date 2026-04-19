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
    <main className="flex min-h-screen items-center justify-center bg-[#F7FDF9] px-4 py-10">
      <div className="w-full max-w-md rounded-3xl border border-[#E2F0E8] bg-white p-10 shadow-[0_2px_12px_rgba(22,163,74,0.08)]">
        <div className="text-center">
          <Link href="/" className="text-sm font-semibold uppercase tracking-widest text-green-700">
            investAI 🤝
          </Link>
          <h1 className="mt-6 font-['Plus_Jakarta_Sans'] text-3xl font-bold text-[#111827]">
            Welcome back
          </h1>
          <p className="mt-3 text-sm leading-6 text-[#6B7280]">
            Login karo ya naya account banao, phir apne financial dost ke saath chat shuru karo.
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="mt-8 inline-flex w-full gap-1 rounded-full bg-gray-100 p-1">
          <button
            type="button"
            onClick={() => {
              setMode("login");
              setErrorMessage("");
              setInfoMessage("");
            }}
            className={`flex-1 rounded-full px-4 py-2.5 text-sm font-medium transition ${
              mode === "login"
                ? "bg-white text-green-700 shadow-sm"
                : "text-gray-600 hover:text-gray-900"
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
            className={`flex-1 rounded-full px-4 py-2.5 text-sm font-medium transition ${
              mode === "signup"
                ? "bg-white text-green-700 shadow-sm"
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            Sign Up
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-8 space-y-4">
          <div>
            <label htmlFor="email" className="mb-2 block text-sm font-medium text-gray-700">
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
              className="w-full rounded-xl border border-gray-200 bg-[#F7FDF9] px-4 py-3 text-sm text-[#111827] outline-none transition focus:border-green-500 focus:ring-2 focus:ring-green-500/20 placeholder:text-gray-400"
              placeholder="you@example.com"
            />
          </div>

          <div>
            <label htmlFor="password" className="mb-2 block text-sm font-medium text-gray-700">
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              required
              className="w-full rounded-xl border border-gray-200 bg-[#F7FDF9] px-4 py-3 text-sm text-[#111827] outline-none transition focus:border-green-500 focus:ring-2 focus:ring-green-500/20 placeholder:text-gray-400"
              placeholder="At least 6 characters"
            />
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full rounded-xl bg-green-600 px-4 py-3 text-base font-medium text-white transition hover:bg-green-700 disabled:cursor-not-allowed disabled:bg-gray-300"
          >
            {isSubmitting ? "Please wait..." : mode === "login" ? "Login" : "Create account"}
          </button>
        </form>

        {infoMessage ? (
          <p className="mt-4 text-sm font-medium text-green-700">{infoMessage}</p>
        ) : null}
        {errorMessage ? <p className="mt-4 text-sm text-red-600">{errorMessage}</p> : null}
      </div>
    </main>
  );
}
