import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().trim().email({ message: "Invalid email" }).max(255),
  password: z.string()
    .min(8, { message: "Min. 8 characters" })
    .max(128)
    .regex(/[a-z]/, { message: "At least one lowercase" })
    .regex(/[A-Z]/, { message: "At least one uppercase" })
    .regex(/[0-9]/, { message: "At least one digit" }),
});

export const signupSchema = loginSchema.extend({
  displayName: z.string().trim().max(50, { message: "Max. 50 characters" }).optional(),
});

export const resetSchema = z.object({
  email: z.string().trim().email({ message: "Invalid email" }).max(255),
});

export type LoginValues = z.infer<typeof loginSchema>;
export type SignupValues = z.infer<typeof signupSchema>;
export type ResetValues = z.infer<typeof resetSchema>;
