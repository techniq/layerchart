const colors = require('tailwindcss/colors');
const plugin = require('tailwindcss/plugin');

module.exports = {
  content: ['./src/**/*.{html,svelte,md}', './node_modules/svelte-ux/**/*.{svelte,js,md}'],
  theme: {
    extend: {
      colors: {
        accent: colors.indigo,
      },
    },
  },
  variants: {
    extend: {},
  },
  plugins: [
    require('@tailwindcss/typography'),
    require('svelte-ux/plugins/tailwind.cjs'),

    // Expose color palette as CSS variables (--color-xxx-yyy) - https://gist.github.com/Merott/d2a19b32db07565e94f10d13d11a8574
    plugin(function ({ addBase, theme }) {
      function extractColorVars(colorObj, colorGroup = '') {
        return Object.keys(colorObj).reduce((vars, colorKey) => {
          const value = colorObj[colorKey];

          const newVars =
            typeof value === 'string'
              ? { [`--color${colorGroup}-${colorKey}`]: value }
              : extractColorVars(value, `-${colorKey}`);

          return { ...vars, ...newVars };
        }, {});
      }

      addBase({
        ':root': extractColorVars(theme('colors')),
      });
    }),
  ],
};
