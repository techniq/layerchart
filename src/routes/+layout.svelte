<script lang="ts">
  import { inject } from '@vercel/analytics';
  import { mdiGithub } from '@mdi/js';
  import 'prism-themes/themes/prism-vsc-dark-plus.css';
  import { AppBar, AppLayout, Button, QuickSearch, Tooltip, createTheme } from 'svelte-ux';

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
        group: group
      };
    })
    .sort((a, b) => groups.indexOf(a.group) - groups.indexOf(b.group));
</script>

<AppLayout>
  <nav slot="nav" class="nav h-full">
    <NavMenu />
  </nav>

  <AppBar title="LayerChart">
    <div slot="actions">
      <QuickSearch options={quickSearchOptions} on:change={(e) => goto(e.detail.value)} />

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
    @apply text-xl font-semibold mt-8 mb-2 border-b border-gray-400 pb-1;
  }

  :global(main h2:not(.prose *, .related *, .ApiDocs *)) {
    @apply text-lg font-semibold mt-4 mb-1;
  }

  :global(main h3:not(.prose *, .related *, .ApiDocs *)) {
    @apply text-xs text-black/50 mb-1;
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
    @apply bg-neutral-200;
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
      @apply text-sky-400 bg-gray-500/10 border-sky-500;
    }
  }

  :global(.AppBar) {
    @apply bg-accent-500 text-white shadow-md;
  }
</style>
