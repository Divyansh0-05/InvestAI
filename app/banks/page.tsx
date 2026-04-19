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
    <main className="min-h-screen bg-[#f4f7f1] px-4 py-8 text-slate-900">
      <div className="mx-auto w-full max-w-5xl">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-slate-900">Bank FD Comparison</h1>
          <p className="mt-2 text-sm text-slate-600">
            Compare indicative fixed deposit rates and trust scores in one place.
          </p>
        </div>

        <div className="overflow-hidden rounded-3xl border border-[#d8e5d3] bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead className="bg-[#e8f5e9] text-slate-700">
                <tr>
                  <th className="px-4 py-4 font-semibold">Bank</th>
                  <th className="px-4 py-4 font-semibold">1-yr Rate</th>
                  <th className="px-4 py-4 font-semibold">3-yr Rate</th>
                  <th className="px-4 py-4 font-semibold">Trust</th>
                </tr>
              </thead>
              <tbody>
                {banks.map((bank, index) => (
                  <tr
                    key={bank.name}
                    className={
                      index < 2
                        ? "bg-[#edf9ee]"
                        : "border-t border-slate-100 bg-white"
                    }
                  >
                    <td className="px-4 py-4 font-medium text-slate-900">{bank.name}</td>
                    <td className="px-4 py-4 text-[#118a43]">{bank.rate_1yr.toFixed(2)}%</td>
                    <td className="px-4 py-4 text-[#118a43]">{bank.rate_3yr.toFixed(2)}%</td>
                    <td className="px-4 py-4 text-base tracking-wide text-[#e0a100]">
                      {getTrustStars(bank.trust_score)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <p className="mt-4 text-sm text-slate-600">
          Rates are indicative. Confirm with your bank before investing.
        </p>
      </div>
    </main>
  );
}
