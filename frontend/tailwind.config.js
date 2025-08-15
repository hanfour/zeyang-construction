/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#d6a96b',
          light: '#E6C9A8',
          dark: '#B8875A',
          gold: '#C5985B',
          more: '#c8a063',
          line: '#c4a26f',
          50: '#FAF8F5',
          100: '#F5F0E8',
          200: '#EBE1D1',
          300: '#E0D2BB',
          400: '#d6a96b',
          500: '#C5985B',
          600: '#B8875A',
          700: '#9A6D3F',
          800: '#7D5633',
          900: '#5F3F26',
        },
        secondary: {
          50: '#f8fafc',
          100: '#f1f5f9',
          200: '#e2e8f0',
          300: '#cbd5e1',
          400: '#94a3b8',
          500: '#64748b',
          600: '#475569',
          700: '#334155',
          800: '#1e293b',
          900: '#0f172a',
          950: '#020617',
        },
        neutral: {
          50: '#FAFAFA',
          100: '#F5F5F5',
          200: '#E5E5E5',
          300: '#D4D4D4',
          400: '#A3A3A3',
          500: '#737373',
          600: '#525252',
          700: '#404040',
          800: '#262626',
          900: '#171717',
        },
      },
      fontFamily: {
        sans: ['Noto Sans TC', 'Microsoft JhengHei', 'Inter', 'system-ui', '-apple-system', 'sans-serif'],
        serif: ['Noto Serif TC', 'serif'],
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'slide-up': 'slideUp 0.5s ease-out',
        'slide-down': 'slideDown 0.3s ease-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        slideDown: {
          '0%': { transform: 'translateY(-10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
      },
      fontSize: {
        // 大型主標題 (築夢、精工、永續、經典)
        'main-large-title-mobile': ['1.875rem', { lineHeight: '1.2', letterSpacing: '0.02em' }], // text-3xl
        'main-large-title-desktop': ['4rem', { lineHeight: '1.1', letterSpacing: '0.02em' }], // text-6xl

        // 主標題 (築夢、精工、永續、經典)
        'main-title-mobile': ['1.25rem', { lineHeight: '1.2', letterSpacing: '0.02em' }], // text-xl
        'main-title-desktop': ['2.25rem', { lineHeight: '1.1', letterSpacing: '0.02em' }], // text-4xl
        
        // 副標題 (section 描述標題)
        'sub-title-mobile': ['1rem', { lineHeight: '1.4', letterSpacing: '0.01em' }], // text-base
        'sub-title-desktop': ['1.125rem', { lineHeight: '1.3', letterSpacing: '0.01em' }], // text-lg
        
        // 內容文字
        'content-mobile': ['0.75rem', { lineHeight: '1.6' }], // text-xs
        'content-desktop': ['0.875rem', { lineHeight: '1.6' }], // text-sm
        
        // 大型內容文字 (重要段落)
        'content-large-mobile': ['1rem', { lineHeight: '1.6' }], // text-base
        'content-large-desktop': ['1.125rem', { lineHeight: '1.6' }], // text-lg
      },
      textShadow: {
        'sm': '1px 1px 2px rgba(0, 0, 0, 0.375)',
        'DEFAULT': '2px 2px 4px rgba(0, 0, 0, 0.1)',
        'md': '3px 3px 6px rgba(0, 0, 0, 0.15)',
        'lg': '4px 4px 8px rgba(0, 0, 0, 0.25)',
        'xl': '5px 5px 10px rgba(0, 0, 0, 0.35)',
        '2xl': '8px 8px 16px rgba(0, 0, 0, 0.45)',
        'none': 'none',
      },
    },
  },
  plugins: [
    function ({ matchUtilities, theme }) {
      matchUtilities(
        {
          'text-shadow': (value) => ({
            textShadow: value,
          }),
        },
        { values: theme('textShadow') }
      )
    },
  ],
}