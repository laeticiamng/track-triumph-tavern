import { describe, it, expect } from "vitest";
import { cn } from "@/lib/utils";
import { loginSchema, signupSchema, resetSchema } from "@/lib/auth-schemas";
import { SUBSCRIPTION_TIERS } from "@/lib/subscription-tiers";

describe("smoke tests", () => {
  describe("module imports", () => {
    it("cn utility is a function", () => {
      expect(typeof cn).toBe("function");
    });

    it("auth schemas are defined Zod objects", () => {
      expect(loginSchema).toBeDefined();
      expect(loginSchema.safeParse).toBeDefined();
      expect(signupSchema).toBeDefined();
      expect(signupSchema.safeParse).toBeDefined();
      expect(resetSchema).toBeDefined();
      expect(resetSchema.safeParse).toBeDefined();
    });

    it("subscription tiers object is defined with all expected keys", () => {
      expect(SUBSCRIPTION_TIERS).toBeDefined();
      expect(Object.keys(SUBSCRIPTION_TIERS)).toEqual(["free", "pro", "elite"]);
    });
  });

  describe("cross-module integration", () => {
    it("every subscription tier name can be used as a valid CSS class via cn", () => {
      const tierNames = Object.values(SUBSCRIPTION_TIERS).map((t) => `tier-${t.name.toLowerCase()}`);
      const result = cn(...tierNames);
      tierNames.forEach((name) => {
        expect(result).toContain(name);
      });
    });

    it("login schema and signup schema share the same email and password rules", () => {
      const validData = { email: "shared@test.com", password: "Valid1pw!" };
      const loginResult = loginSchema.safeParse(validData);
      const signupResult = signupSchema.safeParse(validData);
      expect(loginResult.success).toBe(true);
      expect(signupResult.success).toBe(true);

      const invalidData = { email: "bad", password: "x" };
      const loginFail = loginSchema.safeParse(invalidData);
      const signupFail = signupSchema.safeParse(invalidData);
      expect(loginFail.success).toBe(false);
      expect(signupFail.success).toBe(false);
    });

    it("paid tiers always have a Stripe price_id string", () => {
      const paidTiers = (["pro", "elite"] as const).map((k) => SUBSCRIPTION_TIERS[k]);
      paidTiers.forEach((tier) => {
        expect(tier.price_id).not.toBeNull();
        expect(typeof tier.price_id).toBe("string");
        expect((tier.price_id as string).startsWith("price_")).toBe(true);
      });
    });
  });
});
