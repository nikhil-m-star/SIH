import Navbar from "@/components/Navbar";
import DashboardLayout from "@/components/DashboardLayout";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <Navbar />
      <DashboardLayout role="admin">{children}</DashboardLayout>
    </>
  );
}
