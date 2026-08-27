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
    <div className="flex h-[calc(100vh-56px)] bg-zinc-950 text-zinc-100">
      {/* Sidebar */}
      <aside className="hidden md:flex w-56 flex-col bg-zinc-900/40 border-r border-zinc-800/80">
        <div className="p-3.5 border-b border-zinc-800/60">
          <p className="text-xs font-medium text-zinc-200 truncate">
            {user?.fullName || "User"}
          </p>
          <span className="inline-block text-[10px] font-medium text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/20 mt-1">
            {roleBadge}
          </span>
        </div>
        <nav className="flex-1 p-2 space-y-1">
          {links.map((link) => {
            const Icon = link.icon;
            const isActive =
              pathname === link.href ||
              (link.href !== `/${role}` && pathname.startsWith(link.href));
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`flex items-center gap-2.5 px-3 py-2 rounded-md text-xs font-medium transition-colors ${
                  isActive
                    ? "bg-zinc-800 text-emerald-400 border border-zinc-700/60"
                    : "text-zinc-400 hover:bg-zinc-800/50 hover:text-zinc-200"
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
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-zinc-950/90 backdrop-blur-md border-t border-zinc-800 z-40 flex">
        {links.map((link) => {
          const Icon = link.icon;
          const isActive =
            pathname === link.href ||
            (link.href !== `/${role}` && pathname.startsWith(link.href));
          return (
            <Link
              key={link.href}
              href={link.href}
              className={`flex-1 flex flex-col items-center py-2 text-[10px] transition-colors ${
                isActive ? "text-emerald-400 font-medium" : "text-zinc-500"
              }`}
            >
              <Icon className="w-4 h-4 mb-0.5" />
              <span>{link.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Main content */}
      <main className="flex-1 overflow-y-auto pb-16 md:pb-0">
        <div className="p-4 md:p-6 lg:p-8 max-w-4xl">{children}</div>
      </main>
    </div>
  );
}
