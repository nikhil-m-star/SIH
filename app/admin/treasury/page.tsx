import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/auth";
import ConfigForm from "./ConfigForm";
import { ServiceIcon } from "@/components/ServiceIcon";

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
    { label: "Total Revenue Processed", value: sums.amount || 0, color: "text-white" },
    { label: "Worker Payouts", value: sums.workerAmount || 0, color: "text-emerald-400" },
    { label: "Welfare Fund Balance", value: sums.welfareFund || 0, color: "text-blue-400" },
    { label: "Training Fund Balance", value: sums.trainingFund || 0, color: "text-purple-400" },
    { label: "Cooperative Retained Share", value: sums.cooperativeShare || 0, color: "text-zinc-300" },
  ];

  const typeLabels: Record<string, string> = {
    WORKER_PAYOUT: "Worker Payout",
    WELFARE_FUND: "Welfare Allocation",
    TRAINING_FUND: "Training Allocation",
    COOPERATIVE_SHARE: "Cooperative Share",
  };

  const typeStyles: Record<string, string> = {
    WORKER_PAYOUT: "text-emerald-400",
    WELFARE_FUND: "text-blue-400",
    TRAINING_FUND: "text-purple-400",
    COOPERATIVE_SHARE: "text-zinc-400",
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-white tracking-tight">Cooperative Treasury</h1>
        <p className="text-xs text-zinc-400 mt-0.5">Fund balances, distribution rules & audit trail</p>
      </div>

      {/* Overview */}
      <div className="bg-zinc-900/60 border border-zinc-800/80 rounded-xl p-4 space-y-2.5 text-xs">
        {treasuryItems.map((item) => (
          <div key={item.label} className="flex items-center justify-between">
            <span className="text-zinc-400">{item.label}</span>
            <span className={`font-mono font-semibold ${item.color}`}>
              ₹{item.value.toLocaleString()}
            </span>
          </div>
        ))}
      </div>

      {/* Config Form */}
      <div className="space-y-3">
        <h2 className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">
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
      <div className="space-y-3">
        <h2 className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">
          Ledger Transactions
        </h2>
        {transactions.length === 0 ? (
          <div className="text-center py-8 bg-zinc-900/40 rounded-xl border border-zinc-800 text-xs text-zinc-500">
            <p>No transaction history recorded yet.</p>
          </div>
        ) : (
          <div className="bg-zinc-900/60 border border-zinc-800/80 rounded-xl overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-zinc-800 text-zinc-400">
                  <th className="py-2.5 px-3 font-semibold">Allocation</th>
                  <th className="py-2.5 px-3 font-semibold">Amount</th>
                  <th className="py-2.5 px-3 font-semibold">Service</th>
                  <th className="py-2.5 px-3 font-semibold">Timestamp</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/60">
                {transactions.map((tx) => (
                  <tr key={tx.id} className="hover:bg-zinc-800/30 transition-colors">
                    <td className={`py-2.5 px-3 font-medium ${typeStyles[tx.type]}`}>
                      {typeLabels[tx.type]}
                    </td>
                    <td className="py-2.5 px-3 font-mono font-medium text-white">
                      ₹{tx.amount}
                    </td>
                    <td className="py-2.5 px-3 text-zinc-400">
                      {tx.payment.booking?.service?.name || "—"}
                    </td>
                    <td className="py-2.5 px-3 text-zinc-500 font-mono text-[11px]">
                      {new Date(tx.createdAt).toLocaleDateString()}
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
