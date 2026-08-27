import Navbar from "@/components/Navbar";
import DashboardLayout from "@/components/DashboardLayout";

export default function CustomerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <Navbar />
      <DashboardLayout role="customer">{children}</DashboardLayout>
    </>
  );
}
