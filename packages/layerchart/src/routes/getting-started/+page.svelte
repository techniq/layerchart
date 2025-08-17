<script lang="ts">
  import { ToggleGroup, ToggleOption, Kbd } from 'svelte-ux';

  import Code from '$lib/docs/Code.svelte';
  import Blockquote from '$lib/docs/Blockquote.svelte';

  let selectedTab = 'standalone';
</script>

<div class="prose max-w-none bg-surface-100 rounded-sm border p-4 mt-4 m-2">
  <h1>Getting started</h1>

  <h2>Installation</h2>
  <ToggleGroup
    bind:value={selectedTab}
    variant="underline"
    classes={{ options: 'justify-start h-10 mb-3' }}
  >
    <ToggleOption value="standalone">Standalone</ToggleOption>
    <ToggleOption value="svelte-ux">with Svelte UX</ToggleOption>
  </ToggleGroup>

  <div class="grid gap-3">
    {#if selectedTab === 'svelte-ux'}
      <div>
        <h2>Setup project</h2>
        <p>
          Follow the
          <a href="https://svelte-ux.techniq.dev/">Svelte UX</a> instructions to create a new project
        </p>
      </div>
    {:else if selectedTab === 'standalone'}
      <div>
        <h2>Setup project</h2>

        <p>
          To get started with a new project, use <a
            href="https://svelte.dev/docs/cli/sv-create"
            target="_blank">npx sv create</a
          >, or add Tailwind to an existing project using
          <a href="https://svelte.dev/docs/cli/sv-add" target="_blank">npx sv add tailwindcss</a>.
          See also the official Tailwind
          <a href="https://tailwindcss.com/docs/guides/sveltekit" target="_blank">guide</a>.
        </p>

        You can also use LayerChart within your existing project, such as
        <a href="https://www.skeleton.dev/" target="_blank">Skeleton</a>,
        <a href="https://www.shadcn-svelte.com/" target="_blank">shadcn-svelte</a>, or
        <a href="https://daisyui.com/" target="_blank">Daisy UI</a>. See
        <a href="https://github.com/techniq/layerchart/issues/160" target="_blank">here</a>
        for ways to map colors to various framework palettes.

        <Blockquote>
          <div>
            Ongoing investigation to support non-Tailwind projects is being investigated, including
            using <a href="https://unocss.dev/" target="_blank">UnoCSS</a> or vanilla CSS, but they are
            undocumented and unsupported at this time.
          </div>
        </Blockquote>
      </div>
    {:else if selectedTab === 'manual'}
      <div>
        Follow the Tailwind <a href="https://tailwindcss.com/docs/guides/sveltekit" target="_blank">
          guide
        </a> to setup a new SvelteKit project with Tailwind.
      </div>

      <div>Add Svelte UX package</div>
      <Code source={`npm install svelte-ux`} language="sh" />
    {/if}
  </div>

  <h2>Install package</h2>

  <div>Install <code>layerchart</code> package</div>
  <Code source={`npm install layerchart@next`} language="sh" />

  <Blockquote>
    <div>
      <div class="mb-1">
        Depending on the example, you will typically need additional <code>d3</code> packages such
        as <code>d3-scale</code> and <code>d3-array</code>
      </div>
      <Code source={`npm install d3-scale d3-array`} language="sh" />
    </div>
  </Blockquote>

  <div>
    Add LayerChart directory as a source to your <code>app.css</code> to be scanned by
    <a
      href="https://tailwindcss.com/docs/detecting-classes-in-source-files#explicitly-registering-sources"
      target="_blank">Tailwind</a
    >.
  </div>
  <Code
    source={`@import 'tailwindcss';
@source '../node_modules/layerchart/dist';`}
    language="css"
  />

  <p>
    You will also need to add a few theme colors to your Tailwind config. This can be done
    explicitly (includig <a href="https://github.com/techniq/layerchart/issues/160" target="_blank"
      >mapping</a
    > to existing CSS variables of popular frameworks).
  </p>

  <Code
    source={`@theme {
  --color-primary: hsl(...);
  --color-surface-100: hsl(...);
  --color-surface-200: hsl(...);
  --color-surface-300: hsl(...);
  --color-surface-content: hsl(...);
}`}
    language="css"
  />

  <p>or by leveraging one of LayerStack's themes.</p>

  <Code
    source={`/* Set up theme colors */
@import '@layerstack/tailwind/core.css';

/* Then choose one of the following: */

/* 1. Basic light/dark theme */
@import '@layerstack/tailwind/themes/basic.css';

/* 2. All Daisy UI themes ported to LayerStack */
@import '@layerstack/tailwind/themes/daisy.css';

/* 3. All Skeleton themes ported to LayerStack */
@import '@layerstack/tailwind/themes/skeleton.css';

/* 4. All Daisy UI and Skeleton themes ported to LayerStack (used by docs) */
@import '@layerstack/tailwind/themes/all.css';
`}
    language="css"
  />

  <h2>Usage</h2>

  <p>LayerChart components can be easily imported into your project.</p>

  <Code
    source={'<' +
      `script>
  import { Chart, Layer, Axis, Bars } from 'layerchart';
</script>`}
    language="svelte"
  />

  <p>
    Search docs using <Kbd command class="text-xs">K</Kbd> or browse using the sidebar navigation.
  </p>

  <h2>Examples</h2>

  <p>
    This site has many examples of creating visualizations using LayerChart components. Below each
    example has a <strong>Show code</strong> link that displays the code for that visualization.
  </p>

  <div>
    The examples do not currently show the importing of LayerChart components, utilties, or external
    libraries (i.e.<code>{'<script>'}</code>
    block). You can view the full page source by clicking on <strong>Page source</strong> at the top
    of each examples page. This will show you all of the imports used for that page.
  </div>

  <h2>Svelte UX</h2>

  Lastly, take a look at the complement project
  <a href="https://svelte-ux.techniq.dev/">Svelte UX</a> for a large collection of Svelte components,
  actions, stores, and utilities to build highly interactive applications.
</div>

<style lang="postcss">
  :global(.Code) {
    @apply border rounded;
  }
</style>
