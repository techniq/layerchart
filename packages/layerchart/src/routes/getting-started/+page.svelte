<script lang="ts">
  import { ToggleGroup, ToggleOption, Kbd } from 'svelte-ux';

  import Code from '$lib/docs/Code.svelte';
  import Blockquote from '$lib/docs/Blockquote.svelte';

  let selectedTab = 'svelte-ux';
</script>

<div class="prose max-w-none bg-surface-100 rounded border p-4 mt-4 m-2">
  <h1>Getting started</h1>

  <h2>Installation</h2>
  <ToggleGroup
    bind:value={selectedTab}
    variant="underline"
    classes={{ options: 'justify-start h-10 mb-3' }}
  >
    <ToggleOption value="svelte-ux">with Svelte UX</ToggleOption>
    <ToggleOption value="standalone">Standalone</ToggleOption>
  </ToggleGroup>

  <div class="grid gap-3">
    {#if selectedTab === 'svelte-ux'}
      <div>
        Follow the <a href="https://svelte-ux.techniq.dev/">Svelte UX</a> instructions to create a new
        project
      </div>

      <div>Install <code>layerchart</code> package</div>
      <Code source={`npm install layerchart`} language="sh" />

      <div>Update LayerChart components to <code>tailwind.config.cjs</code> content</div>
      <Code
        source={`module.exports = {
  content: [
    './src/**/*.{html,svelte}', 
    './node_modules/svelte-ux/**/*.{svelte,js}',
    './node_modules/layerchart/**/*.{svelte,js}' // <--- Add this
  ],
};`}
        language="js"
      />
    {:else if selectedTab === 'standalone'}
      <div>
        Follow the Tailwind <a href="https://tailwindcss.com/docs/guides/sveltekit" target="_blank">
          guide
        </a> to setup a new SvelteKit project with Tailwind.
      </div>

      <div>OR</div>

      <div>Start a new project SvelteKit project</div>
      <Code source={`npm create svelte@latest`} language="sh" />

      <div>Install <code>layerchart</code> package</div>
      <Code source={`npm install layerchart`} language="sh" />

      <div>
        Add and setup Tailwind using <a
          href="https://github.com/svelte-add/tailwindcss"
          target="_blank"
        >
          svelte-add
        </a>
      </div>
      <Code source={`npx svelte-add@latest tailwindcss`} language="sh" />
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

  <h2>Usage</h2>

  <p>LayerChart components can be easily imported into your project.</p>

  <Code
    source={`<script>
  import { Chart, Svg, Axis, Bars } from 'layerchart';
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

  <p>
    The examples do not currently show the importing of LayerChart components, utilties, external
    libraries (i.e.<code>{'<script>'}</code>
    block). You can view the full page source by clicking on **Page source** at the top of each examples
    page. This will show you all of the imports used for that page.
    <Blockquote>
      <div>
        <strong>Note:</strong> This site is built directly from LayerChart's codebase and does not
        <code>npm install layerchart</code>. Therefore it imports components from LayerChart
        differently.
      </div>
    </Blockquote>
  </p>

  <p>The page source will show:</p>
  <Code
    source={`import Chart, { Svg } from '$lib/components/Chart.svelte';
import Axis from '$lib/components/Axis.svelte';
import Bars from '$lib/components/Bars.svelte';`}
    language="js"
  />

  <p>If you followed instructions to `npm install layerchart` your code should be:</p>
  <Code source={`import { Chart, Svg, Axis, Bars } from 'layerchart';`} language="js" />

  <h2>Layer Cake</h2>

  It is also recommmended to read through
  <a href="https://layercake.graphics/">Layer Cake</a>'s documentation for a deeper understanding of
  how LayerChart works.

  <h2>Svelte UX</h2>

  Lastly, take a look at the complement project
  <a href="https://svelte-ux.techniq.dev/">Svelte UX</a> for a large collection of Svelte components,
  actions, stores, and utilities to build highly interactive applications.
</div>
