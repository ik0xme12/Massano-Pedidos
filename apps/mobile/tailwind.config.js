/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./App.{js,jsx,ts,tsx}", "./src/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        background:    "#F8F7F4",
        foreground:    "#1C1C1C",
        card:          "#FFFFFF",
        "card-foreground": "#1C1C1C",
        muted:         "#F2F0EB",
        "muted-foreground": "#7A7670",
        border:        "#E2DDD5",
        // Brand
        gold:          "#C4A35A",
        "gold-light":  "#E8D5A3",
        "gold-dark":   "#9E7E3A",
        olive:         "#2D4A3E",
        "olive-light": "#3D6455",
        "olive-muted": "#EAF0EE",
        "brand-black": "#1C1C1C",
        // Status
        destructive:   "#C0392B",
        success:       "#3D6455",
        warning:       "#E67E22",
      },
      fontFamily: {
        sans:    ["Inter", "System"],
        display: ["Georgia", "serif"],
      },
    },
  },
  plugins: [],
}
