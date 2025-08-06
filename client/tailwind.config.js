export const content = ["./src/**/*.{js,jsx,ts,tsx,html}"];
export const darkMode = "class";
export const theme = {
  extend: {
    animation: {
      'fade-in': 'fadeIn 0.8s ease-out forwards',
      'fade-in-up': 'fadeInUp 0.6s ease-out forwards',
      'fade-in-down': 'fadeInDown 0.6s ease-out forwards',
      'bounce-in': 'bounceIn 0.8s ease-out',
      'shake': 'shake 0.6s ease-in-out',
    },
    keyframes: {
      fadeIn: {
        '0%': { opacity: 0 },
        '100%': { opacity: 1 },
      },
      fadeInUp: {
        '0%': { opacity: 0, transform: 'translateY(20px)' },
        '100%': { opacity: 1, transform: 'translateY(0)' },
      },
      fadeInDown: {
        '0%': { opacity: 0, transform: 'translateY(-20px)' },
        '100%': { opacity: 1, transform: 'translateY(0)' },
      },
      bounceIn: {
        '0%, 20%, 40%, 60%, 80%, 100%': { transform: 'translateY(0)' },
        '50%': { transform: 'translateY(-10px)' },
      },
      shake: {
        '0%, 100%': { transform: 'translateX(0)' },
        '25%': { transform: 'translateX(-5px)' },
        '75%': { transform: 'translateX(5px)' },
      },
      transitionProperty: {
        'colors': 'background-color, border-color, color, fill, stroke',
      },
    },
  },
};
export const plugins = [
  require('@tailwindcss/forms'),
];
