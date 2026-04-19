import Link from "next/link";
import BankCard from "@/components/BankCard";

export default function HomePage() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-green-50 to-white px-4 pb-12 pt-6 text-[#111827]">
      <div className="mx-auto flex min-h-[calc(100vh-3rem)] w-full max-w-5xl flex-col justify-center">
        <section className="rounded-[32px] border border-white/70 bg-white/80 px-6 py-8 shadow-[0_20px_60px_rgba(22,163,74,0.10)] backdrop-blur-sm sm:px-10 sm:py-12">
          <div className="max-w-2xl">
            <p className="text-sm font-medium uppercase tracking-[0.24em] text-green-700">
              investAI
            </p>
            <h1 className="mt-4 font-['Plus_Jakarta_Sans'] text-4xl font-bold leading-tight text-[#111827] sm:text-5xl">
              Namaste {"\u{1F64F}"}
            </h1>
            <p className="mt-4 text-xl font-semibold text-[#111827]">
              Apna paisa samjho, apna future banao
            </p>
            <p className="mt-3 max-w-xl text-base leading-7 text-[#6B7280]">
              FD rates, tax calculator, aur financial advice - sab ek jagah
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href="/chat"
                className="inline-flex items-center justify-center rounded-full bg-[#16A34A] px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-[#15803D]"
              >
                Chat Shuru Karo {"\u2192"}
              </Link>
              <Link
                href="/banks"
                className="inline-flex items-center justify-center rounded-full border border-[#E5E7EB] bg-white px-6 py-3 text-sm font-semibold text-[#111827] transition hover:border-green-200 hover:text-green-700"
              >
                FD Rates Dekho
              </Link>
            </div>
          </div>
        </section>

        <section className="mt-8 grid gap-4 sm:grid-cols-3">
          <div className="rounded-2xl border border-[#E5E7EB] bg-white p-5 shadow-sm">
            <div className="text-2xl">{"\u{1F4AC}"}</div>
            <h2 className="mt-3 text-lg font-bold text-[#111827]">Hinglish Chat</h2>
            <p className="mt-2 text-sm leading-6 text-[#6B7280]">
              Simple baat-cheet mein savings, FD, tax aur goals samjho.
            </p>
          </div>
          <div className="rounded-2xl border border-[#E5E7EB] bg-white p-5 shadow-sm">
            <div className="text-2xl">{"\u{1F4F7}"}</div>
            <h2 className="mt-3 text-lg font-bold text-[#111827]">Receipt Scanner</h2>
            <p className="mt-2 text-sm leading-6 text-[#6B7280]">
              FD receipts ya bank slips scan karke details jaldi nikalo.
            </p>
          </div>
          <div className="rounded-2xl border border-[#E5E7EB] bg-white p-5 shadow-sm">
            <div className="text-2xl">{"\u{1F3E6}"}</div>
            <h2 className="mt-3 text-lg font-bold text-[#111827]">FD Comparison</h2>
            <p className="mt-2 text-sm leading-6 text-[#6B7280]">
              Banks ko rates aur trust ke hisaab se side-by-side dekho.
            </p>
          </div>
        </section>

        <section className="mt-8 rounded-[28px] border border-[#dcfce7] bg-[#f0fdf4] p-5 shadow-sm">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-xl font-bold text-[#111827]">Popular FD picks</h2>
              <p className="mt-2 text-sm text-[#6B7280]">
                Quick snapshot for Indian banks users compare most often.
              </p>
            </div>
            <Link href="/banks" className="text-sm font-semibold text-green-700">
              Full comparison {"\u2192"}
            </Link>
          </div>
          <div className="mt-5 grid gap-4 sm:grid-cols-3">
            <BankCard name="SBI" rate_1yr={6.8} trust_score={5} />
            <BankCard name="HDFC" rate_1yr={7.1} trust_score={5} />
            <BankCard name="Kotak" rate_1yr={7.25} trust_score={4} />
          </div>
        </section>
      </div>
    </main>
  );
}
