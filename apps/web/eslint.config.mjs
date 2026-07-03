import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  globalIgnores([
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
  ]),
  {
    rules: {
      // Too strict for data-fetching patterns in effects
      "react-hooks/set-state-in-effect": "off",
      // Allow any for now — strict typing is a future task
      "@typescript-eslint/no-explicit-any": "warn",
    },
  },
]);

export default eslintConfig;
