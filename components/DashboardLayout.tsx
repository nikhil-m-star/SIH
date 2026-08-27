"use client";

import Link from "next/link";
import { useUser } from "@clerk/nextjs";
import { usePathname } from "next/navigation";

interface SidebarLink {
  href: string;
  label: string;
  icon: string;
}

const customerLinks: SidebarLink[] = [
  { href: "/customer", label: "Home", icon: "🏠" },
  { href: "/customer/book", label: "Book Service", icon: "📋" },
  { href: "/customer/bookings", label: "My Bookings", icon: "📑" },
];

const workerLinks: SidebarLink[] = [
  { href: "/worker", label: "Dashboard", icon: "📊" },
  { href: "/worker/jobs", label: "Jobs", icon: "🔧" },
  { href: "/worker/profile", label: "Profile", icon: "👤" },
];

const adminLinks: SidebarLink[] = [
  { href: "/admin", label: "Dashboard", icon: "📊" },
  { href: "/admin/workers", label: "Workers", icon: "👷" },
  { href: "/admin/bookings", label: "Bookings", icon: "📑" },
  { href: "/admin/treasury", label: "Treasury", icon: "💰" },
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

  const roleLabel =
    role === "customer"
      ? "Customer"
      : role === "worker"
        ? "Worker"
        : "Admin";

  return (
    <div className="flex h-[calc(100vh-64px)]">
      {/* Sidebar */}
      <aside className="hidden md:flex w-60 flex-col bg-white border-r border-gray-200">
        <div className="p-4 border-b border-gray-100">
          <p className="text-sm font-medium text-gray-900 truncate">
            {user?.fullName || "User"}
          </p>
          <p className="text-xs text-gray-500 mt-0.5">{roleLabel}</p>
        </div>
        <nav className="flex-1 p-3 space-y-1">
          {links.map((link) => {
            const isActive =
              pathname === link.href ||
              (link.href !== `/${role}` && pathname.startsWith(link.href));
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${
                  isActive
                    ? "bg-[var(--color-primary)] text-white"
                    : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                }`}
              >
                <span>{link.icon}</span>
                <span>{link.label}</span>
              </Link>
            );
          })}
        </nav>
      </aside>

      {/* Mobile bottom nav */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-40 flex">
        {links.map((link) => {
          const isActive =
            pathname === link.href ||
            (link.href !== `/${role}` && pathname.startsWith(link.href));
          return (
            <Link
              key={link.href}
              href={link.href}
              className={`flex-1 flex flex-col items-center py-2 text-xs transition-colors ${
                isActive
                  ? "text-[var(--color-primary)] font-medium"
                  : "text-gray-500"
              }`}
            >
              <span className="text-lg">{link.icon}</span>
              <span className="mt-0.5">{link.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Main content */}
      <main className="flex-1 overflow-y-auto pb-20 md:pb-0">
        <div className="p-4 md:p-6 lg:p-8 max-w-5xl">{children}</div>
      </main>
    </div>
  );
}
