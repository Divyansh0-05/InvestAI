"use client";

type BankCardProps = {
  name: string;
  rate_1yr: number;
  trust_score: number;
};

function getTrustStars(score: number) {
  return "\u2605".repeat(score) + "\u2606".repeat(5 - score);
}

export default function BankCard({
  name,
  rate_1yr,
  trust_score,
}: BankCardProps) {
  return (
    <div className="w-full max-w-[240px] rounded-2xl bg-white p-3 shadow-sm ring-1 ring-slate-100">
      <p className="text-sm font-semibold text-slate-900">{name}</p>
      <p className="mt-1 text-2xl font-bold text-[#25D366]">{rate_1yr.toFixed(2)}%</p>
      <p className="mt-1 text-sm tracking-wide text-[#e0a100]">
        {getTrustStars(trust_score)}
      </p>
    </div>
  );
}
