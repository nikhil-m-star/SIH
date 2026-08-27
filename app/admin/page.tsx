import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/auth";
import { Users, UserCheck, ClipboardList, CheckCircle2, Landmark } from "lucide-react";

export default async function AdminDashboardPage() {
  await requireRole("ADMIN");

  const [
    totalWorkers,
    totalCustomers,
    activeBookings,
    completedBookings,
    totalPayments,
  ] = await Promise.all([
    prisma.user.count({ where: { role: "WORKER" } }),
    prisma.user.count({ where: { role: "CUSTOMER" } }),
    prisma.booking.count({
      where: { status: { in: ["PENDING", "ACCEPTED", "IN_PROGRESS"] } },
    }),
    prisma.booking.count({ where: { status: "COMPLETED" } }),
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
  ]);

  const sums = totalPayments._sum;

  const stats = [
    { label: "Total Workers", value: totalWorkers, icon: Users },
    { label: "Total Customers", value: totalCustomers, icon: UserCheck },
    { label: "Active Jobs", value: activeBookings, icon: ClipboardList },
    { label: "Completed", value: completedBookings, icon: CheckCircle2 },
  ];

  const financials = [
    { label: "Total Gross Revenue", value: `₹${(sums.amount || 0).toLocaleString()}`, color: "text-white" },
    { label: "Worker Payouts (90%)", value: `₹${(sums.workerAmount || 0).toLocaleString()}`, color: "text-emerald-400" },
    { label: "Welfare Fund (5%)", value: `₹${(sums.welfareFund || 0).toLocaleString()}`, color: "text-blue-400" },
    { label: "Training Fund (2%)", value: `₹${(sums.trainingFund || 0).toLocaleString()}`, color: "text-purple-400" },
    { label: "Cooperative Share (3%)", value: `₹${(sums.cooperativeShare || 0).toLocaleString()}`, color: "text-zinc-300" },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-white tracking-tight">Cooperative Administration</h1>
        <p className="text-xs text-zinc-400 mt-0.5">Platform overview and fund accounting</p>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div
              key={stat.label}
              className="bg-zinc-900/60 border border-zinc-800/80 rounded-xl p-4"
            >
              <div className="flex items-center justify-between text-zinc-500 mb-1">
                <span className="text-xs">{stat.label}</span>
                <Icon className="w-4 h-4" />
              </div>
              <p className="text-xl font-mono font-bold text-white mt-1">
                {stat.value}
              </p>
            </div>
          );
        })}
      </div>

      {/* Treasury snapshot */}
      <div className="space-y-3">
        <h2 className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">
          Treasury Breakdown
        </h2>
        <div className="bg-zinc-900/60 border border-zinc-800/80 rounded-xl p-4 space-y-2.5 text-xs">
          {financials.map((item) => (
            <div key={item.label} className="flex items-center justify-between">
              <span className="text-zinc-400">{item.label}</span>
              <span className={`font-mono font-semibold ${item.color}`}>
                {item.value}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
