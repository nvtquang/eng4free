import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        canvas: "var(--canvas)", surface: "var(--surface)", band: "var(--band)",
        ink: "var(--ink)", muted: "var(--muted)", line: "var(--line)",
        brand: { DEFAULT: "var(--brand)", deep: "var(--brand-deep)", soft: "var(--brand-soft)" },
        accent: { terra: "var(--terra)", ochre: "var(--ochre)", navy: "var(--navy)" }
      },
      fontFamily: { sans: ["var(--font-inter)", "sans-serif"], serif: ["var(--font-source-serif)", "serif"] },
      borderRadius: { ui: "0.625rem" },
      boxShadow: { card: "0 14px 40px rgb(32 37 34 / 0.08)" }
    }
  },
  plugins: []
};

export default config;
