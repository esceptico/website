import nextCoreWebVitals from "eslint-config-next/core-web-vitals";
import nextTypescript from "eslint-config-next/typescript";

const config = [
  ...nextCoreWebVitals,
  ...nextTypescript,
  {
    name: "project-overrides",
    rules: {
      // This rule is too aggressive for common patterns we intentionally use
      // (e.g. client-only values to avoid hydration mismatches, UI state machines).
      "react-hooks/set-state-in-effect": "off",
    },
  },
];

export default config;
