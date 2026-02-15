/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#0b1220",
        midnight: "#0f172a",
        pulse: "#67e8f9",
        surge: "#22c55e",
        ember: "#fb7185"
      },
      fontFamily: {
        display: ["Space Grotesk", "ui-sans-serif", "system-ui"],
        body: ["Manrope", "ui-sans-serif", "system-ui"]
      },
      boxShadow: {
        glow: "0 0 35px rgba(103, 232, 249, 0.35)",
        lift: "0 25px 60px rgba(2, 6, 23, 0.55)"
      }
    }
  },
  plugins: []
};
