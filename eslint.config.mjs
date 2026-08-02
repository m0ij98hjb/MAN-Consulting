import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";

const eslintConfig = defineConfig([
  ...nextVitals,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    // Internal tooling worktrees (not part of the app; may belong to other
    // concurrent sessions) — never part of this project's own source.
    ".claude/**",
  ]),
]);

export default eslintConfig;
