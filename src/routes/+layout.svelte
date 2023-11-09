<script lang="ts">
  import { inject } from '@vercel/analytics';
  import { mdiGithub, mdiOpenInNew, mdiTwitter } from '@mdi/js';
  import 'prism-themes/themes/prism-vsc-dark-plus.css';
  import {
    AppBar,
    AppLayout,
    Button,
    QuickSearch,
    Tooltip,
    createTheme,
    sortFunc,
  } from 'svelte-ux';

  import { dev } from '$app/environment';
  import { afterNavigate, goto } from '$app/navigation';

  import NavMenu from './_NavMenu.svelte';

  inject({ mode: dev ? 'development' : 'production' });

  createTheme({
    // AppBar: 'bg-accent-500 text-white shadow-md',
  });

  let mainEl: HTMLElement;
  afterNavigate(() => {
    // @ts-ignore: `instant` not in spec, but supported by Chrome/Firefox - https://kilianvalkhof.com/2022/css-html/preventing-smooth-scrolling-with-javascript/
    mainEl.scrollTo({ top: 0, behavior: 'instant' });
  });

  const groups = ['examples', 'components', 'utils'];
  const quickSearchOptions = Object.entries(
    import.meta.glob('./docs/**/+page.(md|svelte)', { as: 'raw', eager: true })
  )
    .flatMap(([file, source]) => {
      const url = file.replace('.', '').replace(/\/\+page.(md|svelte)/, '');
      const [_, docs, group, name] = url.split('/');
      return {
        name,
        value: url,
        group: group,
      };
    })
    .sort(sortFunc((d) => groups.indexOf(d.group)));
</script>

<AppLayout>
  <nav slot="nav" class="nav h-full">
    <NavMenu />
    <!-- Spacer -->
    <div class="h-4" />
  </nav>

  <AppBar title="LayerChart">
    <div slot="actions" class="flex gap-3">
      <Button
        href="https://svelte-ux.techniq.dev"
        icon={mdiOpenInNew}
        target="_blank"
        class="p-2 max-md:hidden"
      >
        svelte-ux
      </Button>

      <QuickSearch options={quickSearchOptions} on:change={(e) => goto(e.detail.value)} />

      <Tooltip title="Discord" placement="left" offset={2}>
        <Button
          icon="M20.33 5.06C18.78 4.33 17.12 3.8 15.38 3.5 15.17 3.89 14.92 4.4 14.74 4.82 12.9 4.54 11.07 4.54 9.26 4.82 9.09 4.4 8.83 3.89 8.62 3.5 6.88 3.8 5.21 4.33 3.66 5.06 0.53 9.79-0.32 14.41 0.1 18.96 2.18 20.52 4.19 21.46 6.17 22.08 6.66 21.4 7.1 20.69 7.48 19.93 6.76 19.66 6.07 19.33 5.43 18.94 5.6 18.81 5.77 18.68 5.93 18.54 9.88 20.39 14.17 20.39 18.07 18.54 18.23 18.68 18.4 18.81 18.57 18.94 17.92 19.33 17.24 19.66 16.52 19.94 16.9 20.69 17.33 21.41 17.82 22.08 19.8 21.46 21.82 20.52 23.9 18.96 24.4 13.69 23.05 9.11 20.33 5.06ZM8.01 16.17C6.83 16.17 5.86 15.06 5.86 13.71 5.86 12.36 6.81 11.25 8.01 11.25 9.22 11.25 10.19 12.36 10.17 13.71 10.17 15.06 9.22 16.17 8.01 16.17ZM15.99 16.17C14.8 16.17 13.83 15.06 13.83 13.71 13.83 12.36 14.78 11.25 15.99 11.25 17.19 11.25 18.17 12.36 18.14 13.71 18.14 15.06 17.19 16.17 15.99 16.17Z"
          href="https://discord.gg/697JhMPD3t"
          class="p-2"
          target="_blank"
        />
      </Tooltip>

      <Tooltip title="Open Twitter / X" placement="left" offset={2}>
        <Button
          icon={mdiTwitter}
          href="https://twitter.com/techniq35"
          class="p-2"
          target="_blank"
        />
      </Tooltip>

      <Tooltip title="View repository" placement="left" offset={2}>
        <Button
          icon={mdiGithub}
          href="https://github.com/techniq/layerchart"
          class="p-2"
          target="_blank"
        />
      </Tooltip>
    </div>
  </AppBar>

  <main class="scroll-smooth" bind:this={mainEl}>
    <slot />
  </main>
</AppLayout>

<style lang="postcss">
  @tailwind base;
  @tailwind components;
  @tailwind utilities;

  :global(main h1:not(.prose *, .related *, .ApiDocs *)) {
    @apply text-xl font-semibold mt-4 mb-2 border-b border-gray-400 pb-1;
    scroll-margin-top: 128px; /* sticky header */
  }

  :global(main h2:not(.prose *, .related *, .ApiDocs *)) {
    @apply text-lg font-semibold mt-4 mb-1;
    scroll-margin-top: 128px; /* sticky header */
  }

  :global(main h3:not(.prose *, .related *, .ApiDocs *)) {
    @apply text-xs text-black/50 mb-1;
    scroll-margin-top: 128px; /* sticky header */
  }
  :global(main :not(.prose) h2 + h3) {
    @apply -mt-1;
  }

  :global(main small) {
    @apply text-xs text-black/50;
  }

  :global(.TableOfContents small) {
    @apply hidden;
  }

  /* Theme */

  :global(body) {
    @apply bg-neutral-200 accent-accent-500;
  }

  :global(nav) {
    @apply bg-neutral-800 py-2;
  }

  :global(nav h1) {
    @apply py-2 pl-4 mt-4 text-sm text-gray-200 font-bold bg-black/20 border-t border-b border-white/10;
  }

  :global(nav h2) {
    @apply pt-4 pb-2 pl-4 text-xs text-gray-200 font-bold;
  }

  :global(nav .NavItem) {
    @apply text-sm text-gray-400 pl-5 py-2 border-l-4 border-transparent;

    &:hover {
      @apply text-white bg-gray-300/10;
    }

    &.is-active {
      @apply text-accent-100 bg-gray-500/10 border-accent-500;
    }
  }

  :global(.AppBar) {
    @apply bg-accent-500 text-white shadow-md;
  }
</style>
