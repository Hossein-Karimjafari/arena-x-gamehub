import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#05060f",
        panel: "#0b0d1d",
        neon: {
          purple: "#a855f7",
          violet: "#7c3aed",
          cyan: "#22d3ee",
          green: "#4ade80",
          pink: "#f472b6",
          red: "#f87171",
        },
      },
      fontFamily: {
        sans: ["var(--font-vazir)", "Tahoma", "sans-serif"],
        display: ["var(--font-orbitron)", "var(--font-vazir)", "sans-serif"],
      },
      boxShadow: {
        neon: "0 0 20px rgba(168,85,247,.35), 0 0 60px rgba(168,85,247,.15)",
        "neon-cyan": "0 0 20px rgba(34,211,238,.35), 0 0 60px rgba(34,211,238,.12)",
      },
      keyframes: {
        floaty: {
          "0%,100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-12px)" },
        },
        glow: {
          "0%,100%": { opacity: "1" },
          "50%": { opacity: ".55" },
        },
        marquee: {
          "0%": { transform: "translateX(0)" },
          "100%": { transform: "translateX(50%)" },
        },
        "fade-up": {
          "0%": { opacity: "0", transform: "translateY(24px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
      },
      animation: {
        floaty: "floaty 5s ease-in-out infinite",
        glow: "glow 2.4s ease-in-out infinite",
        marquee: "marquee 26s linear infinite",
        "fade-up": "fade-up .7s ease both",
      },
    },
  },
  plugins: [],
};
export default config;
