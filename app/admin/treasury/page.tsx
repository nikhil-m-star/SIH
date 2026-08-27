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
    { label: "Total Collected", value: sums.amount || 0, color: "text-gray-900" },
    { label: "Worker Earnings", value: sums.workerAmount || 0, color: "text-[var(--color-primary)]" },
    { label: "Welfare Fund", value: sums.welfareFund || 0, color: "text-blue-600" },
    { label: "Training Fund", value: sums.trainingFund || 0, color: "text-purple-600" },
    { label: "Cooperative Share", value: sums.cooperativeShare || 0, color: "text-orange-600" },
  ];

  const typeLabels: Record<string, string> = {
    WORKER_PAYOUT: "Worker Payout",
    WELFARE_FUND: "Welfare Fund",
    TRAINING_FUND: "Training Fund",
    COOPERATIVE_SHARE: "Cooperative Share",
  };

  const typeStyles: Record<string, string> = {
    WORKER_PAYOUT: "text-[var(--color-primary)]",
    WELFARE_FUND: "text-blue-600",
    TRAINING_FUND: "text-purple-600",
    COOPERATIVE_SHARE: "text-orange-600",
  };

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900">
        Cooperative Treasury
      </h1>

      {/* Summary */}
      <div className="mt-6 bg-white border border-gray-200 rounded-xl p-5 space-y-3">
        {treasuryItems.map((item) => (
          <div key={item.label} className="flex items-center justify-between">
            <span className="text-sm text-gray-500">{item.label}</span>
            <span className={`text-sm font-semibold ${item.color}`}>
              ₹{item.value.toLocaleString()}
            </span>
          </div>
        ))}
      </div>

      {/* Config */}
      <div className="mt-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-3">
          Fund Distribution
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
      <div className="mt-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-3">
          Transaction History
        </h2>
        {transactions.length === 0 ? (
          <div className="text-center py-8 bg-white rounded-xl border border-gray-200">
            <p className="text-gray-500 text-sm">No transactions yet</p>
          </div>
        ) : (
          <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50">
                  <th className="text-left py-2 px-3 text-xs font-semibold text-gray-500">
                    Type
                  </th>
                  <th className="text-left py-2 px-3 text-xs font-semibold text-gray-500">
                    Amount
                  </th>
                  <th className="text-left py-2 px-3 text-xs font-semibold text-gray-500">
                    Service
                  </th>
                  <th className="text-left py-2 px-3 text-xs font-semibold text-gray-500">
                    Date
                  </th>
                </tr>
              </thead>
              <tbody>
                {transactions.map((tx) => (
                  <tr
                    key={tx.id}
                    className="border-b border-gray-50 hover:bg-gray-50"
                  >
                    <td className={`py-2 px-3 font-medium ${typeStyles[tx.type]}`}>
                      {typeLabels[tx.type]}
                    </td>
                    <td className="py-2 px-3">₹{tx.amount}</td>
                    <td className="py-2 px-3 text-gray-500">
                      {tx.payment.booking?.service?.name || "—"}
                    </td>
                    <td className="py-2 px-3 text-gray-500 text-xs">
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
