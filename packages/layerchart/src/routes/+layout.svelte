<script lang="ts">
  import { onMount } from 'svelte';
  import posthog from 'posthog-js';
  import { watch } from 'runed';

  import {
    AppBar,
    AppLayout,
    Button,
    Icon,
    MenuButton,
    QuickSearch,
    ThemeSelect,
    // ThemeSwitch,
    Tooltip,
    settings,
  } from 'svelte-ux';
  import { sortFunc } from '@layerstack/utils';
  import { MediaQueryPresets } from '@layerstack/svelte-state';

  import LucideArrowUpRight from '~icons/lucide/arrow-up-right';
  import LucideEllipsisVertical from '~icons/lucide/ellipsis-vertical';
  import LucideGithub from '~icons/lucide/github';
  import CustomBluesky from '~icons/custom-brands/bluesky';
  import CustomDiscord from '~icons/custom-brands/discord';

  import { dev } from '$app/environment';
  import { afterNavigate, goto } from '$app/navigation';
  import { page } from '$app/state';

  import NavMenu from './_NavMenu.svelte';

  import './app.css';

  let { data, children } = $props();

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
      watch(
        () => page,
        () => {
          if (currentPath && currentPath !== page.url.pathname) {
            // Page navigated away
            // @ts-expect-error
            posthog.capture('$pageleave');
          }
          // Page entered
          currentPath = page.url.pathname;
          // @ts-expect-error
          posthog.capture('$pageview');
        }
      );
      const handleBeforeUnload = () => {
        // Hard reloads or browser exit
        // @ts-expect-error
        posthog.capture('$pageleave');
      };
      window.addEventListener('beforeunload', handleBeforeUnload);
      return () => {
        window.removeEventListener('beforeunload', handleBeforeUnload);
      };
    }
  });

  const { lgScreen } = new MediaQueryPresets();
</script>

<svelte:head>
  {#if page.url.origin.includes('https')}
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
        icon={LucideArrowUpRight}
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

      {#if lgScreen.current}
        <Tooltip title="Discord" placement="left" offset={2}>
          <Button
            icon={CustomDiscord}
            href="https://discord.gg/697JhMPD3t"
            class="p-2"
            target="_blank"
          />
        </Tooltip>

        <Tooltip title="Bluesky" placement="left" offset={2}>
          <Button
            icon={CustomBluesky}
            href="https://bsky.app/profile/techniq.dev"
            class="p-2"
            target="_blank"
          />
        </Tooltip>

        <Tooltip title="View repository" placement="left" offset={2}>
          <Button
            icon={LucideGithub}
            href="https://github.com/techniq/layerchart"
            class="p-2"
            target="_blank"
          />
        </Tooltip>
      {:else}
        <MenuButton
          icon={LucideEllipsisVertical}
          menuIcon={null}
          iconOnly={true}
          options={[
            {
              label: 'Svelte UX',
              value: 'https://svelte-ux.techniq.dev',
              icon: LucideArrowUpRight,
            },
            {
              label: 'Github',
              value: 'https://github.com/techniq/layerchart',
              icon: LucideGithub,
            },
            {
              label: 'Discord',
              value: 'https://discord.gg/697JhMPD3t',
              icon: CustomDiscord,
            },
            {
              label: 'Bluesky',
              value: 'https://bsky.app/profile/techniq.dev',
              icon: CustomBluesky,
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
    {@render children()}
  </main>
</AppLayout>
