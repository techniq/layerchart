<script lang="ts">
  import { onMount } from 'svelte';
  import posthog from 'posthog-js';

  import { mdiArrowTopRight, mdiDotsVertical, mdiGithub, mdiTwitter } from '@mdi/js';
  import 'prism-themes/themes/prism-vsc-dark-plus.css';
  import {
    AppBar,
    AppLayout,
    Button,
    MenuButton,
    QuickSearch,
    ThemeSelect,
    // ThemeSwitch,
    Tooltip,
    settings,
  } from 'svelte-ux';
  import { sortFunc } from '@layerstack/utils';
  import { lgScreen } from '@layerstack/svelte-stores';

  import { dev } from '$app/environment';
  import { afterNavigate, goto } from '$app/navigation';
  import { page } from '$app/stores';

  import NavMenu from './_NavMenu.svelte';

  import './app.css';

  export let data;

  settings({
    components: {
      AppLayout: {
        classes: {
          aside: 'border-r',
          nav: 'bg-surface-300 py-2',
        },
      },
      AppBar: {
        classes:
          'bg-primary text-primary-content shadow-md [text-shadow:1px_1px_2px_var(--color-primary-700)]',
      },
      NavItem: {
        classes: {
          root: 'text-sm text-surface-content/70 pl-6 py-2 hover:bg-surface-100/70 relative',
          active:
            'text-primary bg-surface-100 font-medium before:absolute before:bg-primary before:rounded-full before:w-1 before:h-2/3 before:left-[6px] shadow-sm z-10',
        },
      },
    },
    // @ts-expect-error
    themes: data.themes,
  });

  let mainEl: HTMLElement;
  afterNavigate(() => {
    mainEl.scrollTo({ top: 0, behavior: 'instant' });
  });

  const groups = ['examples', 'components', 'utils', 'tools', 'performance'];
  const quickSearchOptions = Object.entries(
    import.meta.glob('./docs/**/+page.(md|svelte)', { query: '?raw', eager: true })
  )
    .flatMap(([file, source]) => {
      const url = file.replace('.', '').replace(/\/\+page.(md|svelte)/, '');
      const [_, docs, group, label] = url.split('/');
      return {
        label,
        value: url,
        group: group,
      };
    })
    .sort(sortFunc((d) => groups.indexOf(d.group)));

  let currentPath = '';
  onMount(() => {
    // Delay adding `scroll-smooth` to `<html>` as provides better refresh experience
    // and fixes issue where sometimes doesn't scroll far enough
    setTimeout(() => {
      document.documentElement.classList.add('scroll-smooth');
    }, 0);

    // Posthog analytics
    if (!dev) {
      const unsubscribePage = page.subscribe(($page) => {
        if (currentPath && currentPath !== $page.url.pathname) {
          // Page navigated away
          // @ts-expect-error
          posthog.capture('$pageleave');
        }
        // Page entered
        currentPath = $page.url.pathname;
        // @ts-expect-error
        posthog.capture('$pageview');
      });
      const handleBeforeUnload = () => {
        // Hard reloads or browser exit
        // @ts-expect-error
        posthog.capture('$pageleave');
      };
      window.addEventListener('beforeunload', handleBeforeUnload);
      return () => {
        unsubscribePage();
        window.removeEventListener('beforeunload', handleBeforeUnload);
      };
    }
  });
</script>

