

# Welcome to LayerChart

## Introduction

LayerChart is a large collection of visualization components and utilities for [Svelte](https://svelte.dev/), built upon the wonderful [Layer Cake](https://layercake.graphics/) framework.

The goal is to provide a collection of useful but mostly unopinionated components as building blocks for a wide range of visualizations, such as:

- Cartesian (Bar, Area, Stack, Scatter, ...)
- Radial (Pie, Arc, Sunburst, ...)
- Hierarchy (Pack, Tree, Treemap, Sunburst, ...)
- Graph (Sankey, ...)
- Geo (Choropleth, Spike, Bubble, Point, Globe, ...)

The library accomplishes this through a large assortment of components:

- Data-driven components (Area, Bars, Spline, ...)
- Motion-enabled SVG primatives (Rect, Circle, Arc, Group, ...)
- SVG utilities (gradient/patterns, clipping, multi-line SVG text, motion path, ...)
- Interaction (tooltip, pan/zoom)
- Hierarchy layout and geo projections
- Legends, annotations, and many more!

## Requirements
 - A Svelte or SvelteKit project using Tailwind
   - [Guide to Install Tailwind with SvelteKIt](https://tailwindcss.com/docs/guides/sveltekit)

## Installation

* Install layerchart
```sh
npm install layerchart
```
* Update tailwind.config.js
  * Make sure Tailwind picks up styles from *layerchart* and *svelte-ux*
  * Add accent color used by *layerchart*
  * Add *svelte-ux* plugin that has some extra utilties classes

Below is a simplified *tailwind.config.js* file showing the key parts needed for LayerChart. You may have other plugins, colors, or addition settings.
```js
const colors = require('tailwindcss/colors');

module.exports = {
  content: ['./src/**/*.{html,svelte,js,ts}', './node_modules/svelte-ux/**/*.{svelte,js}', './node_modules/layerchart/dist/components/*.{svelte,js}'],
  theme: {
    extend: {
      colors: {
        accent: colors.indigo,
      },
    },
  },
  plugins: [
    require('svelte-ux/plugins/tailwind.cjs'),
  ]
}
```
## Importing LayerChart components
LayerChart components can be easily imported into your project.

```js
import {Chart, Svg, Axis, Bars} from 'layerchart'
```


## Using Examples
This site has many examples of creating visuzliations using LayerChart components. Below each example is a **< > Show code** link that displays the code for that visualization.

The examples do not show importing of LayerChart components and utilties and external libraries. You can view the source for the entire page top of each docs page. This will show you all of the imports used for the page.

**Note: This site is built from layerchart's codebase and does not npm install layerchart. Therefore it imports layechart components differently.**

The page source will show:

```js
import Chart, { Svg } from '$lib/components/Chart.svelte';
import Axis from '$lib/components/Axis.svelte';
import Bars from '$lib/components/Bars.svelte';
```

If you followed instructions to `npm install layerchart` your code should be:

```js
import {Chart, Svg, Axis, Bars} from 'layerchart'
```

## Layer Cake

It is also recommmended to read through [Layer Cake](https://layercake.graphics/)'s documentation for a deeper understanding of how LayerChart works.

Lastly, take a look at the complement project [svelte-ux](https://svelte-ux.techniq.dev/) for a large collection of Svelte components, actions, stores, and utilities to build highly interactive applications.