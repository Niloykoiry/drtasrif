import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./lib/**/*.{ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["var(--font-jakarta)", "var(--font-bengali)", "ui-sans-serif", "system-ui", "sans-serif"],
        script: ["var(--font-script)", "cursive"],
      },
      colors: {
        navy: { DEFAULT: "#0e3a6d", deep: "#0a2c52" },
      },
      boxShadow: {
        soft: "0 20px 45px -20px rgba(14, 58, 109, 0.25)",
        glass: "0 18px 40px -18px rgba(30, 64, 175, 0.35)",
      },
    },
  },
  plugins: [],
};

export default config;
