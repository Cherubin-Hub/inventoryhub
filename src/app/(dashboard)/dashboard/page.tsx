import { auth, signOut } from "@/lib/auth";
import { Button } from "@/components/ui/button";

export default async function DashboardPage() {
  // Grab the session data from the server
  const session = await auth();

  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-8 space-y-4">
      <h1 className="text-3xl font-bold">Dashboard</h1>
      <p>Welcome, {session?.user?.name}!</p>
      
      {/* A Server Action form to log out */}
      <form action={async () => {
        "use server";
        await signOut({ redirectTo: "/login" });
      }}>
        <Button variant="destructive" type="submit">
          Log out
        </Button>
      </form>
    </div>
  );
}
