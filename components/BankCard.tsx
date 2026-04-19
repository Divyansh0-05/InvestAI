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
    <div className="w-full rounded-2xl bg-white p-4 shadow-sm ring-2 ring-green-100 transition-shadow duration-200 hover:shadow-md">
      <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#6B7280]">
        {name}
      </p>
      <p className="mt-2 text-2xl font-bold text-[#16A34A]">{rate_1yr.toFixed(2)}%</p>
      <p className="mt-2 text-sm tracking-wide text-[#16A34A]">
        {getTrustStars(trust_score)}
      </p>
    </div>
  );
}
