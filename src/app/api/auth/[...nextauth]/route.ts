import { handlers } from "@/lib/auth";

// Auth.js needs two HTTP endpoints: GET (for sign-in pages) and POST (for form
// submissions). This line exports them both from our auth configuration.
export const { GET, POST } = handlers;