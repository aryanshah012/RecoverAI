import type { Config } from "tailwindcss";

export default {
  content: ["./app/**/*.{js,ts,jsx,tsx,mdx}", "./components/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        emerald: {
          50: "#f5f5e9",
          100: "#e8e8cf",
          200: "#d2d5aa",
          300: "#b8be82",
          400: "#9da861",
          500: "#7f8d49",
          600: "#657238",
          700: "#505b30",
          800: "#41492a",
          900: "#373e27",
          950: "#1c2112",
        },
      },
    },
  },
  plugins: [],
} satisfies Config;
