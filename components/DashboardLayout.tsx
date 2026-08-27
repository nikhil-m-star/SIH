"use client";

import Link from "next/link";
import { useUser } from "@clerk/nextjs";
import { usePathname } from "next/navigation";
import {
  Home,
  PlusCircle,
  ClipboardList,
  BarChart3,
  Wrench,
  User,
  Users,
  Landmark,
} from "lucide-react";

interface SidebarLink {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}

const customerLinks: SidebarLink[] = [
  { href: "/customer", label: "Overview", icon: Home },
  { href: "/customer/book", label: "Book Service", icon: PlusCircle },
  { href: "/customer/bookings", label: "My Bookings", icon: ClipboardList },
];

const workerLinks: SidebarLink[] = [
  { href: "/worker", label: "Dashboard", icon: BarChart3 },
  { href: "/worker/jobs", label: "Jobs", icon: Wrench },
  { href: "/worker/profile", label: "Profile", icon: User },
];

const adminLinks: SidebarLink[] = [
  { href: "/admin", label: "Overview", icon: BarChart3 },
  { href: "/admin/workers", label: "Workers", icon: Users },
  { href: "/admin/bookings", label: "Bookings", icon: ClipboardList },
  { href: "/admin/treasury", label: "Treasury", icon: Landmark },
];

export default function DashboardLayout({
  children,
  role,
}: {
  children: React.ReactNode;
  role: "customer" | "worker" | "admin";
}) {
  const { user } = useUser();
  const pathname = usePathname();

  const links =
    role === "customer"
      ? customerLinks
      : role === "worker"
        ? workerLinks
        : adminLinks;

  const roleBadge =
    role === "customer"
      ? "Customer"
      : role === "worker"
        ? "Worker"
        : "Admin";

  return (
    <div className="flex h-[calc(100vh-64px)] bg-[#0b0c10] text-zinc-100">
      {/* Borderless Sidebar */}
      <aside className="hidden md:flex w-60 flex-col bg-[#101118] p-4 m-3 rounded-2xl">
        <div className="p-2 mb-3">
          <p className="text-xs font-semibold text-zinc-200 truncate">
            {user?.fullName || "User"}
          </p>
          <span className="inline-block text-[10px] font-semibold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full mt-1.5">
            {roleBadge}
          </span>
        </div>
        <nav className="flex-1 space-y-1">
          {links.map((link) => {
            const Icon = link.icon;
            const isActive =
              pathname === link.href ||
              (link.href !== `/${role}` && pathname.startsWith(link.href));
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-medium transition-all ${
                  isActive
                    ? "bg-[#1f2230] text-emerald-400 font-semibold shadow-sm"
                    : "text-zinc-400 hover:bg-[#161822] hover:text-zinc-200"
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{link.label}</span>
              </Link>
            );
          })}
        </nav>
      </aside>

      {/* Mobile bottom nav */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-[#12131c]/95 backdrop-blur-xl z-40 flex px-2 py-1.5 shadow-2xl">
        {links.map((link) => {
          const Icon = link.icon;
          const isActive =
            pathname === link.href ||
            (link.href !== `/${role}` && pathname.startsWith(link.href));
          return (
            <Link
              key={link.href}
              href={link.href}
              className={`flex-1 flex flex-col items-center py-1.5 text-[10px] rounded-lg transition-colors ${
                isActive ? "text-emerald-400 font-semibold bg-[#1c1e2b]" : "text-zinc-500"
              }`}
            >
              <Icon className="w-4 h-4 mb-0.5" />
              <span>{link.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Main content */}
      <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8 pb-20 md:pb-8">
        <div className="max-w-4xl mx-auto">{children}</div>
      </main>
    </div>
  );
}
