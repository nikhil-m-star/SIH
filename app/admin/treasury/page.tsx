import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/auth";
import ConfigForm from "./ConfigForm";
import { formatDate, formatCurrency } from "@/lib/format";

export default async function AdminTreasuryPage() {
  await requireRole("ADMIN");

  const [payments, transactions, config] = await Promise.all([
    prisma.payment.aggregate({
      where: { status: "COMPLETED" },
      _sum: {
        amount: true,
        workerAmount: true,
        welfareFund: true,
        trainingFund: true,
        cooperativeShare: true,
      },
    }),
    prisma.cooperativeTransaction.findMany({
      orderBy: { createdAt: "desc" },
      take: 50,
      include: { payment: { include: { booking: { include: { service: true } } } } },
    }),
    prisma.cooperativeConfig.findFirst({ orderBy: { createdAt: "desc" } }),
  ]);

  const sums = payments._sum;

  const treasuryItems = [
    { label: "Total Platform Volume", value: sums.amount || 0, color: "text-white" },
    { label: "Worker Direct Payouts", value: sums.workerAmount || 0, color: "text-emerald-400" },
    { label: "Welfare Fund Reserve", value: sums.welfareFund || 0, color: "text-emerald-400/80" },
    { label: "Training Fund Reserve", value: sums.trainingFund || 0, color: "text-emerald-400/60" },
    { label: "Cooperative Retained Share", value: sums.cooperativeShare || 0, color: "text-neutral-400" },
  ];

  const typeLabels: Record<string, string> = {
    WORKER_PAYOUT: "Worker Payout",
    WELFARE_FUND: "Welfare Allocation",
    TRAINING_FUND: "Training Allocation",
    COOPERATIVE_SHARE: "Cooperative Reserve",
  };

  const typeStyles: Record<string, string> = {
    WORKER_PAYOUT: "text-emerald-400",
    WELFARE_FUND: "text-emerald-400/80",
    TRAINING_FUND: "text-emerald-400/60",
    COOPERATIVE_SHARE: "text-neutral-400",
  };

  return (
    <div className="space-y-12">
      <div>
        <h1 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight">Cooperative Treasury</h1>
        <p className="text-base text-neutral-400 mt-2">Fund balances, distribution rules & audit trail</p>
      </div>

      {/* Overview Cards */}
      <div className="bg-[#0e0e0e] rounded-3xl p-8 space-y-4 text-base">
        {treasuryItems.map((item) => (
          <div key={item.label} className="flex items-center justify-between py-1.5">
            <span className="text-neutral-400 font-medium">{item.label}</span>
            <span className={`font-extrabold text-lg ${item.color}`}>
              ₹{formatCurrency(item.value)}
            </span>
          </div>
        ))}
      </div>

      {/* Config Form */}
      <div className="space-y-4">
        <h2 className="text-xl font-extrabold text-white">
          Fund Distribution Policy
        </h2>
        <ConfigForm
          config={{
            workerSharePct: config?.workerSharePct ?? 90,
            welfarePct: config?.welfarePct ?? 5,
            trainingPct: config?.trainingPct ?? 2,
            cooperativePct: config?.cooperativePct ?? 3,
          }}
        />
      </div>

      {/* Transaction History */}
      <div className="space-y-4">
        <h2 className="text-xl font-extrabold text-white">
          Ledger Transactions
        </h2>
        {transactions.length === 0 ? (
          <div className="text-center py-20 bg-[#0e0e0e] rounded-3xl text-base text-neutral-500">
            <p>No transaction history recorded.</p>
          </div>
        ) : (
          <div className="bg-[#0e0e0e] rounded-3xl overflow-x-auto p-4">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-[#1c1c1c] text-neutral-400">
                  <th className="py-4 px-5 font-extrabold uppercase tracking-widest text-xs">Allocation</th>
                  <th className="py-4 px-5 font-extrabold uppercase tracking-widest text-xs">Amount</th>
                  <th className="py-4 px-5 font-extrabold uppercase tracking-widest text-xs">Service</th>
                  <th className="py-4 px-5 font-extrabold uppercase tracking-widest text-xs">Timestamp</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#161616]">
                {transactions.map((tx) => (
                  <tr key={tx.id} className="hover:bg-[#161616] transition-colors">
                    <td className={`py-4 px-5 font-bold ${typeStyles[tx.type]}`}>
                      {typeLabels[tx.type]}
                    </td>
                    <td className="py-4 px-5 font-extrabold text-white text-base">
                      ₹{tx.amount}
                    </td>
                    <td className="py-4 px-5 text-neutral-300 font-medium">
                      {tx.payment.booking?.service?.name || "—"}
                    </td>
                    <td className="py-4 px-5 text-neutral-500 text-xs">
                      {formatDate(tx.createdAt)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
