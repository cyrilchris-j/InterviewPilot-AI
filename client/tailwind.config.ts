import type { Config } from "tailwindcss";

export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#071014",
        panel: "#0e1a1f",
        panel2: "#13262c",
        line: "#23404a",
        cyan: "#20d3c2",
        amber: "#f6b44b",
        rose: "#f36b7f"
      },
      fontFamily: {
        sans: ["Inter", "ui-sans-serif", "system-ui", "sans-serif"]
      },
      boxShadow: {
        glow: "0 0 0 1px rgba(32,211,194,.18), 0 24px 90px rgba(0,0,0,.45)"
      }
    }
  },
  plugins: []
} satisfies Config;
