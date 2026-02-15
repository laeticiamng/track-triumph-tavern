import { describe, it, expect } from "vitest";
import { loginSchema, signupSchema, resetSchema } from "./auth-schemas";

describe("loginSchema", () => {
  it("accepts valid login data", () => {
    const result = loginSchema.safeParse({
      email: "user@example.com",
      password: "Secret1x",
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.email).toBe("user@example.com");
      expect(result.data.password).toBe("Secret1x");
    }
  });

  it("trims whitespace from email", () => {
    const result = loginSchema.safeParse({
      email: "  user@example.com  ",
      password: "Secret1x",
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.email).toBe("user@example.com");
    }
  });

  it("rejects an invalid email", () => {
    const result = loginSchema.safeParse({
      email: "not-an-email",
      password: "Secret1x",
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      const emailError = result.error.issues.find((i) => i.path[0] === "email");
      expect(emailError).toBeDefined();
      expect(emailError!.message).toBe("Adresse email invalide");
    }
  });

  it("rejects an empty email", () => {
    const result = loginSchema.safeParse({
      email: "",
      password: "Secret1x",
    });
    expect(result.success).toBe(false);
  });

  it("rejects email longer than 255 characters", () => {
    const longEmail = "a".repeat(250) + "@b.com";
    const result = loginSchema.safeParse({
      email: longEmail,
      password: "Secret1x",
    });
    expect(result.success).toBe(false);
  });

  it("rejects password shorter than 8 characters", () => {
    const result = loginSchema.safeParse({
      email: "user@example.com",
      password: "Ab1",
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      const pwError = result.error.issues.find((i) => i.path[0] === "password");
      expect(pwError).toBeDefined();
      expect(pwError!.message).toBe("Min. 8 caractères");
    }
  });

  it("rejects password longer than 128 characters", () => {
    const longPassword = "Aa1" + "x".repeat(126);
    const result = loginSchema.safeParse({
      email: "user@example.com",
      password: longPassword,
    });
    expect(result.success).toBe(false);
  });

  it("rejects password without a lowercase letter", () => {
    const result = loginSchema.safeParse({
      email: "user@example.com",
      password: "ALLCAPS1PASS",
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      const pwError = result.error.issues.find(
        (i) => i.path[0] === "password" && i.message === "Au moins une minuscule"
      );
      expect(pwError).toBeDefined();
    }
  });

  it("rejects password without an uppercase letter", () => {
    const result = loginSchema.safeParse({
      email: "user@example.com",
      password: "alllower1case",
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      const pwError = result.error.issues.find(
        (i) => i.path[0] === "password" && i.message === "Au moins une majuscule"
      );
      expect(pwError).toBeDefined();
    }
  });

  it("rejects password without a digit", () => {
    const result = loginSchema.safeParse({
      email: "user@example.com",
      password: "NoDigitsHere",
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      const pwError = result.error.issues.find(
        (i) => i.path[0] === "password" && i.message === "Au moins un chiffre"
      );
      expect(pwError).toBeDefined();
    }
  });

  it("rejects when both fields are missing", () => {
    const result = loginSchema.safeParse({});
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues.length).toBeGreaterThanOrEqual(2);
    }
  });
});

describe("signupSchema", () => {
  it("accepts valid signup data with displayName", () => {
    const result = signupSchema.safeParse({
      email: "new@example.com",
      password: "MyPass99",
      displayName: "Alice",
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.displayName).toBe("Alice");
    }
  });

  it("accepts valid signup data without displayName (optional)", () => {
    const result = signupSchema.safeParse({
      email: "new@example.com",
      password: "MyPass99",
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.displayName).toBeUndefined();
    }
  });

  it("trims whitespace from displayName", () => {
    const result = signupSchema.safeParse({
      email: "new@example.com",
      password: "MyPass99",
      displayName: "  Bob  ",
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.displayName).toBe("Bob");
    }
  });

  it("rejects displayName longer than 50 characters", () => {
    const result = signupSchema.safeParse({
      email: "new@example.com",
      password: "MyPass99",
      displayName: "A".repeat(51),
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      const nameError = result.error.issues.find((i) => i.path[0] === "displayName");
      expect(nameError).toBeDefined();
      expect(nameError!.message).toBe("Max. 50 caractères");
    }
  });

  it("inherits all login validation rules for email and password", () => {
    const badEmail = signupSchema.safeParse({
      email: "bad",
      password: "MyPass99",
    });
    expect(badEmail.success).toBe(false);

    const shortPw = signupSchema.safeParse({
      email: "ok@ok.com",
      password: "Ab1",
    });
    expect(shortPw.success).toBe(false);
  });
});

describe("resetSchema", () => {
  it("accepts a valid email", () => {
    const result = resetSchema.safeParse({ email: "reset@example.com" });
    expect(result.success).toBe(true);
  });

  it("trims whitespace from email", () => {
    const result = resetSchema.safeParse({ email: "  reset@example.com  " });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.email).toBe("reset@example.com");
    }
  });

  it("rejects an invalid email", () => {
    const result = resetSchema.safeParse({ email: "nope" });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toBe("Adresse email invalide");
    }
  });

  it("rejects email longer than 255 characters", () => {
    const result = resetSchema.safeParse({ email: "a".repeat(250) + "@b.com" });
    expect(result.success).toBe(false);
  });
});
