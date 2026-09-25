import nextCoreWebVitals from "eslint-config-next/core-web-vitals";

/** @type {import('eslint').Linter.Config[]} */
const eslintConfig = [
  ...nextCoreWebVitals,
  {
    ignores: [
      ".next/**",
      "out/**",
      "build/**",
      "dist/**",
      "next-env.d.ts",
      "tailwind.config.ts",
      "postcss.config.mjs",
      "next.config.mjs",
      "scripts/**",
    ],
  },
  {
    settings: {
      react: {
        version: "19.2",
      },
    },
    rules: {
      // Defer experimental React 19 compiler rules that flag standard Next.js hydration patterns
      "react-hooks/set-state-in-effect": "off",
      "react-hooks/purity": "off",
      "react-hooks/static-components": "off",
      "react-hooks/incompatible-library": "off",
    },
  },
];

export default eslintConfig;
