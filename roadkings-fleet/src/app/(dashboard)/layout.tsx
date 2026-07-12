import { Sidebar } from "@/components/shared/sidebar";
import { auth } from "@/lib/auth";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar user={session?.user} />
      <main className="flex-1 ml-[260px] flex flex-col">
        {children}
      </main>
    </div>
  );
}
