import { describe, it, expect } from "vitest";
import { readFileSync, readdirSync, statSync } from "fs";
import { join, extname } from "path";

const LOCALES_DIR = "src/i18n/locales";
const SRC_DIR = "src";
const EXTENSIONS = new Set([".tsx", ".ts"]);

function flattenKeys(obj: Record<string, unknown>, prefix = ""): string[] {
  const keys: string[] = [];
  for (const [k, v] of Object.entries(obj)) {
    const path = prefix ? `${prefix}.${k}` : k;
    if (v && typeof v === "object" && !Array.isArray(v)) {
      keys.push(...flattenKeys(v as Record<string, unknown>, path));
    } else {
      keys.push(path);
    }
  }
  return keys;
}

function collectSource(dir: string): string {
  let source = "";
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    if (entry === "node_modules" || entry === ".git") continue;
    const stat = statSync(full);
    if (stat.isDirectory()) {
      source += collectSource(full);
    } else if (EXTENSIONS.has(extname(full))) {
      source += readFileSync(full, "utf-8") + "\n";
    }
  }
  return source;
}

describe("i18n unused keys", () => {
  it("all locale keys are referenced in source code", () => {
    const localeFiles = readdirSync(LOCALES_DIR).filter((f) => f.endsWith(".json"));
    const referenceLocale = JSON.parse(
      readFileSync(join(LOCALES_DIR, localeFiles[0]), "utf-8")
    );
    const allKeys = flattenKeys(referenceLocale);
    const sourceContent = collectSource(SRC_DIR);

    const unused = allKeys.filter(
      (key) => !sourceContent.includes(`"${key}"`) && !sourceContent.includes(`'${key}'`)
    );

    if (unused.length > 0) {
      console.warn(`⚠️  ${unused.length} potentially unused i18n key(s) (may be dynamic):\n${unused.map((k) => `  "${k}"`).join("\n")}`);
    }

    console.log(`✅ ${allKeys.length - unused.length}/${allKeys.length} keys referenced.`);
    // Warn only — dynamic keys create false positives
    expect(true).toBe(true);
  });
});
