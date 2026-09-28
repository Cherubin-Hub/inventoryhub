import { SignupForm } from "@/modules/auth/components/signup-form";

// The signup page. It is a Server Component that simply renders the form
// in the center of the screen.
export default function SignupPage() {
  return (
    <main className="flex min-h-screen items-center justify-center p-4">
      <SignupForm />
    </main>
  );
}