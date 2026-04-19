"use client";

import { Star } from "lucide-react";

type BankCardProps = {
  name: string;
  rate_1yr: number;
  trust_score: number;
};

export default function BankCard({
  name,
  rate_1yr,
  trust_score,
}: BankCardProps) {
  return (
    <div className="w-full rounded-2xl bg-white border border-[#E2F0E8] p-5 shadow-[0_2px_12px_rgba(22,163,74,0.08)] transition-all duration-200 hover:-translate-y-1 hover:shadow-md">
      <p className="text-xs font-semibold uppercase tracking-widest text-gray-600">
        {name}
      </p>
      <p className="mt-3 text-3xl font-bold text-green-600">{rate_1yr.toFixed(2)}%</p>
      <div className="mt-3 flex gap-1">
        {Array.from({ length: 5 }).map((_, i) => (
          <Star
            key={i}
            className={`h-4 w-4 ${
              i < trust_score ? "fill-green-500 text-green-500" : "text-gray-200"
            }`}
          />
        ))}
      </div>
    </div>
  );
}
