"use server";

import bcrypt from "bcryptjs";
import { AuthError } from "next-auth";

import { db } from "@/lib/db";
import { signIn } from "@/lib/auth";
import { signupSchema, loginSchema } from "./schemas";

import type { SignupInput, LoginInput } from "./schemas";

const SALT_ROUNDS = 10;

export async function signup(values: SignupInput): Promise<{ error: string | null }> {
  const parsed = signupSchema.safeParse(values);

  if (!parsed.success) {
    return { error: "Invalid input. Please check your form." };
  }

  const { name, email, password } = parsed.data;

  const existingUser = await db.user.findUnique({
    where: { email },
  });

  if (existingUser) {
    return { error: "An account with this email already exists." };
  }

  const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

  await db.user.create({
    data: {
      name,
      email,
      password: hashedPassword,
    },
  });

  return { error: null };
}

// NEW: Logs the user in using Auth.js
export async function login(values: LoginInput): Promise<{ error: string | null }> {
  const parsed = loginSchema.safeParse(values);

  if (!parsed.success) {
    return { error: "Invalid input" };
  }

  try {
    // Auth.js handles the password checking (via the authorize function we wrote earlier)
    await signIn("credentials", {
      email: parsed.data.email,
      password: parsed.data.password,
      redirectTo: "/dashboard",
    });
    
    return { error: null };
  } catch (error) {
    // Next.js handles redirects by throwing a special error. We MUST re-throw it.
    if (error instanceof Error && error.message === "NEXT_REDIRECT") {
      throw error;
    }
    
    // Catch Auth.js specific errors (like wrong password)
    if (error instanceof AuthError) {
      switch (error.type) {
        case "CredentialsSignin":
          return { error: "Invalid email or password." };
        default:
          return { error: "Something went wrong." };
      }
    }
    
    throw error;
  }
}
