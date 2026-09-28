import { z } from "zod";
import { UserRole } from "@prisma/client";

export const addMemberSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Valid email required"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  // z.nativeEnum ensures the input strictly matches our Prisma UserRole enum
  role: z.nativeEnum(UserRole),
});

export type AddMemberInput = z.infer<typeof addMemberSchema>;
