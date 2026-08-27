import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/auth";
import { Users, UserCheck, ClipboardList, CheckCircle2 } from "lucide-react";

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
    { label: "Total Gross Volume", value: `₹${(sums.amount || 0).toLocaleString()}`, color: "text-white" },
    { label: "Worker Payouts (90%)", value: `₹${(sums.workerAmount || 0).toLocaleString()}`, color: "text-emerald-400" },
    { label: "Welfare Fund (5%)", value: `₹${(sums.welfareFund || 0).toLocaleString()}`, color: "text-blue-400" },
    { label: "Training Fund (2%)", value: `₹${(sums.trainingFund || 0).toLocaleString()}`, color: "text-purple-400" },
    { label: "Cooperative Reserve (3%)", value: `₹${(sums.cooperativeShare || 0).toLocaleString()}`, color: "text-neutral-400" },
  ];

  return (
    <div className="space-y-12">
      <div>
        <h1 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight">Cooperative Administration</h1>
        <p className="text-base text-neutral-400 mt-2">Platform overview and transparent fund accounting</p>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div
              key={stat.label}
              className="bg-[#0e0e0e] rounded-3xl p-8"
            >
              <div className="flex items-center justify-between text-neutral-500 mb-2">
                <span className="text-xs font-extrabold uppercase tracking-widest">{stat.label}</span>
                <Icon className="w-5 h-5 text-neutral-400" />
              </div>
              <p className="text-3xl sm:text-4xl font-mono font-black text-white mt-3">
                {stat.value}
              </p>
            </div>
          );
        })}
      </div>

      {/* Treasury Breakdown */}
      <div className="space-y-4">
        <h2 className="text-xl font-extrabold text-white">
          Treasury Breakdown
        </h2>
        <div className="bg-[#0e0e0e] rounded-3xl p-8 space-y-4 text-base">
          {financials.map((item) => (
            <div key={item.label} className="flex items-center justify-between py-1">
              <span className="text-neutral-400 font-medium">{item.label}</span>
              <span className={`font-mono font-extrabold text-lg ${item.color}`}>
                {item.value}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
