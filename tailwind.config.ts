import type { Config } from "tailwindcss";
const config: Config = { content: ["./app/**/*.{js,ts,jsx,tsx,mdx}", "./components/**/*.{js,ts,jsx,tsx,mdx}"], theme: { extend: { colors: { hf: { bg: "#0f0f0f", panel: "#181818", card: "#222222", blue: "#3ea6ff" } } } }, plugins: [] };
export default config;