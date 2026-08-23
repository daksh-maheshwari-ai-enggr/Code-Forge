/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        lumenDark: "#1B3B2B",
        lumenAmber: "#D97706",
        lumenBg: "#FBF9F5",
      },
      fontFamily: {
        serif: ["Playfair Display", "Merriweather", "Georgia", "serif"],
      },
    },
  },
  plugins: [],
}