<svelte:head>
  {#if $page.url.origin.includes('https')}
    <script
      defer
      src="https://static.cloudflareinsights.com/beacon.min.js"
      data-cf-beacon={JSON.stringify({ token: 'aff39463882545fd8cca0adba6afa86e' })}
    ></script>

    <script
      async
      defer
      src="https://us.umami.is/script.js"
      data-website-id="98141640-7328-4228-ba7b-2287da133ee9"
    ></script>
  {/if}
</svelte:head>

<AppLayout>
  <svelte:fragment slot="nav">
    <NavMenu />
    <!-- Spacer -->
    <div class="h-4"></div>
  </svelte:fragment>

  <AppBar title="LayerChart">
    <div slot="actions" class="flex gap-3">
      <Button
        href="https://svelte-ux.techniq.dev"
        icon={{ data: mdiArrowTopRight, class: 'opacity-50' }}
        target="_blank"
        class="p-2 max-lg:hidden flex-row-reverse"
      >
        Svelte UX
      </Button>

      <QuickSearch
        options={quickSearchOptions}
        on:change={(e) => goto(String(e.detail.value))}
        classes={{ button: 'max-sm:-mr-3' }}
      />

      <div class="border-r border-primary-content/20 pr-2">
        <ThemeSelect keyboardShortcuts />
      </div>

      {#if $lgScreen}
        <Tooltip title="Discord" placement="left" offset={2}>
          <Button
            icon="M20.33 5.06C18.78 4.33 17.12 3.8 15.38 3.5 15.17 3.89 14.92 4.4 14.74 4.82 12.9 4.54 11.07 4.54 9.26 4.82 9.09 4.4 8.83 3.89 8.62 3.5 6.88 3.8 5.21 4.33 3.66 5.06 0.53 9.79-0.32 14.41 0.1 18.96 2.18 20.52 4.19 21.46 6.17 22.08 6.66 21.4 7.1 20.69 7.48 19.93 6.76 19.66 6.07 19.33 5.43 18.94 5.6 18.81 5.77 18.68 5.93 18.54 9.88 20.39 14.17 20.39 18.07 18.54 18.23 18.68 18.4 18.81 18.57 18.94 17.92 19.33 17.24 19.66 16.52 19.94 16.9 20.69 17.33 21.41 17.82 22.08 19.8 21.46 21.82 20.52 23.9 18.96 24.4 13.69 23.05 9.11 20.33 5.06ZM8.01 16.17C6.83 16.17 5.86 15.06 5.86 13.71 5.86 12.36 6.81 11.25 8.01 11.25 9.22 11.25 10.19 12.36 10.17 13.71 10.17 15.06 9.22 16.17 8.01 16.17ZM15.99 16.17C14.8 16.17 13.83 15.06 13.83 13.71 13.83 12.36 14.78 11.25 15.99 11.25 17.19 11.25 18.17 12.36 18.14 13.71 18.14 15.06 17.19 16.17 15.99 16.17Z"
            href="https://discord.gg/697JhMPD3t"
            class="p-2"
            target="_blank"
          />
        </Tooltip>

        <Tooltip title="Bluesky" placement="left" offset={2}>
          <Button
            icon="M5.43 3.26c2.66 2 5.52 6.05 6.57 8.22 1.05-2.17 3.91-6.22 6.57-8.22 1.92-1.44 5.03-2.56 5.03 0.99 0 0.71-0.41 5.95-0.64 6.81-0.83 2.96-3.85 3.71-6.53 3.25 4.69 0.8 5.89 3.44 3.3 6.09-4.9 5.02-7.04-1.26-7.58-2.87-0.1-0.3-0.15-0.43-0.15-0.31 0-0.12-0.05 0.02-0.15 0.31-0.55 1.61-2.69 7.89-7.58 2.87-2.58-2.65-1.38-5.29 3.3-6.09-2.68 0.46-5.7-0.3-6.53-3.25-0.24-0.85-0.64-6.09-0.64-6.81 0-3.55 3.11-2.43 5.03-0.99z"
            href="https://bsky.app/profile/techniq.dev"
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
      {:else}
        <MenuButton
          icon={mdiDotsVertical}
          menuIcon={null}
          iconOnly={true}
          options={[
            {
              label: 'Svelte UX',
              value: 'https://svelte-ux.techniq.dev',
              icon: mdiArrowTopRight,
            },
            {
              label: 'Github',
              value: 'https://github.com/techniq/layerchart',
              icon: mdiGithub,
            },
            {
              label: 'Discord',
              value: 'https://discord.gg/697JhMPD3t',
              icon: 'M20.33 5.06C18.78 4.33 17.12 3.8 15.38 3.5 15.17 3.89 14.92 4.4 14.74 4.82 12.9 4.54 11.07 4.54 9.26 4.82 9.09 4.4 8.83 3.89 8.62 3.5 6.88 3.8 5.21 4.33 3.66 5.06 0.53 9.79-0.32 14.41 0.1 18.96 2.18 20.52 4.19 21.46 6.17 22.08 6.66 21.4 7.1 20.69 7.48 19.93 6.76 19.66 6.07 19.33 5.43 18.94 5.6 18.81 5.77 18.68 5.93 18.54 9.88 20.39 14.17 20.39 18.07 18.54 18.23 18.68 18.4 18.81 18.57 18.94 17.92 19.33 17.24 19.66 16.52 19.94 16.9 20.69 17.33 21.41 17.82 22.08 19.8 21.46 21.82 20.52 23.9 18.96 24.4 13.69 23.05 9.11 20.33 5.06ZM8.01 16.17C6.83 16.17 5.86 15.06 5.86 13.71 5.86 12.36 6.81 11.25 8.01 11.25 9.22 11.25 10.19 12.36 10.17 13.71 10.17 15.06 9.22 16.17 8.01 16.17ZM15.99 16.17C14.8 16.17 13.83 15.06 13.83 13.71 13.83 12.36 14.78 11.25 15.99 11.25 17.19 11.25 18.17 12.36 18.14 13.71 18.14 15.06 17.19 16.17 15.99 16.17Z',
            },
            {
              label: 'Twitter / X',
              value: 'https://twitter.com/techniq35',
              icon: mdiTwitter,
            },
          ]}
          on:change={(e) => {
            window.open(e.detail.value, '_blank');
          }}
        >
          <span slot="selection" class="hidden"></span>
        </MenuButton>
      {/if}
    </div>
  </AppBar>

  <main class="isolate" bind:this={mainEl}>
    <slot />
  </main>
</AppLayout>
