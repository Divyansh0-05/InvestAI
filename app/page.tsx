import Link from "next/link";
import { MessageCircle, Camera, Building2, ArrowRight } from "lucide-react";
import BankCard from "@/components/BankCard";

export default function HomePage() {
  return (
    <main className="min-h-screen bg-[#F7FDF9] px-4 pb-12 pt-6 text-[#111827]">
      <div className="mx-auto flex min-h-[calc(100vh-3rem)] w-full max-w-5xl flex-col justify-center">
        {/* Hero Section */}
        <section className="relative rounded-[32px] border border-[#E2F0E8] bg-white px-6 py-8 shadow-[0_2px_12px_rgba(22,163,74,0.08)] before:absolute before:inset-0 before:rounded-[32px] before:bg-[radial-gradient(ellipse_at_top,#dcfce7_0%,transparent_70%)] before:pointer-events-none sm:px-12 sm:py-12">
          <div className="relative z-10 max-w-2xl">
            <p className="text-xs font-semibold uppercase tracking-widest text-green-600">
              investAI
            </p>
            <h1 className="mt-6 font-['Plus_Jakarta_Sans'] text-5xl font-bold leading-tight text-gray-900">
              Namaste 🙏
            </h1>
            <p className="mt-4 text-xl font-medium text-gray-700">
              Apna paisa samjho, apna future banao
            </p>
            <p className="mt-3 max-w-xl text-base leading-7 text-gray-500">
              FD rates, tax calculator, aur financial advice - sab ek jagah
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href="/chat"
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-green-600 px-6 py-3 text-sm font-medium text-white shadow-sm transition hover:bg-green-700 hover:-translate-y-0.5"
              >
                Chat Shuru Karo
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/banks"
                className="inline-flex items-center justify-center gap-2 rounded-xl border-2 border-green-600 bg-white px-6 py-3 text-sm font-medium text-green-700 transition hover:bg-green-50"
              >
                FD Rates Dekho
              </Link>
            </div>
          </div>
        </section>

        {/* Feature Cards */}
        <section className="mt-8 grid gap-4 sm:grid-cols-3">
          <div className="group rounded-2xl border border-[#E2F0E8] bg-white p-5 shadow-[0_2px_12px_rgba(22,163,74,0.08)] transition-all duration-200 hover:-translate-y-1 hover:shadow-md">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-green-50">
              <MessageCircle className="h-6 w-6 text-green-600" />
            </div>
            <h2 className="mt-4 text-lg font-bold text-[#111827]">Hinglish Chat</h2>
            <p className="mt-2 text-sm leading-6 text-[#6B7280]">
              Simple baat-cheet mein savings, FD, tax aur goals samjho.
            </p>
          </div>
          <div className="group rounded-2xl border border-[#E2F0E8] bg-white p-5 shadow-[0_2px_12px_rgba(22,163,74,0.08)] transition-all duration-200 hover:-translate-y-1 hover:shadow-md">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-green-50">
              <Camera className="h-6 w-6 text-green-600" />
            </div>
            <h2 className="mt-4 text-lg font-bold text-[#111827]">Receipt Scanner</h2>
            <p className="mt-2 text-sm leading-6 text-[#6B7280]">
              FD receipts ya bank slips scan karke details jaldi nikalo.
            </p>
          </div>
          <div className="group rounded-2xl border border-[#E2F0E8] bg-white p-5 shadow-[0_2px_12px_rgba(22,163,74,0.08)] transition-all duration-200 hover:-translate-y-1 hover:shadow-md">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-green-50">
              <Building2 className="h-6 w-6 text-green-600" />
            </div>
            <h2 className="mt-4 text-lg font-bold text-[#111827]">FD Comparison</h2>
            <p className="mt-2 text-sm leading-6 text-[#6B7280]">
              Banks ko rates aur trust ke hisaab se side-by-side dekho.
            </p>
          </div>
        </section>

        {/* Popular FD Picks Section */}
        <section className="mt-8 rounded-3xl bg-green-50/50 border border-[#E2F0E8] p-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-xl font-bold text-[#111827]">Popular FD picks</h2>
              <p className="mt-2 text-sm text-[#6B7280]">
                Quick snapshot for Indian banks users compare most often.
              </p>
            </div>
            <Link href="/banks" className="text-sm font-semibold text-green-700 hover:text-green-800 transition">
              Full comparison →
            </Link>
          </div>
          <div className="mt-6 grid gap-4 sm:grid-cols-3">
            <BankCard name="SBI" rate_1yr={6.8} trust_score={5} />
            <BankCard name="HDFC" rate_1yr={7.1} trust_score={5} />
            <BankCard name="Kotak" rate_1yr={7.25} trust_score={4} />
          </div>
        </section>
      </div>
    </main>
  );
}
