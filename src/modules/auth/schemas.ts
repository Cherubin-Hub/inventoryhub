import { z } from "zod";

const MIN_PASSWORD_LENGTH = 8;

// Validates the signup form data.
export const signupSchema = z
  .object({
    name: z.string().min(1, "Name is required"),
    email: z.string().email("Please enter a valid email address"),
    password: z
      .string()
      .min(MIN_PASSWORD_LENGTH, `Password must be at least ${MIN_PASSWORD_LENGTH} characters`),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

// Creates a TypeScript type from the Zod schema so we do not write the type twice.
export type SignupInput = z.infer<typeof signupSchema>;