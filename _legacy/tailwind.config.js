/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        background: '#ffffff',
        foreground: '#0a0a0a',
        card: '#f9fafb',
        'card-foreground': '#0a0a0a',
        primary: '#000000',
        'primary-foreground': '#ffffff',
        muted: '#f3f4f6',
        'muted-foreground': '#6b7280',
        border: '#e5e7eb',
      },
      backgroundImage: {
        'memorial-gradient': 'linear-gradient(to bottom, #ffffff 0%, #f9fafb 100%)',
        'memorial-light': 'linear-gradient(135deg, #f9fafb 0%, #ffffff 100%)',
      },
      boxShadow: {
        'memorial': '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
        'memorial-glow': '0 0 20px rgba(0, 0, 0, 0.15), 0 0 40px rgba(0, 0, 0, 0.1)',
      },
      animation: {
        'fade-up': 'fadeUp 0.6s ease-out forwards',
        'memorial-glow': 'memorialGlow 3s ease-in-out infinite',
      },
      keyframes: {
        fadeUp: {
          '0%': { 
            opacity: '0',
            transform: 'translateY(20px)',
          },
          '100%': { 
            opacity: '1',
            transform: 'translateY(0)',
          },
        },
        memorialGlow: {
          '0%, 100%': { 
            boxShadow: '0 0 20px rgba(0, 0, 0, 0.15)',
          },
          '50%': { 
            boxShadow: '0 0 30px rgba(0, 0, 0, 0.25)',
          },
        },
      },
    },
  },
  plugins: [],
}
