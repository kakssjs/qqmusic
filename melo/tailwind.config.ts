import type { Config } from "tailwindcss";
export default {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: { fontFamily: { geist: ["Geist", "system-ui", "sans-serif"] } },
  },
} satisfies Config;
