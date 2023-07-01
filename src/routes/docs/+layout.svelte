<script lang="ts">
  import { flatGroup } from 'd3-array';
  import {
    mdiCheckCircle,
    mdiChevronRight,
    mdiCodeBraces,
    mdiCodeTags,
    mdiDatabaseOutline,
    mdiFileDocumentEditOutline,
    mdiLink
  } from '@mdi/js';

  import { ApiDocs, Icon, ListItem, TableOfContents } from 'svelte-ux';
  import Code from '$lib/docs/Code.svelte';
  import ViewSourceButton from '$lib/docs/ViewSourceButton.svelte';

  import { page } from '$app/stores';
  import { goto } from '$app/navigation';

  $: [path, type, name] = $page.url.pathname.match('.*/(.*)/(.*)');
  $: title = $page.data.meta?.title ?? name;
  $: pageUrl = `src/routes/docs/${type}/${name}/+page.svelte?plain=1`;
  $: sourceUrl = ['components', 'utils'].includes(type)
    ? `src/lib/${type}/${name}.${type === 'components' ? 'svelte' : 'ts'}`
    : null;
  $: ({ description, features, related, hideUsage, hideTableOfContents, source, pageSource, api } =
    $page.data.meta ?? {});

  function getRelated(r: string) {
    const [type, name] = r.split('/');
    return { type, name, url: `/docs/${type}/${name}` };
  }
</script>

<div class="grid grid-rows-[auto,1fr] h-full p-4">
  <div>
    {#if title}
      <div>
        <div class="inline-block text-xs font-bold text-gray-500 capitalize">Docs</div>
        <Icon path={mdiChevronRight} class="divider opacity-25" />
        <div class="inline-block text-xs font-bold text-blue-500 capitalize">
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
      </div>
    {/if}
  </div>

  <div class="grid grid-cols-[1fr,auto] gap-6 pt-2 pb-4">
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
                    : mdiLink}
                <ListItem
                  title={item.name}
                  {icon}
                  avatar={{ size: 'sm', class: 'text-xs text-white bg-accent-500' }}
                  on:click={() => goto(item.url)}
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

    {#if !hideTableOfContents}
      <div class="hidden lg:block w-[224px]">
        <div class="sticky top-0 pr-2">
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
