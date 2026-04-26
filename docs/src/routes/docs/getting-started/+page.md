---
title: Getting Started
---

LayerChart provides built-in first class support for [:icon{name="logos:tailwindcss-icon" class="text-xs"} Tailwind 4](https://tailwindcss.com/),
but this is completely optional. The library also works seamlessly with vanilla CSS, inline styles, and [:icon{name="logos:unocss"} unoCSS](https://unocss.dev/). It can be used standlone, or integrates nicely with other frameworks and design systems.

::steps

## Create a new project or [git a project](#git-up-and-running-even-quicker)

Use the Svelte `sv` CLI to generate a new SvelteKit project.

:::tabs{key="bundler"}

    ::tab{label="pnpm" icon="vscode-icons:file-type-pnpm"}
    ```sh
    pnpx sv create my-app add --tailwindcss
    cd my-app
    ```
    ::

    ::tab{label="npm" icon="vscode-icons:file-type-npm"}
    ```sh
    npx sv create my-app add --tailwindcss
    cd my-app
    ```
    ::

    ::tab{label="bun" icon="vscode-icons:file-type-bun"}
    ```sh
    bunx sv create my-app add --tailwindcss
    cd my-app
    ```
    ::

    ::tab{label="deno" icon="vscode-icons:file-type-deno"}
    ```sh
    npx sv create my-app add --tailwindcss
    cd my-app
    ```
    ::

    ::tab{label="yarn" icon="vscode-icons:file-type-yarn"}
    ```sh
    npx sv create my-app add --tailwindcss
    cd my-app
    ```
    ::

:::

::note
To add Tailwind to an existing Sveltekit project you can `npx sv add tailwindcss`
::

## Import `layerchart` with your package manager of choice.

:::tabs{key="bundler"}

    ::tab{label="pnpm" icon="vscode-icons:file-type-pnpm"}
    ```sh
    pnpm i layerchart
    ```
    ::

    ::tab{label="npm" icon="vscode-icons:file-type-npm"}
    ```sh
    npm i layerchart
    ```
    ::

    ::tab{label="bun" icon="vscode-icons:file-type-bun"}
    ```sh
    bun add layerchart
    ```
    ::

    ::tab{label="deno" icon="vscode-icons:file-type-deno"}
    ```sh
    deno add layerchart
    ```
    ::

    ::tab{label="yarn" icon="vscode-icons:file-type-yarn"}
    ```sh
    yarn add layerchart
    ```
    ::

:::

## Apply CSS

Out of the box LayerChart will use [`currentColor`](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Values/color_value#currentcolor_keyword) as the default primary color, but you can customize the CSS globally with a few CSS variables.

```css title="app.css"
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

::note
If you wish to apply darkmode defaults, see the [dark mode](/docs/guides/styles#dark-mode) section of the styling guide.
::

or with a single `.css` import, Layerchart [provides](https://github.com/techniq/layerchart/tree/next/packages/layerchart/src/lib/styles) theming conventions for many popular UI frameworks.

:::tabs{key="framework"}

    ::tab{label="shadcn-svelte" icon="custom-brands:shadcnsvelte"}
    ```css title="app.css"
    @import 'layerchart/shadcn-svelte.css';
    ```
    ::


    ::tab{label="Skeleton" icon="custom-brands:skeleton"}
    ```css title="app.css"
    /* v3 */
    @import 'layerchart/skeleton-3.css';

    /* v4 */
    @import 'layerchart/skeleton-4.css';
    ```
    ::

    ::tab{label="Svelte UX" icon="custom-brands:svelteux"}
    ```css title="app.css"
    /* Works out of the box! */
    ```
    ::

    ::tab{label="daisyUI" icon="custom-brands:daisyUI"}
    ```css title="app.css"
    @import 'layerchart/daisyui-5.css';
    ```
    ::

:::

## Create you first chart

Import the charting components you need from `layerchart`. Don't forget to take a look at the large collection of [examples](/docs/examples) for some additonal inspiration.

:example{component="LineChart" name="basic" showCode=true}

## Done!

All set! Now just fire up the dev server and start iterating. Have fun!

:::tabs{key="bundler"}

    ::tab{label="pnpm" icon="vscode-icons:file-type-pnpm"}
    ```sh
    pnpm dev
    ```
    ::

    ::tab{label="npm" icon="vscode-icons:file-type-npm"}
    ```sh
    npm run dev
    ```
    ::

    ::tab{label="bun" icon="vscode-icons:file-type-bun"}
    ```sh
    bun run dev
    ```
    ::

    ::tab{label="deno" icon="vscode-icons:file-type-deno"}
    ```sh
    deno task dev
    ```
    ::

    ::tab{label="yarn" icon="vscode-icons:file-type-yarn"}
    ```sh
    yarn dev
    ```
    ::

:::

::

### Git up and running even quicker!

Starter [project repos](https://github.com/techniq/layerchart/tree/next/examples) are available for popular UI frameworks.

:::tabs{key="framework"}

    ::tab{label="shadcn-svelte" icon="custom-brands:shadcnsvelte"}
    [shadcn-svelte](https://www.shadcn-svelte.com/)

    - v1:
        :button{label="Source" href="https://github.com/techniq/layerchart/tree/docs-v2/examples/shadcn-svelte-1" size="sm" icon="lucide:github"}
        :button{label="Open in StackBlitz" href="https://stackblitz.com/github/techniq/layerchart/tree/docs-v2/examples/shadcn-svelte-1" size="sm" icon="simple-icons:stackblitz"}
    ::

    ::tab{label="Skeleton" icon="custom-brands:skeleton"}
    [Skeleton](https://www.skeleton.dev/)

    - v3:
        :button{label="Source" href="https://github.com/techniq/layerchart/tree/docs-v2/examples/skeleton-3" size="sm" icon="lucide:github"}
        :button{label="Open in StackBlitz" href="https://stackblitz.com/github/techniq/layerchart/tree/docs-v2/examples/skeleton-3" size="sm" icon="simple-icons:stackblitz"}
    - v4:
        :button{label="Source" href="https://github.com/techniq/layerchart/tree/docs-v2/examples/skeleton-4" size="sm" icon="lucide:github"}
        :button{label="Open in StackBlitz" href="https://stackblitz.com/github/techniq/layerchart/tree/docs-v2/examples/skeleton-4" size="sm" icon="simple-icons:stackblitz"}
    ::

    ::tab{label="Svelte UX" icon="custom-brands:svelteux"}
    [Svelte UX](https://svelte-ux.techniq.dev/)

    - v2:
        :button{label="Source" href="https://github.com/techniq/layerchart/tree/docs-v2/examples/svelte-ux-2" size="sm" icon="lucide:github"}
        :button{label="Open in StackBlitz" href="https://stackblitz.com/github/techniq/layerchart/tree/docs-v2/examples/svelte-ux-2" size="sm" icon="simple-icons:stackblitz"}
    ::

    ::tab{label="daisyUI" icon="custom-brands:daisyUI"}
    [daisyUI](https://daisyui.com/)

    - v5:
        :button{label="Source" href="https://github.com/techniq/layerchart/tree/docs-v2/examples/daisyui-5" size="sm" icon="lucide:github"}
        :button{label="Open in StackBlitz" href="https://stackblitz.com/github/techniq/layerchart/tree/docs-v2/examples/daisyui-5" size="sm" icon="simple-icons:stackblitz"}
    ::

    ::tab{label="UnoCSS" icon="logos:unocss"}
    [UnoCSS](https://unocss.dev/)

    -
        :button{label="Source" href="https://github.com/techniq/layerchart/tree/docs-v2/examples/unocss" size="sm" icon="lucide:github"}
        :button{label="Open in StackBlitz" href="https://stackblitz.com/github/techniq/layerchart/tree/docs-v2/examples/unocss-1" size="sm" icon="simple-icons:stackblitz"}
    ::

    ::tab{label="Vanilla CSS" icon="vscode-icons:file-type-css"}
    Vanilla CSS

    -
        :button{label="Source" href="https://github.com/techniq/layerchart/tree/docs-v2/examples/standalone" size="sm" icon="lucide:github"}
        :button{label="Open in StackBlitz" href="https://stackblitz.com/github/techniq/layerchart/tree/docs-v2/examples/standalone" size="sm" icon="simple-icons:stackblitz"}
    ::

:::
