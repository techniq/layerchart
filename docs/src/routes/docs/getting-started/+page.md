<script lang="ts">
  import Example from '$lib/components/Example.svelte';
</script>

# Getting Started

LayerChart can be used standlone, or integrates with frameworks and design systems.

First class support for Tailwind is built in, but is not required and works great with standard CSS and inline styles.

Integration reference [examples](https://github.com/techniq/layerchart/tree/next/examples) are available for many popular frameworks including:

- [daisyUI](https://daisyui.com/)
  - [v5 example](https://github.com/techniq/layerchart/tree/docs-v2/examples/daisyui-5)
- [shadcn-svelte](https://www.shadcn-svelte.com/)
  - [v1 example](https://github.com/techniq/layerchart/tree/docs-v2/examples/shadcn-svelte-1)
  - See also the official [integration](https://www.shadcn-svelte.com/charts)
- [Skeleton](https://www.skeleton.dev/)
  - [v3 example](https://github.com/techniq/layerchart/tree/docs-v2/examples/skeleton-3)
  - [v4 example](https://github.com/techniq/layerchart/tree/docs-v2/examples/skeleton-4)
- [Svelte UX](https://github.com/techniq/layerchart/tree/docs-v2/examples/svelte-ux-2)

or checkout out the [standlone example](https://github.com/techniq/layerchart/tree/docs-v2/examples/standalone) for a pure CSS example.

## Manual setup

To manually setup LayerChart in a new project (such as one ceated with [sv create](https://svelte.dev/docs/cli/sv-create)) or in an existing project.

First import `layerchart` with your package manager of choice:

```sh
npm install layerchart
# or
pnpm install layerchart
```

then import the components from `layerchart`:

```svelte
<script lang="ts">
	import { LineChart } from 'layerchart';
	import { createDateSeries } from '$lib/utils/data.js';

	const data = createDateSeries({ count: 30, min: 50, max: 100, value: 'integer' });
</script>

<LineChart {data} x="date" y="value" height={300} />
```

<!-- <Example component="LineChart" example="basic" /> -->

Lastly, looking through the large collection of [examples](/docs/examples).

## CSS variables

Out of the box LayerChart will use `currentColor` as the default color, but you can custimize globally with a few CSS variables.

```css
.lc-root-container {
	/* Default marks color when not using explicit color or color scale */
	--color-primary: var(--color-blue-500);

	/* Progressively darker shades representing surfaces (backgrounds). */
	--color-surface-100: var(--color-white);
	--color-surface-200: var(--color-gray-100);
	--color-surface-300: var(--color-gray-300);

	/* Content (text) color */
	--color-surface-content: var(--color-gray-900);
}
```

LayerChart [provides](https://github.com/techniq/layerchart/tree/next/packages/layerchart/src/lib/styles) `.css` files for popular frameworks to simplify the setup with a single import

### daisyUI

```css
@import 'layerchart/daisyui-5.css';
```

### shadcn-svelte

```css
@import 'layerchart/shadcn-svelte.css';
```

### Skeleton

#### v3

```css
@import 'layerchart/skeleton-3.css';
```

#### v4

```css
@import 'layerchart/skeleton-4.css';
```
