import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        canvas: "var(--canvas)", surface: "var(--surface)", band: "var(--band)",
        ink: "var(--ink)", muted: "var(--muted)", line: "var(--line)",
        // RGB channels so opacity modifiers such as bg-accent-terra/10 work.
        brand: { DEFAULT: "rgb(var(--brand-rgb) / <alpha-value>)", deep: "var(--brand-deep)", soft: "var(--brand-soft)" },
        accent: { terra: "rgb(var(--terra-rgb) / <alpha-value>)", ochre: "rgb(var(--ochre-rgb) / <alpha-value>)", navy: "rgb(var(--navy-rgb) / <alpha-value>)" }
      },
      fontFamily: { sans: ["var(--font-inter)", "sans-serif"], serif: ["var(--font-source-serif)", "serif"] },
      borderRadius: { ui: "0.625rem" },
      boxShadow: { card: "0 14px 40px rgb(32 37 34 / 0.08)" }
    }
  },
  plugins: []
};

export default config;
