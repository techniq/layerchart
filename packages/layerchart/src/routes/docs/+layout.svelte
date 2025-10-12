<script lang="ts">
  import { onMount } from 'svelte';
  import { flatGroup } from 'd3-array';

  import LucideAlignLeft from '~icons/lucide/align-left.svelte';
  import LucideChevronRight from '~icons/lucide/chevron-right.svelte';
  import LucideChevronDown from '~icons/lucide/chevron-down.svelte';
  import LucideCircleCheck from '~icons/lucide/circle-check.svelte';
  import LucideCode from '~icons/lucide/code';
  import LucideBraces from '~icons/lucide/braces';
  import LucideDatabase from '~icons/lucide/database';
  import LucideFilePenLine from '~icons/lucide/file-pen-line';
  import LucideGithub from '~icons/lucide/github.svelte';
  import LucideLink2 from '~icons/lucide/link-2';
  import IconSettings from '~icons/lucide/settings';
  import LucideX from '~icons/lucide/x';

  import {
    ApiDocs,
    Button,
    Dialog,
    Field,
    Icon,
    ListItem,
    Menu,
    Switch,
    TableOfContents,
    Toggle,
    ToggleGroup,
    ToggleOption,
    Tooltip,
  } from 'svelte-ux';

  import { MediaQueryPresets } from '@layerstack/svelte-state';
  import { cls } from '@layerstack/tailwind';
  import { toTitleCase } from '@layerstack/utils';

  import Code from '$lib/docs/Code.svelte';
  import ViewSourceButton from '$lib/docs/ViewSourceButton.svelte';
  import { page } from '$app/state';
  import { setSettings, getSettings } from '$lib/contexts/settings.js';

  const { children } = $props();

  // TODO: `setSettings({...})` or just use default?
  const settings = getSettings();

  const [type, name] = $derived(page.url.pathname.split('/').slice(2) ?? []);
  const title = $derived(page.data.meta?.title ?? name);
  const pageUrl = $derived(`src/routes/docs/${type}/${name}/+page.svelte?plain=1`);

  const getComponentPath = (name: string) => {
    if (name.endsWith('Chart') && name !== 'Chart') return `charts/${name}`;
    if (name.startsWith('Tooltip')) return `tooltip/${name}`;
    return name;
  };
  const sourceUrl = $derived(
    ['components', 'utils'].includes(type)
      ? `src/lib/${type}/${getComponentPath(name)}.${type === 'components' ? 'svelte' : 'ts'}`
      : null
  );
  const {
    description,
    features,
    related,
    hideUsage,
    hideTableOfContents,
    source,
    pageSource,
    api,
    status,
    supportedContexts,
  } = $derived(page.data.meta ?? {});

  const { xlScreen } = new MediaQueryPresets();
  let showTableOfContents = $state(xlScreen.current);

  onMount(() => {
    showTableOfContents = !hideTableOfContents && xlScreen.current;

    // Assign an `id` to every header element
    const headers = document.querySelectorAll('h1, h2, h3, h4, h5, h6');
    headers.forEach((header) => {
      const id = header.innerHTML.toLowerCase().replace(/\s+/g, '_'); // Lowercase and convert spaces to underscores
      header.setAttribute('id', id);
    });
  });

  function getRelated(r: string) {
    if (r.startsWith('http')) {
      var url = new URL(r);
      if (url.hostname.includes('github.com')) {
        return { type: 'github', name: url.pathname.slice(1), url };
      } else {
        return { type: 'website', name: url, url };
      }
    } else if (r.startsWith('/')) {
      return { type: 'docs', name: toTitleCase(r.slice(1)), url: r };
    } else {
      const [type, name] = r.split('/');
      return { type, name, url: `/docs/${type}/${name}` };
    }
  }
</script>

<div
  class="[@media(min-height:900px)]:sticky top-[var(--headerHeight)] z-60 bg-surface-200/90 backdrop-blur-sm px-5 py-4 [mask-image:linear-gradient(to_bottom,rgba(0,0,0,1)calc(100%-4px),rgba(0,0,0,0))]"
