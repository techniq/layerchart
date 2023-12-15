const colors = require('tailwindcss/colors');
const plugin = require('tailwindcss/plugin');

module.exports = {
  content: ['./src/**/*.{html,svelte,md}', './node_modules/svelte-ux/**/*.{svelte,js,md}'],
  theme: {
    extend: {},
  },
  plugins: [require('@tailwindcss/typography'), require('svelte-ux/plugins/tailwind.cjs')],
};
