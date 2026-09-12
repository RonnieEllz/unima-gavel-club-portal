import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        maroon: {
          50: "#fdf2f3",
          100: "#fbe3e6",
          200: "#f5c1c8",
          300: "#ec96a1",
          400: "#dd5f70",
          500: "#c53548",
          600: "#a4233a",
          700: "#7c1a2c", // primary Toastmasters-style maroon
          800: "#5f1522",
          900: "#4a1119",
        },
        gold: {
          50: "#fdf9ec",
          100: "#faf0c9",
          200: "#f4dd8e",
          300: "#edc554",
          400: "#e6ac2e",
          500: "#d1901e", // accent gold
          600: "#ac6f18",
          700: "#875318",
          800: "#6f4319",
          900: "#5f3818",
        },
        ink: {
          900: "#181414",
        },
      },
      fontFamily: {
        display: ["Georgia", "serif"],
        sans: ["ui-sans-serif", "system-ui", "-apple-system", "Segoe UI", "Roboto", "sans-serif"],
      },
    },
  },
  plugins: [],
};

export default config;
