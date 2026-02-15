import { describe, it, expect } from "vitest";
import { cn } from "./utils";

describe("cn", () => {
  it("returns an empty string when called with no arguments", () => {
    expect(cn()).toBe("");
  });

  it("returns a single class name unchanged", () => {
    expect(cn("text-red-500")).toBe("text-red-500");
  });

  it("merges multiple class names", () => {
    const result = cn("px-4", "py-2", "font-bold");
    expect(result).toContain("px-4");
    expect(result).toContain("py-2");
    expect(result).toContain("font-bold");
  });

  it("resolves conflicting Tailwind classes by keeping the last one", () => {
    const result = cn("text-red-500", "text-blue-500");
    expect(result).toBe("text-blue-500");
    expect(result).not.toContain("text-red-500");
  });

  it("resolves conflicting padding classes", () => {
    const result = cn("px-2", "px-4");
    expect(result).toBe("px-4");
    expect(result).not.toContain("px-2");
  });

  it("handles conditional class names via clsx syntax", () => {
    const isActive = true;
    const isDisabled = false;
    const result = cn("base", isActive && "bg-blue-500", isDisabled && "opacity-50");
    expect(result).toContain("base");
    expect(result).toContain("bg-blue-500");
    expect(result).not.toContain("opacity-50");
  });

  it("handles undefined and null inputs gracefully", () => {
    const result = cn("valid", undefined, null, "also-valid");
    expect(result).toContain("valid");
    expect(result).toContain("also-valid");
  });

  it("handles array inputs via clsx", () => {
    const result = cn(["px-2", "py-2"]);
    expect(result).toContain("px-2");
    expect(result).toContain("py-2");
  });

  it("handles object inputs via clsx", () => {
    const result = cn({ "bg-red-500": true, "bg-blue-500": false, "text-white": true });
    expect(result).toContain("bg-red-500");
    expect(result).not.toContain("bg-blue-500");
    expect(result).toContain("text-white");
  });

  it("merges conflicting margin classes from different sources", () => {
    const result = cn("mt-2", { "mt-4": true });
    expect(result).toBe("mt-4");
  });
});
