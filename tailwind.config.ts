import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Design system Play Group
        cream: '#EFEFEA',
        accent: '#F0C040',
        dark: '#111111',
        'card-light': '#FFFFFF',
        'card-dark': '#111111',
      },
      fontFamily: {
        sans: ['DM Sans', 'sans-serif'],
      },
      fontWeight: {
        // Numeri grandi e bold
        display: '800',
      },
      borderRadius: {
        card: '16px',
        btn: '12px',
      },
    },
  },
  plugins: [],
}

export default config
