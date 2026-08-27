import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/auth";
import ConfigForm from "./ConfigForm";

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
    { label: "Total Platform Revenue", value: sums.amount || 0, color: "text-white" },
    { label: "Worker Direct Payouts", value: sums.workerAmount || 0, color: "text-emerald-400" },
    { label: "Welfare Fund Balance", value: sums.welfareFund || 0, color: "text-blue-400" },
    { label: "Training Fund Balance", value: sums.trainingFund || 0, color: "text-purple-400" },
    { label: "Cooperative Retained Reserve", value: sums.cooperativeShare || 0, color: "text-zinc-300" },
  ];

  const typeLabels: Record<string, string> = {
    WORKER_PAYOUT: "Worker Payout",
    WELFARE_FUND: "Welfare Allocation",
    TRAINING_FUND: "Training Allocation",
    COOPERATIVE_SHARE: "Cooperative Reserve",
  };

  const typeStyles: Record<string, string> = {
    WORKER_PAYOUT: "text-emerald-400",
    WELFARE_FUND: "text-blue-400",
    TRAINING_FUND: "text-purple-400",
    COOPERATIVE_SHARE: "text-zinc-400",
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-extrabold text-white tracking-tight">Cooperative Treasury</h1>
        <p className="text-xs text-zinc-400 mt-1">Fund balances, distribution rules & audit trail</p>
      </div>

      {/* Overview Cards */}
      <div className="bg-[#12131d] rounded-2xl p-6 space-y-3 text-xs">
        {treasuryItems.map((item) => (
          <div key={item.label} className="flex items-center justify-between py-1">
            <span className="text-zinc-400 font-medium">{item.label}</span>
            <span className={`font-mono font-bold text-sm ${item.color}`}>
              ₹{item.value.toLocaleString()}
            </span>
          </div>
        ))}
      </div>

      {/* Config Form */}
      <div className="space-y-3">
        <h2 className="text-xs font-bold text-zinc-400 uppercase tracking-wider">
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
        <h2 className="text-xs font-bold text-zinc-400 uppercase tracking-wider">
          Ledger Transactions
        </h2>
        {transactions.length === 0 ? (
          <div className="text-center py-16 bg-[#12131d] rounded-2xl text-xs text-zinc-500">
            <p>No transaction history recorded.</p>
          </div>
        ) : (
          <div className="bg-[#12131d] rounded-2xl overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-[#1c1e2b] text-zinc-400">
                  <th className="py-3.5 px-4 font-bold uppercase tracking-wider text-[10px]">Allocation</th>
                  <th className="py-3.5 px-4 font-bold uppercase tracking-wider text-[10px]">Amount</th>
                  <th className="py-3.5 px-4 font-bold uppercase tracking-wider text-[10px]">Service</th>
                  <th className="py-3.5 px-4 font-bold uppercase tracking-wider text-[10px]">Timestamp</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#181a26]">
                {transactions.map((tx) => (
                  <tr key={tx.id} className="hover:bg-[#181a27] transition-colors">
                    <td className={`py-3.5 px-4 font-bold ${typeStyles[tx.type]}`}>
                      {typeLabels[tx.type]}
                    </td>
                    <td className="py-3.5 px-4 font-mono font-bold text-white">
                      ₹{tx.amount}
                    </td>
                    <td className="py-3.5 px-4 text-zinc-400">
                      {tx.payment.booking?.service?.name || "—"}
                    </td>
                    <td className="py-3.5 px-4 text-zinc-500 font-mono text-[11px]">
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
