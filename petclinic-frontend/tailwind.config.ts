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
        // Neobrutalism color palette
        'neo-primary': '#000000',     // Pure black
        'neo-secondary': '#FFFFFF',   // Pure white
        'neo-accent': '#FF6B35',      // Vibrant orange-red
        'neo-blue': '#0066FF',        // Electric blue
        'neo-green': '#00FF66',       // Neon green
        'neo-yellow': '#FFFF00',      // Bright yellow
        'neo-pink': '#FF3366',        // Hot pink
        'neo-purple': '#6633FF',      // Electric purple
        'neo-cyan': '#00FFFF',        // Bright cyan
        'neo-red': '#FF0000',         // Pure red
        'neo-gray': '#F5F5F5',        // Light gray background
        'neo-dark-gray': '#333333',   // Dark gray
      },
      fontFamily: {
        'inter': ['Inter', 'sans-serif'],
        'mono': ['Monaco', 'Consolas', 'monospace'],
      },
      boxShadow: {
        'neo': '4px 4px 0px 0px #000000',         // Standard neobrutalism shadow
        'neo-lg': '8px 8px 0px 0px #000000',      // Large shadow
        'neo-xl': '12px 12px 0px 0px #000000',    // Extra large shadow
        'neo-colored': '4px 4px 0px 0px',         // For colored shadows
      },
      borderWidth: {
        '3': '3px',
        '4': '4px',
        '5': '5px',
      },
      animation: {
        'bounce-slow': 'bounce 2s infinite',
        'pulse-fast': 'pulse 1s infinite',
      },
    },
  },
  plugins: [],
};

export default config; 
