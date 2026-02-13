import nextCoreVitals from "eslint-config-next/core-web-vitals";
import nextTypescript from "eslint-config-next/typescript";

const config = [
  ...nextCoreVitals,
  ...nextTypescript,
  {
    rules: {
      "react/no-unescaped-entities": "off"
    }
  }
];

export default config;
