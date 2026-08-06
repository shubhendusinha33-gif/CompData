import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--bg-0)",
        foreground: "var(--ink)",
      },
      fontFamily: {
        sans: ["var(--font-sans)", "Manrope", "sans-serif"],
        display: ["var(--font-display)", "Syne", "sans-serif"],
      },
    },
  },
  plugins: [],
};

export default config;
