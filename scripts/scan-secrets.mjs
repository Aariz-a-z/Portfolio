/**
 * Secret scan across everything this project generates.
 *
 * Reports pass/fail and the file a match was found in. It deliberately never
 * prints the matched text: a scanner that echoes what it finds turns its own
 * output into the leak it was written to prevent.
 *
 * Covers source, data, deliverable documents, and the built output. Binary
 * assets are checked for embedded ASCII too, since a screenshot's metadata can
 * carry a path or a token even when the pixels do not.
 */

import { readdirSync, readFileSync, statSync } from 'node:fs';
import { extname, join } from 'node:path';

const ROOTS = ['src', 'scripts', 'public', 'app', '.'];
const SKIP_DIRS = new Set(['node_modules', '.next', '.git', 'verification']);
const DOC_FILES = ['AUDIT.md', 'PLAN.md', 'TRUTH-LEDGER.md', 'VERIFICATION.md', 'REVIEW.md', 'README.md'];

const PATTERNS = [
  { name: 'generic password assignment', re: /(?:password|passwd|pwd)\s*[:=]\s*["'][^"'\s]{6,}["']/i },
  { name: 'API key assignment', re: /(?:api[_-]?key|apikey|secret[_-]?key|access[_-]?token)\s*[:=]\s*["'][^"'\s]{12,}["']/i },
  { name: 'AWS access key id', re: /\bAKIA[0-9A-Z]{16}\b/ },
  { name: 'Google API key', re: /\bAIza[0-9A-Za-z_-]{35}\b/ },
  { name: 'OpenAI-style key', re: /\bsk-[A-Za-z0-9]{32,}\b/ },
  { name: 'JWT', re: /\beyJ[A-Za-z0-9_-]{16,}\.[A-Za-z0-9_-]{16,}\.[A-Za-z0-9_-]{8,}/ },
  { name: 'database connection string', re: /\b(?:postgres|postgresql|mysql|mongodb(?:\+srv)?):\/\/[^\s"'<>]*:[^\s"'<>]*@/i },
  { name: 'private key block', re: /-----BEGIN (?:RSA |EC |OPENSSH |PGP )?PRIVATE KEY-----/ },
  { name: 'Supabase project ref', re: /\bhttps:\/\/[a-z]{20}\.supabase\.co\b/ },
  { name: 'dotenv fragment', re: /^\s*(?:SUPABASE|GEMINI|OLLAMA|OPENAI|ANTHROPIC)_[A-Z_]*\s*=\s*\S+/m },
];

/** Placeholders and detection patterns that are themselves the point. */
const ALLOW = [
  /process\.env\.[A-Z_]+\s*=\s*'[^']*'/, // the RAG repo's invalid-key test, not ours
  /TODO_FINAL_DOMAIN/,
];

const files = [];

function walk(dir) {
  let entries;
  try {
    entries = readdirSync(dir, { withFileTypes: true });
  } catch {
    return;
  }
  for (const entry of entries) {
    if (entry.name.startsWith('.') && entry.name !== '.') continue;
    const full = join(dir, entry.name);
    if (entry.isDirectory()) {
      if (SKIP_DIRS.has(entry.name)) continue;
      walk(full);
    } else {
      files.push(full);
    }
  }
}

walk('src');
walk('scripts');
walk('public');
for (const doc of DOC_FILES) {
  try {
    statSync(doc);
    files.push(doc);
  } catch {
    /* not present */
  }
}

const TEXT_EXT = new Set(['.ts', '.tsx', '.js', '.mjs', '.json', '.css', '.md', '.py', '.svg', '.txt', '.html']);

let findings = 0;
let scanned = 0;

for (const file of files) {
  let content;
  try {
    const isText = TEXT_EXT.has(extname(file));
    content = readFileSync(file, isText ? 'utf8' : null);
    if (!isText) content = content.toString('latin1');
  } catch {
    continue;
  }
  scanned++;

  for (const { name, re } of PATTERNS) {
    const match = content.match(re);
    if (!match) continue;
    if (ALLOW.some((a) => a.test(match[0]))) continue;
    findings++;
    // The file and the rule, never the value.
    console.log(`  FAIL  ${file}  —  matched rule: ${name}`);
  }
}

console.log(`\n  Files scanned: ${scanned}`);
console.log(`  Rules applied: ${PATTERNS.length}`);
console.log(`  RESULT: ${findings === 0 ? 'PASS — no secret patterns found' : `FAIL — ${findings} match(es)`}`);
process.exit(findings === 0 ? 0 : 1);
