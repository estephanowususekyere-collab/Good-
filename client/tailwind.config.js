/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        ink: '#09090b',
        surface: '#18181b',
        'surface-2': '#27272a',
        accent: '#ef4444',
        'accent-dark': '#b91c1c',
        muted: '#9ca3af',
      },
    },
  },
  plugins: [],
}
