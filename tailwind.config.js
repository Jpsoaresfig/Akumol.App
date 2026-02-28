// tailwind.config.js
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  darkMode: 'class', // Certifique-se que isso está aqui para o dark mode
  theme: {
    extend: {
      // ✅ ADICIONE ISTO AQUI:
      keyframes: {
        'fade-in-down': {
          '0%': {
            opacity: '0',
            transform: 'translateY(-10px)'
          },
          '100%': {
            opacity: '1',
            transform: 'translateY(0)'
          },
        }
      },
      animations: {
        'fade-in-down': 'fade-in-down 0.5s ease-out forwards'
      }
    },
  },
  plugins: [],
}