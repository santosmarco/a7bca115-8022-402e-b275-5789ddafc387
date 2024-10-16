/**
 * @type {import("prettier").Config & import("prettier-plugin-tailwindcss").PluginOptions}
 */
const prettierConfig = {
  plugins: ["prettier-plugin-tailwindcss"],
  tailwindConfig: "./tailwind.config.ts",
  tailwindFunctions: ["cva", "cn"],
};

export default prettierConfig;
