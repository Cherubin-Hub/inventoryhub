"use server";

import bcrypt from "bcryptjs";

import { db } from "@/lib/db";
import { signupSchema } from "./schemas";

import type { SignupInput } from "./schemas";

const SALT_ROUNDS = 10;

// Creates a new user account with a hashed password.
export async function signup(values: SignupInput): Promise<{ error: string | null }> {
  // Validate input on the server even though the client already validated it.
  const parsed = signupSchema.safeParse(values);

  if (!parsed.success) {
    return { error: "Invalid input. Please check your form." };
  }

  const { name, email, password } = parsed.data;

  // Check if a user with this email already exists.
  const existingUser = await db.user.findUnique({
    where: { email },
  });

  if (existingUser) {
    return { error: "An account with this email already exists." };
  }

  // Hash the password so we never store it as plain text.
  // bcrypt.hash turns "mypassword" into something like "$2a$10$X7z..."
  // Even if the database leaks, attackers cannot reverse the hash.
  const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

  // Create the user in the database.
  await db.user.create({
    data: {
      name,
      email,
      password: hashedPassword,
    },
  });

  return { error: null };
}