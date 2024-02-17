const colors = require('tailwindcss/colors');
const plugin = require('tailwindcss/plugin');

const svelteUx = require('svelte-ux/plugins/tailwind.cjs');

module.exports = {
  content: ['./src/**/*.{html,svelte,md}', './node_modules/svelte-ux/**/*.{svelte,js,md}'],
  ux: {
    themes: require('./themes.json'),
    // themes: {
    //   light: {
    //     primary: colors['blue']['500'],
    //     'primary-content': 'white',
    //     secondary: colors['cyan']['300'],
    //     'surface-100': 'white',
    //     'surface-200': colors['gray']['100'],
    //     'surface-300': colors['gray']['300'],
    //     'surface-content': colors['gray']['900'],
    //   },
    // },
  },
  theme: {
    extend: {
      typography: (theme) => ({
        DEFAULT: {
          css: {
            // Reduce font size
            h1: {
              fontSize: theme('fontSize.2xl')[0],
              fontWeight: theme('fontWeight.extrabold'),
            },
            h2: {
              fontSize: theme('fontSize.xl')[0],
              fontWeight: theme('fontWeight.bold'),
              marginTop: theme('spacing.3'),
            },
            h3: {
              fontSize: theme('fontSize.lg')[0],
              fontWeight: theme('fontWeight.semibold'),
            },
          },
        },
      }),
    },
  },
  plugins: [require('@tailwindcss/typography'), svelteUx],
};
