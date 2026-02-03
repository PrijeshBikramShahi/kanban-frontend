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
        // Dark theme color palette
        dark: {
          bg: '#0F172A',        // Deep slate - primary background
          surface: '#1E293B',   // Lighter slate - cards/surfaces
          border: '#334155',    // Muted slate - borders
          hover: '#475569',     // Hover state
        },
        accent: {
          primary: '#3B82F6',   // Modern blue - primary actions
          hover: '#2563EB',     // Darker blue - hover state
          light: '#60A5FA',     // Light blue - secondary
        },
        text: {
          primary: '#F1F5F9',   // Near white - primary text
          secondary: '#CBD5E1', // Light gray - secondary text
          muted: '#94A3B8',     // Muted gray - labels
        },
        success: '#10B981',
        warning: '#F59E0B',
        error: '#EF4444',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      spacing: {
        '18': '4.5rem',
        '88': '22rem',
        '128': '32rem',
      },
      borderRadius: {
        'card': '0.75rem',
        'button': '0.5rem',
      },
      boxShadow: {
        'card': '0 1px 3px 0 rgba(0, 0, 0, 0.3)',
        'card-hover': '0 4px 6px -1px rgba(0, 0, 0, 0.3)',
        'modal': '0 20px 25px -5px rgba(0, 0, 0, 0.4)',
      },
    },
  },
  plugins: [],
}
