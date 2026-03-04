/**
 * i18n unused keys detection script
 * Scans locale JSON files and verifies that every key is referenced
 * in at least one source file.
 *
 * NOTE: This script may report false positives for dynamically
 * constructed keys (e.g. t(`section.${prefix}_q${i}`)). It exits
 * with code 0 (warning only) to avoid blocking CI.
 *
 * Usage: node scripts/check-i18n-unused.mjs
 */

import { readFileSync, readdirSync, statSync } from "fs";
import { join, extname } from "path";

const LOCALES_DIR = "src/i18n/locales";
const SRC_DIR = "src";
const EXTENSIONS = new Set([".tsx", ".ts"]);

// Load one locale to get all keys (structure is identical across locales)
const localeFiles = readdirSync(LOCALES_DIR).filter((f) => f.endsWith(".json"));
const referenceLocale = JSON.parse(
  readFileSync(join(LOCALES_DIR, localeFiles[0]), "utf-8")
);

// Flatten nested keys: { nav: { home: "x" } } → ["nav.home"]
function flattenKeys(obj, prefix = "") {
  const keys = [];
  for (const [k, v] of Object.entries(obj)) {
    const path = prefix ? `${prefix}.${k}` : k;
    if (v && typeof v === "object" && !Array.isArray(v)) {
      keys.push(...flattenKeys(v, path));
    } else {
      keys.push(path);
    }
  }
  return keys;
}

const allKeys = flattenKeys(referenceLocale);

// Collect all source file contents into one big string for fast searching
function collectSource(dir) {
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

const sourceContent = collectSource(SRC_DIR);

// Check each key: look for the key string in source files
const unused = allKeys.filter((key) => {
  // Match "key" or 'key' in source
  return !sourceContent.includes(`"${key}"`) && !sourceContent.includes(`'${key}'`);
});

if (unused.length === 0) {
  console.log(`✅ All ${allKeys.length} i18n keys are referenced in source code.`);
} else {
  console.warn(`⚠️  ${unused.length} potentially unused i18n key(s) found (may include dynamically constructed keys):\n`);
  for (const key of unused) {
    console.warn(`  "${key}"`);
  }
  console.warn(
    `\nReview these keys — some may be used via dynamic key construction (e.g. t(\`section.\${var}\`)).`
  );
}
process.exit(0);
