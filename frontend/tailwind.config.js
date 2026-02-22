/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        bg: {
          primary: '#0f1117',
          secondary: '#161b27',
          card: '#1e2535',
          elevated: '#252d40',
        },
        border: {
          subtle: '#2a3348',
          active: '#3b4f6e',
        },
        text: {
          primary: '#e8edf5',
          secondary: '#8899b5',
          muted: '#4d607a',
        },
        accent: {
          blue: '#2d7df6',
          teal: '#00d4b4',
          amber: '#f5a623',
          red: '#e84040',
          purple: '#9b6dff',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
