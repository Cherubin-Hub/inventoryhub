"use client"; // Next.js requires error boundaries to be Client Components

import { useEffect } from "react";
import { Button } from "@/components/ui/button";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // In a real app, you would send this error securely to a logging service 
    console.error("Caught by Global Error Boundary:", error);
  }, [error]);

  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] space-y-4 px-4 text-center">
      <h2 className="text-3xl font-bold text-destructive">Something went wrong!</h2>
      <p className="text-muted-foreground max-w-md">
        We encountered an unexpected error while loading this page. Dont worry, its not your fault!
      </p>
      <Button onClick={() => reset()} variant="outline">
        Try again
      </Button>
    </div>
  );
}