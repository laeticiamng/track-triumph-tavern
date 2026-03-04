/**
 * i18n validation script
 * Scans source files for t("key", "fallback") patterns and verifies
 * that all keys exist in every locale file.
 *
 * Usage: node scripts/check-i18n.mjs
 * Exit code 1 if missing keys are found.
 */

import { readFileSync, readdirSync, statSync } from "fs";
import { join, extname } from "path";

const LOCALES_DIR = "src/i18n/locales";
const SRC_DIR = "src";
const EXTENSIONS = new Set([".tsx", ".ts"]);

// Load all locale JSON files
const localeFiles = readdirSync(LOCALES_DIR).filter((f) => f.endsWith(".json"));
const locales = {};
for (const file of localeFiles) {
  const lang = file.replace(".json", "");
  locales[lang] = JSON.parse(readFileSync(join(LOCALES_DIR, file), "utf-8"));
}

// Recursively get nested key from object
function getNestedKey(obj, keyPath) {
  const parts = keyPath.split(".");
  let current = obj;
  for (const part of parts) {
    if (current == null || typeof current !== "object") return undefined;
    current = current[part];
  }
  return current;
}

// Recursively collect all source files
function collectFiles(dir) {
  const results = [];
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

// Extract i18n keys from source files
// Matches: t("key.path", "fallback") and t("key.path", { ... defaultValue: "..." })
const KEY_REGEX = /\bt\(\s*["']([a-zA-Z][a-zA-Z0-9]*(?:\.[a-zA-Z][a-zA-Z0-9]*)*)["']\s*[,)]/g;

const usedKeys = new Map(); // key -> Set<file>

const sourceFiles = collectFiles(SRC_DIR);
for (const file of sourceFiles) {
  const content = readFileSync(file, "utf-8");
  let match;
  KEY_REGEX.lastIndex = 0;
  while ((match = KEY_REGEX.exec(content)) !== null) {
    const key = match[1];
    if (!usedKeys.has(key)) usedKeys.set(key, new Set());
    usedKeys.get(key).add(file);
  }
}

// Check each key against each locale
const missing = []; // { key, lang, files }

for (const [key, files] of usedKeys) {
  for (const [lang, data] of Object.entries(locales)) {
    if (getNestedKey(data, key) === undefined) {
      missing.push({ key, lang, files: [...files] });
    }
  }
}

// Report
if (missing.length === 0) {
  console.log(`✅ All ${usedKeys.size} i18n keys found in ${localeFiles.length} locales.`);
  process.exit(0);
} else {
  console.error(`❌ ${missing.length} missing i18n key(s) found:\n`);
  // Group by key
  const byKey = {};
  for (const m of missing) {
    if (!byKey[m.key]) byKey[m.key] = { langs: [], files: m.files };
    byKey[m.key].langs.push(m.lang);
  }
  for (const [key, info] of Object.entries(byKey)) {
    console.error(`  "${key}" missing in: ${info.langs.join(", ")}`);
    console.error(`    Used in: ${info.files.join(", ")}`);
  }
  console.error("");
  process.exit(1);
}
