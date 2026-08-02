// Locale key-parity audit. Walks every src/locales/*.js file's exported
// object, flattens it to a set of dot-paths (arrays are treated as a single
// leaf, but their length is compared too — a locale with a shorter/longer
// array than en.js has a real translation gap), and diffs each locale
// against en.js as the source of truth.
//
// Usage: node scripts/check-locale-parity.js
// Exit code 0 = every locale has the same keys as en.js. Exit code 1 = at
// least one locale is missing keys (extra keys are reported but don't fail
// the run — they're usually a locale that's ahead, not behind).

const fs = require("fs");
const path = require("path");
const babel = require("@babel/core");

const LOCALES_DIR = path.join(__dirname, "..", "src", "locales");
const SOURCE_OF_TRUTH = "en";

function loadLocale(code) {
  const filePath = path.join(LOCALES_DIR, `${code}.js`);
  const { code: transformed } = babel.transformFileSync(filePath, {
    presets: [["next/babel"]],
  });
  const module = { exports: {} };
  // eslint-disable-next-line no-new-func
  new Function("module", "exports", "require", transformed)(module, module.exports, require);
  const obj = module.exports[code] || module.exports.default;
  if (!obj) throw new Error(`Locale file ${code}.js does not export a "${code}" object`);
  return obj;
}

// Returns a Map of dot-path -> "leaf" | "array:<length>", so array-length
// mismatches are caught (e.g. careers.positions having 16 entries in en but
// only 10 in another locale) without needing per-element comparison.
function flatten(obj, prefix = "", out = new Map()) {
  for (const [key, value] of Object.entries(obj)) {
    const path = prefix ? `${prefix}.${key}` : key;
    if (Array.isArray(value)) {
      out.set(path, `array:${value.length}`);
    } else if (value && typeof value === "object") {
      flatten(value, path, out);
    } else {
      out.set(path, "leaf");
    }
  }
  return out;
}

function main() {
  const files = fs.readdirSync(LOCALES_DIR).filter((f) => f.endsWith(".js"));
  const codes = files.map((f) => f.replace(/\.js$/, ""));

  if (!codes.includes(SOURCE_OF_TRUTH)) {
    console.error(`Source of truth "${SOURCE_OF_TRUTH}.js" not found in ${LOCALES_DIR}`);
    process.exit(1);
  }

  const truth = flatten(loadLocale(SOURCE_OF_TRUTH));
  let hasGaps = false;

  for (const code of codes) {
    if (code === SOURCE_OF_TRUTH) continue;

    const locale = flatten(loadLocale(code));
    const missing = [];
    const mismatchedArrays = [];
    const extra = [];

    for (const [key, kind] of truth) {
      if (!locale.has(key)) {
        missing.push(key);
      } else if (kind.startsWith("array:") && locale.get(key) !== kind) {
        mismatchedArrays.push(`${key} (en has ${kind.split(":")[1]}, ${code} has ${locale.get(key).split(":")[1]})`);
      }
    }
    for (const key of locale.keys()) {
      if (!truth.has(key)) extra.push(key);
    }

    if (missing.length || mismatchedArrays.length) {
      hasGaps = true;
      console.log(`\n✗ ${code}.js — ${missing.length} missing key(s), ${mismatchedArrays.length} array-length mismatch(es)`);
      missing.slice(0, 30).forEach((k) => console.log(`    missing: ${k}`));
      if (missing.length > 30) console.log(`    ...and ${missing.length - 30} more`);
      mismatchedArrays.forEach((m) => console.log(`    array mismatch: ${m}`));
    } else {
      console.log(`✓ ${code}.js — all ${truth.size} keys present, all arrays match length`);
    }

    if (extra.length) {
      console.log(`  (info) ${code}.js has ${extra.length} key(s) not in en.js: ${extra.slice(0, 10).join(", ")}${extra.length > 10 ? ", ..." : ""}`);
    }
  }

  console.log(hasGaps ? "\nRESULT: gaps found — see above.\n" : "\nRESULT: all locales have full key parity with en.js.\n");
  process.exit(hasGaps ? 1 : 0);
}

main();