>
  {#if title}
    <div>
      <div class="inline-block text-xs font-bold text-surface-content/50 capitalize">Docs</div>
      <Icon data={LucideChevronRight} class="divider opacity-25" />
      <div class="inline-block text-xs font-bold text-primary capitalize">
        {type}
      </div>
    </div>

    <div class="flex items-center gap-4">
      <span class="text-2xl font-bold">
        {#if type === 'examples' || type === 'tools'}
          {title.replace(/([a-z])([A-Z])/g, '$1 $2')}
        {:else}
          {title}
        {/if}
      </span>

      <span class="flex items-center gap-1">
        {#if supportedContexts}
          <ToggleGroup
            bind:value={settings.layer}
            variant="fill"
            color="primary"
            inset
            gap="px"
            size="sm"
          >
            {#each supportedContexts as context}
              <ToggleOption value={context}>{toTitleCase(context)}</ToggleOption>
            {/each}
          </ToggleGroup>
        {/if}

        <Toggle let:on={open} let:toggle let:toggleOff>
          <Tooltip title="Settings">
            <Button iconOnly on:click={toggle}>
              <IconSettings class="text-surface-content" />
              <Menu {open} on:close={toggleOff} placement="bottom-start" classes={{ menu: 'p-2' }}>
                <label class="flex items-center gap-2">
                  <span class="text-sm text-surface-content">Debug</span>
                  <Switch bind:checked={settings.debug} />
                </label>
              </Menu>
            </Button>
          </Tooltip>
        </Toggle>
      </span>

      {#if status}
        <span
          class={cls(
            'text-sm px-2 rounded-sm',
            status === 'beta' && 'bg-yellow-500/20 text-yellow-800',
            status === 'deprecated' && 'bg-red-500/20 text-red-900'
          )}
        >
          {status}
        </span>
      {/if}
    </div>

    {#if description}
      <div class="text-sm text-surface-content/60 whitespace-pre-line xl:pr-[240px]">
        {description}
      </div>
    {/if}

    <div class="flex gap-2 mt-3">
      <ViewSourceButton
        label="Source"
        {source}
        href={sourceUrl
          ? `https://github.com/techniq/layerchart/blob/next/packages/layerchart/${sourceUrl}`
          : ''}
        icon={LucideCode}
      />

      <ViewSourceButton
        label="Page source"
        source={pageSource}
        href={pageUrl
          ? `https://github.com/techniq/layerchart/blob/next/packages/layerchart/${pageUrl}`
          : ''}
        icon={LucideFilePenLine}
      />

      {#if !hideTableOfContents}
        <Button
          icon={LucideChevronDown}
          on:click={() => {
            showTableOfContents = !showTableOfContents;
          }}
          variant="fill-light"
          color="primary"
          size="sm"
        >
          On this page
        </Button>
      {/if}
    </div>
  {/if}
</div>

<div class="px-4">
  {#if !xlScreen.current}
    {#key page.route.id}
      <Dialog
        bind:open={showTableOfContents}
        classes={{ dialog: 'w-[420px] max-w-[95vw] max-h-[95dvh]' }}
      >
        <div slot="title">On this page</div>
        <Button
          icon={LucideX}
          class="absolute top-1 right-1"
          size="sm"
          on:click={() => (showTableOfContents = false)}
        />
        <TableOfContents
          linkIndent={12}
          class="p-4"
          classes={{
            a: cls(
              'border-l text-sm text-surface-content/50 py-[2px] hover:text-surface-content',
              'data-active:border-primary data-active:text-primary',
              'data-[level=1]:font-semibold'
            ),
          }}
          scrollOffset={184}
          on:nodeClick={(e) => {
            showTableOfContents = false;
          }}
        />
      </Dialog>
    {/key}
  {/if}

  <div class="grid xl:grid-cols-[1fr_auto] gap-6 pb-4">
    <div class="_overflow-auto p-1">
      {#if type === 'components' && !hideUsage}
        {#key page.route.id}
          <h1 id="usage">Usage</h1>
          <Code
            source={`import { ${name} } from 'layerchart';`}
            language="javascript"
            class="bg-surface-100 border rounded"
          />
        {/key}
      {/if}

      {#if features}
        {#key page.route.id}
          <h1 id="features">Features</h1>
          <ul>
            {#each features.flatMap( (feature) => (Array.isArray(feature) ? feature.map( (f) => ({ description: f, depth: 1 }) ) : { description: feature, depth: 0 }) ) as feature}
              <ListItem
                title={feature.description}
                icon={LucideCircleCheck}
                avatar={{ size: 'sm', class: 'text-xs text-white bg-success' }}
                classes={{ root: feature.depth ? 'pl-12' : '', title: 'text-sm' }}
              />
            {/each}
          </ul>
        {/key}
      {/if}

      {@render children()}

      {#if related}
        <h1 id="related">Related</h1>
        <div class="related grid gap-3">
          {#each flatGroup(related.map(getRelated), (d) => d.type) as [type, items]}
            <div>
              <h2
                id="related-{type}"
                class="text-xs uppercase leading-8 tracking-widest text-surface-content/50"
              >
                {type}
              </h2>
              <div>
                {#each items as item}
                  {@const icon =
                    item.type === 'components' || item.type === 'examples'
                      ? LucideCode
                      : item.type === 'stores'
                        ? LucideDatabase
                        : item.type === 'actions'
                          ? LucideBraces
                          : item.type === 'github'
                            ? LucideGithub
                            : LucideLink2}
                  <a href={item.url.toString()} class="group">
                    <ListItem
                      title={item.name.toString()}
                      {icon}
                      avatar={{ size: 'sm', class: 'text-xs text-white bg-primary' }}
                      list="group"
                      class="hover:bg-surface-200 cursor-pointer"
                    >
                      <div slot="actions">
                        <Icon data={LucideChevronRight} class="text-surface-content/50" />
                      </div>
                    </ListItem>
                  </a>
                {/each}
              </div>
            </div>
          {/each}
        </div>
      {/if}

      <!-- TODO: Re-enable once Svelte 5 compatibility replacement for sveld is add (issue #435) -->
      <!-- {#if api}
        <h1>API</h1>
        <ApiDocs {api} />
      {/if} -->
    </div>

    {#if showTableOfContents && xlScreen.current}
      <div
        class="w-[224px] sticky top-[calc(var(--headerHeight)+10px)] pr-2 max-h-[calc(100dvh-64px)] overflow-auto z-60"
      >
        <div
          class="flex gap-2 items-center text-xs font-medium uppercase pb-3 tracking-widest text-surface-content/50"
        >
          <LucideAlignLeft />
          On this page
        </div>
        <!-- Rebuild toc when page changes -->
        {#key page.route.id}
          <TableOfContents
            linkIndent={12}
            classes={{
              a: cls(
                'border-l text-sm text-surface-content/50 py-[2px] hover:text-surface-content',
                'data-active:border-primary data-active:text-primary',
                'data-[level=1]:font-semibold'
              ),
            }}
            scrollOffset={184}
          />
        {/key}
      </div>
    {/if}
  </div>
</div>
