/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    container: {
      center: true,
      padding: {
        DEFAULT: '1rem',
        sm: '1.5rem',
        lg: '2rem',
      },
      screens: {
        sm: '640px',
        md: '768px',
        lg: '1024px',
        xl: '1200px',
        '2xl': '1280px',
      },
    },
    extend: {
      colors: {
        primary: '#FF6B2C',
        navy: '#03081F',
        screen: '#F9FAFB',
        surface: '#FFFFFF',
        muted: '#475569',
        'muted-2': '#64748B',
        border: '#E5E7EB',
        'border-2': '#D1D5DB',
        success: '#22C55E',
        danger: '#EF4444'
      },
      fontFamily: {
        sans: ['var(--app-font)', 'ui-sans-serif', 'system-ui', 'Arial', 'sans-serif'],
        ar: ['Tajawal', 'Segoe UI', 'Tahoma', 'Arial', 'sans-serif'],
        en: ['Poppins', 'Segoe UI', 'Arial', 'sans-serif'],
      },
      borderRadius: {
        xl: '16px',
        '2xl': '20px',
        '3xl': '24px',
      },
      boxShadow: {
        soft: '0 8px 24px rgba(3, 8, 31, 0.08)',
        card: '0 6px 18px rgba(3, 8, 31, 0.06)',
        input: '0 1px 0 rgba(3, 8, 31, 0.03)',
      },
    },
  },
  plugins: [],
}
