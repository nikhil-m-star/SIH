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
    <div className="flex h-[calc(100vh-80px)] bg-[#0c0d12] text-zinc-100">
      {/* Borderless Sidebar */}
      <aside className="hidden md:flex w-64 flex-col bg-[#13141d] p-5 m-4 rounded-3xl">
        <div className="p-3 mb-4">
          <p className="text-sm font-bold text-white truncate">
            {user?.fullName || "User"}
          </p>
          <span className="inline-block text-xs font-bold text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-full mt-2">
            {roleBadge}
          </span>
        </div>
        <nav className="flex-1 space-y-2">
          {links.map((link) => {
            const Icon = link.icon;
            const isActive =
              pathname === link.href ||
              (link.href !== `/${role}` && pathname.startsWith(link.href));
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`flex items-center gap-3.5 px-4 py-3 rounded-2xl text-sm font-semibold transition-all ${
                  isActive
                    ? "bg-[#212435] text-emerald-400 shadow-sm"
                    : "text-zinc-400 hover:bg-[#191b28] hover:text-white"
                }`}
              >
                <Icon className="w-5 h-5" />
                <span>{link.label}</span>
              </Link>
            );
          })}
        </nav>
      </aside>

      {/* Mobile bottom nav */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-[#13141d] z-40 flex px-3 py-2.5 shadow-2xl">
        {links.map((link) => {
          const Icon = link.icon;
          const isActive =
            pathname === link.href ||
            (link.href !== `/${role}` && pathname.startsWith(link.href));
          return (
            <Link
              key={link.href}
              href={link.href}
              className={`flex-1 flex flex-col items-center py-2 text-xs rounded-xl transition-colors ${
                isActive ? "text-emerald-400 font-bold bg-[#1f2232]" : "text-zinc-500 font-medium"
              }`}
            >
              <Icon className="w-5 h-5 mb-1" />
              <span>{link.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Main content */}
      <main className="flex-1 overflow-y-auto p-6 md:p-8 lg:p-10 pb-24 md:pb-10">
        <div className="max-w-5xl mx-auto">{children}</div>
      </main>
    </div>
  );
}
