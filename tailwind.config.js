// tailwind.config.js

module.exports = {
  // Step 7: Configure Tailwind to scan your React and HTML files for classes
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  
  theme: {
    // Step 9: Extend the theme with your custom colors, fonts, and utilities
    extend: {
      colors: {
        /* Dark Theme (Platinum) */
        '111111': '#111111', 
        'DAD5C1': '#DAD5C1', 
        'F5F5F5': '#F5F5F5', 
        'B1B1B1': '#B1B1B1', 
        '0E5C4E': '#0E5C4E', 
        '8B2E2E': '#8B2E2E', 
        '2A2A2A': '#2A2A2A', 
        'E6E2D3': '#E6E2D3', 
        'D8CBAF': '#D8CBAF', 

        /* Semantic Aliases for Dark Theme */
        'primary-bg': '#111111',
        'accent-platinum': '#DAD5C1',
        'text-light': '#F5F5F5',
        'card-bg': '#2A2A2A',

        /* Light Theme (Vibe Match) */
        'light-bg': '#f7f3f1',
        'light-primary': '#ff5a5f',
        'light-secondary': '#333333',
        'light-card-bg': '#FFFFFF',
        'light-muted': '#737373',
      },
      fontFamily: {
        'serif': ['Playfair Display', 'serif'],
        'sans': ['Inter', 'sans-serif'],
      },
      lineHeight: {
        'tighter-custom': '1.19',
      },
    },
  },
  plugins: [],
};