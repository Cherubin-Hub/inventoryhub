import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] space-y-4 px-4 text-center">
      <h2 className="text-4xl font-bold">404 - Not Found</h2>
      <p className="text-muted-foreground max-w-md">
        We cant find the page or resource you were looking for. It may have been moved or archived.
      </p>
      <Link href="/dashboard">
        <Button>Return to Dashboard</Button>
      </Link>
    </div>
  );
}