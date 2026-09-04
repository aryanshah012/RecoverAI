import type { Config } from "tailwindcss";

export default {
  content: ["./app/**/*.{js,ts,jsx,tsx,mdx}", "./components/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        emerald: {
          50: "#f1f6f4",
          100: "#dfeae6",
          200: "#c0d5cd",
          300: "#9ab9ae",
          400: "#83a99b",
          500: "#638b7d",
          600: "#4d7065",
          700: "#405b53",
          800: "#354a44",
          900: "#2e3e3a",
          950: "#17221f",
        },
      },
    },
  },
  plugins: [],
} satisfies Config;
