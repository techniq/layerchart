# Getting Started

## Requirements

- A Svelte or SvelteKit project using Tailwind
  - [Guide to Install Tailwind with SvelteKIt](https://tailwindcss.com/docs/guides/sveltekit)

## Installation

- Install LayerChart

```sh
npm install layerchart
```

- Update Tailwind configuration
  - Make sure Tailwind picks up styles used within _LayerChart_ and _Svelte UX_
  - Add accent color used by _LayerChart_
  - Add _Svelte UX_ plugin that has some extra utilties classes

Below is a simplified _tailwind.config.js_ file showing the key parts needed for LayerChart. You may have other plugins, colors, or additional settings.

```js
const colors = require('tailwindcss/colors');

module.exports = {
  content: [
    './src/**/*.{html,svelte,js,ts}',
    './node_modules/svelte-ux/**/*.{svelte,js}',
    './node_modules/layerchart/**/*.{svelte,js}',
  ],
  theme: {
    extend: {
      colors: {
        accent: colors.indigo,
      },
    },
  },
  plugins: [require('svelte-ux/plugins/tailwind.cjs')],
};
```

## Importing LayerChart components

LayerChart components can be easily imported into your project.

```js
import { Chart, Svg, Axis, Bars } from 'layerchart';
```

## Using Examples

This site has many examples of creating visualizations using LayerChart components. Below each example has a **Show code** link that displays the code for that visualization.

The examples do not currently show the importing of LayerChart components, utilties, external libraries (i.e. `<script>` block). You can view the full page source by clicking on **Page source** at the top of each examples page. This will show you all of the imports used for that page.

> **Note: This site is built directly from LayerChart's codebase and does not _npm install layerchart_. Therefore it imports components from LayerChart differently.**

The page source will show:

```js
import Chart, { Svg } from '$lib/components/Chart.svelte';
import Axis from '$lib/components/Axis.svelte';
import Bars from '$lib/components/Bars.svelte';
```

If you followed instructions to `npm install layerchart` your code should be:

```js
import { Chart, Svg, Axis, Bars } from 'layerchart';
```

## Layer Cake

It is also recommmended to read through [Layer Cake](https://layercake.graphics/)'s documentation for a deeper understanding of how LayerChart works.

## Svelte UX

Lastly, take a look at the complement project [Svelte UX](https://svelte-ux.techniq.dev/) for a large collection of Svelte components, actions, stores, and utilities to build highly interactive applications.
