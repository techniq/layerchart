# @layerstack/docs

Reusable docs tooling for LayerStack projects.

The package assumes the same docs layout across projects. Prefer following the conventions below over adding per-project configuration.

## Expected Layout

```txt
repo/
  docs/
    content-collections.ts
    mdsx.config.js
    src/
      content/
        components/*.md
        guides/*.md
        utils/*.md
      examples/
        components/{ComponentName}/*.svelte
        utils/{utilName}/*.svelte
        catalog/*.json
      lib/
        components/
    generated/
      api/*.json
      releases/*.md
  packages/
    {packageName}/
      src/lib/
        components/
        utils/
```

## Content Collections

Use the shared content-collections config from the docs app:

```ts
// docs/content-collections.ts
import { createContentConfig } from '@layerstack/docs/content-collections';

export default createContentConfig({
	packageName: 'layerchart'
});
```

By convention this reads sources from `../packages/{packageName}/src/lib`, docs content from `src/content`, generated API from `generated/api`, example catalogs from `src/examples/catalog`, and releases from `generated/releases`.

The default source-link repository is `techniq/{packageName}` on the `next` branch. Override only when a project does not follow that convention:

```ts
export default createContentConfig({
	packageName: 'svelte-ux',
	repo: 'techniq/svelte-ux',
	branch: 'next'
});
```

## Markdown

Use the shared MDSX config:

```js
// docs/mdsx.config.js
import { createMdsxConfig } from '@layerstack/docs/markdown/config';

export const mdsxConfig = createMdsxConfig({
	exampleComponentPath: '$lib/components'
});
```

Markdown components are provided by `@layerstack/docs/markdown/components`.

## Tailwind

Import the package Tailwind source hints after Tailwind and theme imports:

```css
@import 'tailwindcss';
@import '@layerstack/tailwind/core.css';
@import '@layerstack/tailwind/utils.css';
@import '@layerstack/tailwind/themes/all.css';
@import '@layerstack/docs/styles.css';
```

This keeps docs apps from hard-coding monorepo paths to `@layerstack/docs` source files.

## Components

Reusable docs UI components are exported from `@layerstack/docs/components`:

```svelte
<script>
	import { Code, Json, LoadingPlaceholder } from '@layerstack/docs/components';
</script>
```

These components are intentionally app-agnostic. Components that still depend on project content, generated collections, or LayerChart runtime behavior should stay in the docs app until those dependencies are parameterized.

## Generators

Docs apps should call the CLI directly:

```json
{
	"scripts": {
		"generate:api": "layerstack-docs generate-api ../packages/layerchart/src/lib/components generated/api",
		"generate:catalog": "layerstack-docs generate-catalog ../packages/layerchart/src/lib/components src/examples/components src/examples/catalog",
		"generate:screenshots": "layerstack-docs generate-screenshots src/examples/components static/screenshots",
		"generate:releases": "layerstack-docs generate-releases techniq/layerchart generated/releases"
	}
}
```

Available commands:

```txt
layerstack-docs generate-api <components-dir> <output-dir>
layerstack-docs generate-catalog <components-dir> <examples-dir> <catalog-dir>
layerstack-docs generate-screenshots <examples-dir> <screenshots-dir> [--base-url <url>] [--route-base <path>] [--all]
layerstack-docs generate-stackblitz <template-dir> <source-dir> <output-file> [remote-sources-file] [--source output=source] [--remote output=source]
layerstack-docs generate-releases <owner/repo> <output-dir>
```

## Shared Runtime Helpers

Use `@layerstack/docs/examples` for shared example types, source cleanup, and `createExampleLoaders`. Docs apps still provide the concrete Vite imports so the bundler can see local files:

```ts
// docs/src/lib/examples.ts
import { createExampleLoaders } from '@layerstack/docs/examples';

export const { loadExample, loadExamples, loadExampleByPath } = createExampleLoaders({
	loadComponentExample: (type, component, name) =>
		import(`../examples/${type}/${component}/${name}.svelte`),
	loadRawExample: async (type, component, name) =>
		(await import(`../examples/${type}/${component}/${name}.svelte?raw`)).default,
	loadPathExample: (path) => pathExamples[path]?.(),
	loadRawPathExample: (path) => rawPathExamples[path]?.()
});
```

Use `@layerstack/docs/content` for markdown document/example loading conventions, `@layerstack/docs/context` for the shared examples context, and `@layerstack/docs/collections` for conventional collection sorting.
