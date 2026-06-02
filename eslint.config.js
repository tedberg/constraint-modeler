import pluginVue from "eslint-plugin-vue";
import tsParser from "@typescript-eslint/parser";
import pluginOxlint from "eslint-plugin-oxlint";
import pluginVitest from "@vitest/eslint-plugin";

export default [
  { ignores: ["dist/**", "node_modules/**"] },
  ...pluginVue.configs["flat/recommended"],
  {
    files: ["src/**/*.ts", "tests/**/*.ts"],
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        ecmaVersion: "latest",
        sourceType: "module",
      },
    },
  },
  {
    files: ["src/**/*.vue"],
    languageOptions: {
      parserOptions: {
        parser: tsParser,
        extraFileExtensions: [".vue"],
        ecmaVersion: "latest",
        sourceType: "module",
      },
    },
  },
  {
    files: ["src/**/*.{ts,vue}"],
    rules: {
      "vue/prefer-use-template-ref": "error",
      "vue/multi-word-component-names": "off",
      "vue/no-v-html": "off",
      "vue/html-self-closing": "off",
      // formatting — oxfmt owns this
      "vue/first-attribute-linebreak": "off",
      "vue/html-closing-bracket-newline": "off",
      "vue/html-closing-bracket-spacing": "off",
      "vue/html-indent": "off",
      "vue/max-attributes-per-line": "off",
      "vue/multiline-html-element-content-newline": "off",
      "vue/mustache-interpolation-spacing": "off",
      "vue/singleline-html-element-content-newline": "off",
      // style preferences — not enforced yet
      "vue/attribute-hyphenation": "off",
      "vue/attributes-order": "off",
      "vue/no-required-prop-with-default": "off",
      "vue/require-default-prop": "off",
      "vue/v-on-event-hyphenation": "off",
      "vue/v-on-style": "off",
      "vue/v-slot-style": "off",
    },
  },
  ...pluginOxlint.configs["flat/recommended"],
  {
    files: ["tests/**/*.{ts,js}"],
    plugins: { vitest: pluginVitest },
    rules: { ...pluginVitest.configs.recommended.rules },
  },
  {
    files: ["src/components/ui/**/*.vue"],
    rules: { "vue/require-default-prop": "off" },
  },
];
