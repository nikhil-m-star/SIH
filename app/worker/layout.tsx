import Navbar from "@/components/Navbar";
import DashboardLayout from "@/components/DashboardLayout";

export default function WorkerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <Navbar />
      <DashboardLayout role="worker">{children}</DashboardLayout>
    </>
  );
}
