import { headers } from "next/headers";

type Bank = {
  name: string;
  rate_1yr: number;
  rate_3yr: number;
  trust_score: number;
};

function getTrustStars(score: number) {
  return "\u2605".repeat(score) + "\u2606".repeat(5 - score);
}

function getBadge(bank: Bank, index: number, banks: Bank[]) {
  const highestRate = Math.max(...banks.map((item) => item.rate_1yr));
  const highestTrust = Math.max(...banks.map((item) => item.trust_score));

  if (bank.rate_1yr === highestRate) {
    return "\u2B50 Best Rate";
  }

  if (index < 2 && bank.trust_score === highestTrust) {
    return "\u{1F6E1}\uFE0F Most Trusted";
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
    <main className="min-h-screen bg-gradient-to-b from-green-50 to-white px-4 py-8 text-[#111827]">
      <div className="mx-auto w-full max-w-5xl">
        <div className="mb-6">
          <p className="text-sm font-medium uppercase tracking-[0.24em] text-green-700">
            investAI
          </p>
          <h1 className="mt-3 text-3xl font-bold text-[#111827]">Bank FD Comparison</h1>
          <p className="mt-2 text-sm text-[#6B7280]">
            Compare indicative fixed deposit rates and trust scores in one place.
          </p>
        </div>

        <div className="grid gap-4 sm:hidden">
          {banks.map((bank, index) => {
            const badge = getBadge(bank, index, banks);

            return (
              <div
                key={bank.name}
                className="rounded-3xl border border-[#E5E7EB] bg-white p-5 shadow-sm"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <p className="text-lg font-bold text-[#111827]">{bank.name}</p>
                    {badge ? (
                      <span className="mt-2 inline-flex rounded-full bg-[#F0FDF4] px-3 py-1 text-xs font-semibold text-green-700">
                        {badge}
                      </span>
                    ) : null}
                  </div>
                  <div className="rounded-2xl bg-[#F0FDF4] px-4 py-3 text-right">
                    <p className="text-[11px] font-medium uppercase tracking-[0.16em] text-[#6B7280]">
                      1-Year Rate
                    </p>
                    <p className="mt-2 text-2xl font-bold text-[#16A34A]">
                      {bank.rate_1yr.toFixed(2)}%
                    </p>
                  </div>
                </div>
                <div className="mt-4 grid grid-cols-2 gap-3 rounded-2xl bg-[#F9FAFB] p-4">
                  <div>
                    <p className="text-xs font-medium uppercase tracking-[0.16em] text-[#6B7280]">
                      3-Year Rate
                    </p>
                    <p className="mt-2 text-xl font-bold text-[#16A34A]">
                      {bank.rate_3yr.toFixed(2)}%
                    </p>
                  </div>
                  <div>
                    <p className="text-xs font-medium uppercase tracking-[0.16em] text-[#6B7280]">
                      Trust Score
                    </p>
                    <p className="mt-2 text-lg tracking-wide text-[#16A34A]">
                      {getTrustStars(bank.trust_score)}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="hidden overflow-hidden rounded-3xl border border-[#E5E7EB] bg-white shadow-sm sm:block">
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead className="bg-[#F0FDF4] text-[#111827]">
                <tr>
                  <th className="px-4 py-4 font-semibold">Bank</th>
                  <th className="px-4 py-4 font-semibold">1-yr Rate</th>
                  <th className="px-4 py-4 font-semibold">3-yr Rate</th>
                  <th className="px-4 py-4 font-semibold">Trust</th>
                </tr>
              </thead>
              <tbody>
                {banks.map((bank, index) => {
                  const badge = getBadge(bank, index, banks);

                  return (
                    <tr
                      key={bank.name}
                      className="border-t border-[#F3F4F6] bg-white transition hover:bg-[#F9FAFB]"
                    >
                      <td className="px-4 py-4 font-medium text-[#111827]">
                        <div className="flex items-center gap-3">
                          <span>{bank.name}</span>
                          {badge ? (
                            <span className="rounded-full bg-[#F0FDF4] px-3 py-1 text-xs font-semibold text-green-700">
                              {badge}
                            </span>
                          ) : null}
                        </div>
                      </td>
                      <td className="px-4 py-4 font-semibold text-[#16A34A]">
                        {bank.rate_1yr.toFixed(2)}%
                      </td>
                      <td className="px-4 py-4 font-semibold text-[#16A34A]">
                        {bank.rate_3yr.toFixed(2)}%
                      </td>
                      <td className="px-4 py-4 text-base tracking-wide text-[#16A34A]">
                        {getTrustStars(bank.trust_score)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        <p className="mt-4 text-sm text-[#6B7280]">
          Rates are indicative. Confirm with your bank before investing.
        </p>
      </div>
    </main>
  );
}
