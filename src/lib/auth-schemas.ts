import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().trim().email({ message: "Adresse email invalide" }).max(255),
  password: z.string()
    .min(8, { message: "Min. 8 caractères" })
    .max(128)
    .regex(/[a-z]/, { message: "Au moins une minuscule" })
    .regex(/[A-Z]/, { message: "Au moins une majuscule" })
    .regex(/[0-9]/, { message: "Au moins un chiffre" }),
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
