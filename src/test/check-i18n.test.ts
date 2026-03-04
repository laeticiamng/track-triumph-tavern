import { describe, it, expect } from "vitest";
import { readFileSync, readdirSync, statSync } from "fs";
import { join, extname } from "path";

const LOCALES_DIR = "src/i18n/locales";
const SRC_DIR = "src";
const EXTENSIONS = new Set([".tsx", ".ts"]);

function getNestedKey(obj: any, keyPath: string) {
  const parts = keyPath.split(".");
  let current = obj;
  for (const part of parts) {
    if (current == null || typeof current !== "object") return undefined;
    current = current[part];
  }
  return current;
}

function collectFiles(dir: string): string[] {
  const results: string[] = [];
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    if (entry === "node_modules" || entry === ".git") continue;
    const stat = statSync(full);
    if (stat.isDirectory()) {
      results.push(...collectFiles(full));
    } else if (EXTENSIONS.has(extname(full))) {
      results.push(full);
    }
  }
  return results;
}

describe("i18n key coverage", () => {
  const localeFiles = readdirSync(LOCALES_DIR).filter((f) => f.endsWith(".json"));
  const locales: Record<string, any> = {};
  for (const file of localeFiles) {
    const lang = file.replace(".json", "");
    locales[lang] = JSON.parse(readFileSync(join(LOCALES_DIR, file), "utf-8"));
  }

  const KEY_REGEX = /\bt\(\s*["']([a-zA-Z][a-zA-Z0-9]*(?:\.[a-zA-Z][a-zA-Z0-9]*)*)["']\s*[,)]/g;
  const usedKeys = new Map<string, Set<string>>();

  const sourceFiles = collectFiles(SRC_DIR);
  for (const file of sourceFiles) {
    const content = readFileSync(file, "utf-8");
    KEY_REGEX.lastIndex = 0;
    let match;
    while ((match = KEY_REGEX.exec(content)) !== null) {
      const key = match[1];
      if (!usedKeys.has(key)) usedKeys.set(key, new Set());
      usedKeys.get(key)!.add(file);
    }
  }

  it("all i18n keys exist in every locale", () => {
    const missing: { key: string; lang: string; files: string[] }[] = [];

    for (const [key, files] of usedKeys) {
      for (const [lang, data] of Object.entries(locales)) {
        if (getNestedKey(data, key) === undefined) {
          missing.push({ key, lang, files: [...files] });
        }
      }
    }

    if (missing.length > 0) {
      const report = missing
        .map((m) => `"${m.key}" missing in ${m.lang} (used in ${m.files.join(", ")})`)
        .join("\n");
      expect.fail(`Missing i18n keys:\n${report}`);
    }

    console.log(`✅ All ${usedKeys.size} i18n keys found in ${localeFiles.length} locales.`);
  });
});
