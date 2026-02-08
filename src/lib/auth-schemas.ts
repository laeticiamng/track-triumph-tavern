import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().trim().email({ message: "Adresse email invalide" }).max(255),
  password: z.string().min(6, { message: "Min. 6 caractères" }).max(128),
});

export const signupSchema = loginSchema.extend({
  displayName: z.string().trim().max(50, { message: "Max. 50 caractères" }).optional(),
});

export const resetSchema = z.object({
  email: z.string().trim().email({ message: "Adresse email invalide" }).max(255),
});

export type LoginValues = z.infer<typeof loginSchema>;
export type SignupValues = z.infer<typeof signupSchema>;
export type ResetValues = z.infer<typeof resetSchema>;
