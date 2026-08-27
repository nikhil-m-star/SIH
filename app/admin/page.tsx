import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/auth";

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
    { label: "Total Workers", value: totalWorkers, icon: "👷" },
    { label: "Total Customers", value: totalCustomers, icon: "👥" },
    { label: "Active Bookings", value: activeBookings, icon: "📋" },
    { label: "Completed", value: completedBookings, icon: "✅" },
  ];

  const financials = [
    {
      label: "Total Revenue",
      value: `₹${(sums.amount || 0).toLocaleString()}`,
      color: "text-gray-900",
    },
    {
      label: "Worker Payouts",
      value: `₹${(sums.workerAmount || 0).toLocaleString()}`,
      color: "text-[var(--color-primary)]",
    },
    {
      label: "Welfare Fund",
      value: `₹${(sums.welfareFund || 0).toLocaleString()}`,
      color: "text-blue-600",
    },
    {
      label: "Training Fund",
      value: `₹${(sums.trainingFund || 0).toLocaleString()}`,
      color: "text-purple-600",
    },
    {
      label: "Cooperative Share",
      value: `₹${(sums.cooperativeShare || 0).toLocaleString()}`,
      color: "text-orange-600",
    },
  ];

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>

      {/* Stats Grid */}
      <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-3">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="bg-white border border-gray-200 rounded-xl p-4"
          >
            <div className="flex items-center gap-2">
              <span className="text-xl">{stat.icon}</span>
              <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
            </div>
            <p className="text-xs text-gray-500 mt-1">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Financials */}
      <div className="mt-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-3">
          Cooperative Finances
        </h2>
        <div className="bg-white border border-gray-200 rounded-xl p-5 space-y-3">
          {financials.map((item) => (
            <div key={item.label} className="flex items-center justify-between">
              <span className="text-sm text-gray-500">{item.label}</span>
              <span className={`text-sm font-semibold ${item.color}`}>
                {item.value}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
