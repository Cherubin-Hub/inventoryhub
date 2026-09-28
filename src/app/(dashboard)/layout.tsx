import Link from "next/link";
import { auth, signOut } from "@/lib/auth";
import { Button } from "@/components/ui/button";

// This layout wraps EVERY page inside the (dashboard) folder
export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();

  return (
    <div className="min-h-screen bg-gray-50/50">
      {/* Top Navigation Bar */}
      <nav className="flex items-center justify-between border-b bg-white px-6 py-3 shadow-sm">
        <div className="flex items-center space-x-6">
          <span className="text-xl font-bold text-primary">InventoryHub</span>
          <Link href="/dashboard" className="text-sm font-medium hover:text-primary">Dashboard</Link>
          <Link href="/products" className="text-sm font-medium hover:text-primary">Products</Link>
          <Link href="/movements" className="text-sm font-medium hover:text-primary">Movements</Link>
          <Link href="/team" className="text-sm font-medium hover:text-primary">Team</Link>
        </div>
        <div className="flex items-center space-x-4">
          <span className="text-sm text-muted-foreground hidden md:inline">
            {session?.user?.name} ({session?.user?.role})
          </span>
          <form action={async () => { "use server"; await signOut({ redirectTo: "/login" }); }}>
            <Button variant="outline" size="sm" type="submit">Log out</Button>
          </form>
        </div>
      </nav>

      {/* Page Content */}
      <main className="p-6">{children}</main>
    </div>
  );
}
