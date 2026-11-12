import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
  ]),
  {
    // Upstream Looseleaf shadcn-registry primitives use custom ink-ref patterns
    files: ["components/ui/**", "lib/ink/**", "hooks/use-mark-ink.tsx"],
    rules: {
      "react-hooks/refs": "off",
      "react-hooks/use-memo": "off",
      "react-hooks/exhaustive-deps": "off",
      "@typescript-eslint/no-unused-vars": "off",
      "@typescript-eslint/no-unused-expressions": "off",
    },
  },
]);

export default eslintConfig;
