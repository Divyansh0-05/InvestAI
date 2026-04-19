import { headers } from "next/headers";
import { Star } from "lucide-react";

type Bank = {
  name: string;
  rate_1yr: number;
  rate_3yr: number;
  trust_score: number;
};

function getBadge(bank: Bank, index: number, banks: Bank[]) {
  const highestRate = Math.max(...banks.map((item) => item.rate_1yr));
  const highestTrust = Math.max(...banks.map((item) => item.trust_score));

  if (bank.rate_1yr === highestRate) {
    return { label: "Best Rate", className: "bg-amber-50 text-amber-700 border border-amber-200" };
  }

  if (index < 2 && bank.trust_score === highestTrust) {
    return { label: "Most Trusted", className: "bg-blue-50 text-blue-700 border border-blue-200" };
  }

  return null;
}

async function getBanks() {
  const headerStore = headers();
  const host = headerStore.get("host") ?? "localhost:3000";
  const protocol = headerStore.get("x-forwarded-proto") ?? "http";
  const response = await fetch(`${protocol}://${host}/api/banks`, {
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error("Failed to fetch bank data.");
  }

  const banks = (await response.json()) as Bank[];
  return [...banks].sort((a, b) => b.trust_score - a.trust_score);
}

export default async function BanksPage() {
  const banks = await getBanks();

  return (
    <main className="min-h-screen bg-[#F7FDF9] px-4 py-8 text-[#111827]">
      <div className="mx-auto w-full max-w-5xl">
        <div className="mb-8">
          <p className="text-xs font-semibold uppercase tracking-widest text-green-600">
            investAI
          </p>
          <h1 className="mt-4 text-4xl font-bold text-[#111827]">Bank FD Comparison</h1>
          <p className="mt-3 text-sm text-gray-500">
            Compare indicative fixed deposit rates and trust scores in one place.
          </p>
        </div>

        {/* Mobile View */}
        <div className="grid gap-4 sm:hidden">
          {banks.map((bank, index) => {
            const badge = getBadge(bank, index, banks);

            return (
              <div
                key={bank.name}
                className="rounded-2xl border border-[#E2F0E8] bg-white p-5 shadow-[0_2px_12px_rgba(22,163,74,0.08)]"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <p className="text-lg font-bold text-[#111827]">{bank.name}</p>
                    {badge ? (
                      <span className={`mt-2 inline-flex rounded-full px-3 py-1 text-xs font-semibold ${badge.className}`}>
                        {badge.label}
                      </span>
                    ) : null}
                  </div>
                  <div className="rounded-xl bg-green-50 px-4 py-3 text-right">
                    <p className="text-[11px] font-medium uppercase tracking-widest text-gray-600">
                      1-Year Rate
                    </p>
                    <p className="mt-2 text-2xl font-bold text-green-600">
                      {bank.rate_1yr.toFixed(2)}%
                    </p>
                  </div>
                </div>
                <div className="mt-4 grid grid-cols-2 gap-3 rounded-xl bg-[#F7FDF9] p-4">
                  <div>
                    <p className="text-xs font-medium uppercase tracking-widest text-gray-600">
                      3-Year Rate
                    </p>
                    <p className="mt-2 text-xl font-bold text-green-600">
                      {bank.rate_3yr.toFixed(2)}%
                    </p>
                  </div>
                  <div>
                    <p className="text-xs font-medium uppercase tracking-widest text-gray-600">
                      Trust Score
                    </p>
                    <div className="mt-2 flex gap-1">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star
                          key={i}
                          className={`h-4 w-4 ${
                            i < bank.trust_score ? "fill-green-500 text-green-500" : "text-gray-200"
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Desktop View */}
        <div className="hidden overflow-hidden rounded-2xl border border-[#E2F0E8] bg-white shadow-[0_2px_12px_rgba(22,163,74,0.08)] sm:block">
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead className="bg-green-50 text-[#111827]">
                <tr>
                  <th className="px-6 py-4 font-semibold">Bank</th>
                  <th className="px-6 py-4 font-semibold">1-yr Rate</th>
                  <th className="px-6 py-4 font-semibold">3-yr Rate</th>
                  <th className="px-6 py-4 font-semibold">Trust Score</th>
                </tr>
              </thead>
              <tbody>
                {banks.map((bank, index) => {
                  const badge = getBadge(bank, index, banks);

                  return (
                    <tr
                      key={bank.name}
                      className="border-t border-[#E2F0E8] bg-white transition hover:bg-green-50/50"
                    >
                      <td className="px-6 py-4 font-medium text-[#111827]">
                        <div className="flex items-center gap-3">
                          <span>{bank.name}</span>
                          {badge ? (
                            <span className={`rounded-full px-3 py-1 text-xs font-semibold ${badge.className}`}>
                              {badge.label}
                            </span>
                          ) : null}
                        </div>
                      </td>
                      <td className="px-6 py-4 font-semibold text-green-600">
                        {bank.rate_1yr.toFixed(2)}%
                      </td>
                      <td className="px-6 py-4 font-semibold text-green-600">
                        {bank.rate_3yr.toFixed(2)}%
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex gap-1">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <Star
                              key={i}
                              className={`h-4 w-4 ${
                                i < bank.trust_score ? "fill-green-500 text-green-500" : "text-gray-200"
                              }`}
                            />
                          ))}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        <p className="mt-6 text-sm text-gray-500">
          <span className="font-medium">Note:</span> Rates are indicative. Confirm with your bank before investing.
        </p>
      </div>
    </main>
  );
}
