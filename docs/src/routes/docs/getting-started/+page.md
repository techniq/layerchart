<script lang="ts">
	import { Button } from 'svelte-ux';
  import Example from '$lib/components/Example.svelte';
	import TabbedCode from '$lib/components/TabbedCode.svelte';
  import {
		a as A,
		ul as Ul,
		li as Li
	} from '$lib/markdown/components';

	import LucideGithub from '~icons/lucide/github';
	import SimpleIconsStackblitz from '~icons/simple-icons/stackblitz'

	const integrations = {
		daisyUI: {
			url: 'https://daisyui.com/',
			versions: {
				v5: 'daisyui-5'
			}
		},
		"shadcn-svelte": {
			url: 'https://www.shadcn-svelte.com/',
			versions: {
				v1: 'shadcn-svelte-1'
			}
		},
		Skeleton: {
			url: 'https://www.skeleton.dev/',
			versions: {
				v3: 'skeleton-3',
				v4: 'skeleton-4',
			}
		},
		'Svelte UX': {
			url: 'https://svelte-ux.techniq.dev/',
			versions: {
				v2: 'svelte-ux-2',
			}
		},
	}

	const layerchartOptions = [
		{
			value: 0,
			label: 'pnpm',
			source: 'pnpm i layerchart',
		},
				{
			value: 1,
			label: 'npm',
			source: 'npm i layerchart',
		},
				{
			value: 2,
			label: 'bun',
			source: 'bun add layerchart',
		},
				{
			value: 3,
			label: 'deno',
			source: 'deno add layerchart',
		},
				{
			value: 4,
			label: 'yarn',
			source: 'yarn add layerchart',
		},
	]

	const integrationOptions = [
		{
			value: 0,
			label: 'shadcn-svelte',
			source: "@import 'layerchart/shadcn-svelte.css';"
		},
		{
			value: 1,
			label: 'Skeleton 3',
			source: "@import 'layerchart/skeleton-3.css';"
		},
		{
			value: 2,
			label: 'Skeleton 4',
			source: "@import 'layerchart/skeleton-4.css';"
		},
		{
			value: 3,
			label: 'Svelte UX',
			source: "/* Works out of the box */"
		},
		{
			value: 4,
			label: 'DaisyUI 5',
			source: "@import 'layerchart/daisyui-5.css';"
		},
	];
</script>

# Getting Started

LayerChart can be used standlone, or integrates with frameworks and design systems.

First class support for Tailwind is built in, but is not required and works great with standard CSS and inline styles.

Integration reference [projects](https://github.com/techniq/layerchart/tree/next/examples) are available for many popular frameworks:

<Ul>
	{#each Object.entries(integrations) as [name, info]}
		<Li>
			<A href={info.url} target="_blank">{name}</A>
			<Ul>
				{#each Object.entries(info.versions) as [version, path]}
					<Li>
						{version}
						{@render githubButton(path)}
						{@render stackBlitzButton(path)}
					</Li>
				{/each}
				{#if name === 'shadcn-svelte'}
					<Li>
						See also the official <A href="https://www.shadcn-svelte.com/charts" target="_blank">integration</A>
					</Li>
				{/if}
			</Ul>
		</Li>
	{/each}
</Ul>

or checkout out the **standlone** {@render githubButton('standalone')} {@render stackBlitzButton('standalone')} for a pure CSS example.

## Manual setup

To manually setup LayerChart in a new project (such as one created with [sv create](https://svelte.dev/docs/cli/sv-create)) or in an existing project.

First import `layerchart` with your package manager of choice:

<TabbedCode language="sh" options={layerchartOptions} />

then import the components from `layerchart`:

<Example component="LineChart" name="basic" showCode />

Lastly, looking through the large collection of [examples](/docs/examples) for some inspiration.

## CSS variables

Out of the box LayerChart will use `currentColor` as the default color, but you can customize globally with a few CSS variables.

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

<TabbedCode language="css" options={integrationOptions} />

{#snippet githubButton(path, text = 'Source')}
<Button href="https://github.com/techniq/layerchart/tree/docs-v2/examples/{path}" icon={LucideGithub} size="sm" variant="fill-light" target="\_blank">{text}</Button>
{/snippet}

{#snippet stackBlitzButton(path, text = 'Open in StackBlitz')}
<Button href="https://stackblitz.com/github/techniq/layerchart/tree/docs-v2/examples/{path}" icon={SimpleIconsStackblitz} size="sm" variant="fill-light" target="\_blank">{text}</Button>
{/snippet}
