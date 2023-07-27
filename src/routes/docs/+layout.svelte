<script lang="ts">
  import { onMount } from 'svelte';
  import { fade, slide } from 'svelte/transition';
  import { flatGroup } from 'd3-array';

  import {
    mdiCheckCircle,
    mdiChevronDown,
    mdiChevronRight,
    mdiCodeBraces,
    mdiCodeTags,
    mdiDatabaseOutline,
    mdiFileDocumentEditOutline,
    mdiGithub,
    mdiLink,
  } from '@mdi/js';

  import { ApiDocs, Button, Icon, ListItem, TableOfContents, xlScreen } from 'svelte-ux';

  import Code from '$lib/docs/Code.svelte';
  import ViewSourceButton from '$lib/docs/ViewSourceButton.svelte';
  import { page } from '$app/stores';
  import { goto } from '$app/navigation';

  $: [path, type, name] = $page.url.pathname.match('.*/(.*)/(.*)') ?? [];
  $: title = $page.data.meta?.title ?? name;
  $: pageUrl = `src/routes/docs/${type}/${name}/+page.svelte?plain=1`;
  $: sourceUrl = ['components', 'utils'].includes(type)
    ? `src/lib/${type}/${name}.${type === 'components' ? 'svelte' : 'ts'}`
    : null;
  $: ({ description, features, related, hideUsage, hideTableOfContents, source, pageSource, api } =
    $page.data.meta ?? {});

  $: showTableOfContents = false;
  onMount(() => {
    showTableOfContents = !hideTableOfContents && $xlScreen;
  });

  function getRelated(r: string) {
    if (r.startsWith('http')) {
      var url = new URL(r);
      if (url.hostname.includes('github.com')) {
        return { type: 'github', name: url.pathname.slice(1), url };
      } else {
        return { type: 'website', name: url, url };
      }
    } else {
      const [type, name] = r.split('/');
      return { type, name, url: `/docs/${type}/${name}` };
    }
  }
</script>

<div class="p-4">
  <div>
    {#if title}
      <div>
        <div class="inline-block text-xs font-bold text-gray-500 capitalize">Docs</div>
        <Icon path={mdiChevronRight} class="divider opacity-25" />
        <div class="inline-block text-xs font-bold text-accent-500 capitalize">
          {type}
        </div>
      </div>

      <div class="text-2xl font-bold mb-3">{title}</div>

      {#if description}
        <div class="text-sm text-black/60">
          {description}
        </div>
      {/if}

      <div class="flex gap-2 mt-2">
        <ViewSourceButton
          label="Source"
          {source}
          href={sourceUrl ? `https://github.com/techniq/layerchart/blob/master/${sourceUrl}` : ''}
          icon={mdiCodeTags}
        />

        <ViewSourceButton
          label="Page source"
          source={pageSource}
          href={pageUrl ? `https://github.com/techniq/layerchart/blob/master/${pageUrl}` : ''}
          icon={mdiFileDocumentEditOutline}
        />

        {#if !hideTableOfContents}
          <Button
            icon={mdiChevronDown}
            on:click={() => {
              showTableOfContents = !showTableOfContents;
            }}
            variant="fill-light"
            color="accent"
            size="sm"
          >
            On this page
          </Button>
        {/if}
      </div>
    {/if}
  </div>

  {#if showTableOfContents && !$xlScreen}
    <div transition:fade|local class="mt-3">
      {#key $page.route.id}
        <TableOfContents />
      {/key}
    </div>
  {/if}

  <div class="grid xl:grid-cols-[1fr,auto] gap-6 pt-2 pb-4">
    <div class="overflow-auto">
      {#if type === 'components' && !hideUsage}
        {#key $page.route.id}
          <h1 id="usage">Usage</h1>
          <Code source={`import { ${name} } from 'layerchart';`} language="javascript" />
        {/key}
      {/if}

      {#if features}
        {#key $page.route.id}
          <h1 id="features">Features</h1>
          <ul class="pl-4 text-gray-700 divide-y-4">
            {#each features as feature}
              <li class="grid grid-cols-[auto,1fr] gap-2">
                <Icon data={mdiCheckCircle} class="text-emerald-600 pt-1" />
                <span>{@html feature}</span>
              </li>
            {/each}
          </ul>
        {/key}
      {/if}

      <slot />

      {#if related}
        <h1 id="related">Related</h1>
        <div class="related">
          {#each flatGroup(related.map(getRelated), (d) => d.type) as [type, items]}
            <h2
              id="related-{type}"
              class="text-xs uppercase leading-8 tracking-widest text-black/50"
            >
              {type}
            </h2>
            <div>
              {#each items as item}
                {@const icon =
                  item.type === 'components' || item.type === 'examples'
                    ? mdiCodeTags
                    : item.type === 'stores'
                    ? mdiDatabaseOutline
                    : item.type === 'actions'
                    ? mdiCodeBraces
                    : item.type === 'github'
                    ? mdiGithub
                    : mdiLink}
                <ListItem
                  title={item.name}
                  {icon}
                  avatar={{ size: 'sm', class: 'text-xs text-white bg-accent-500' }}
                  on:click={() => {
                    if (item.url instanceof URL) {
                      // open in new window
                      window.open(item.url);
                    } else {
                      // go to route
                      goto(item.url);
                    }
                  }}
                  class="hover:bg-accent-50 cursor-pointer"
                >
                  <div slot="actions">
                    <Icon data={mdiChevronRight} class="text-black/50" />
                  </div>
                </ListItem>
              {/each}
            </div>
          {/each}
        </div>
      {/if}

      {#if api}
        <h1>API</h1>
        <ApiDocs {api} />
      {/if}
    </div>

    {#if showTableOfContents && $xlScreen}
      <div transition:slide|local={{ axis: 'x' }}>
        <div class="w-[224px] sticky top-0 pr-2 max-h-[calc(100vh-64px)] overflow-auto">
          <div class="text-xs uppercase leading-8 tracking-widest text-black/50">On this page</div>
          <!-- Rebuild toc when page changes -->
          {#key $page.route.id}
            <TableOfContents />
          {/key}
        </div>
      </div>
    {/if}
  </div>
</div>
