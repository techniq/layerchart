<script lang="ts">
	import {
		mdiCheckCircle,
		mdiChevronRight,
		mdiCodeTags,
		mdiFileDocumentEditOutline
	} from '@mdi/js';

	import { Button, Icon, TableOfContents, Tooltip } from 'svelte-ux';
	import Code from '$lib/docs/Code.svelte';

	import { page } from '$app/stores';

	$: [path, type, name] = $page.url.pathname.match('.*/(.*)/(.*)');
	$: docUrl = `src/routes/docs/${type}/${name}/+page.svelte?plain=1`;
	$: sourceUrl = ['components', 'utils'].includes(type)
		? `src/lib/${type}/${name}.${type === 'components' ? 'svelte' : 'ts'}`
		: null;
	$: ({ description, features, related, hideUsage, hideTableOfContents } = $page.data.meta ?? {});

	function getRelated(r: string) {
		const [type, name] = r.split('/');
		return { type, name, url: `/docs/${type}/${name}` };
	}
</script>

<div class="grid grid-rows-[auto,1fr] h-full p-4">
	<div>
		{#if name}
			<div class="flex items-center gap-2 _border-b border-black/10">
				<span class="text-2xl font-bold">{name}</span>
				{#if sourceUrl}
					<Tooltip title="View source">
						<Button
							class="text-black/50 p-1"
							icon={mdiCodeTags}
							href="https://github.com/techniq/layerchart/blob/master/{sourceUrl}"
							target="_blank"
						/>
					</Tooltip>
				{/if}

				{#if docUrl}
					<Tooltip title="Edit this page">
						<Button
							class="text-black/50 p-1"
							icon={mdiFileDocumentEditOutline}
							href="https://github.com/techniq/layerchart/blob/master/{docUrl}"
							target="_blank"
						/>
					</Tooltip>
				{/if}
			</div>

			{#if description}
				<div class="text-sm text-black/60">
					{description}
				</div>
			{/if}
		{/if}
	</div>

	<div class="grid grid-cols-[1fr,auto] gap-6 pt-2 pb-4">
		<div class="overflow-auto">
			{#if type === 'components' && !hideUsage}
				{#key $page.route.id}
					<h1>Usage</h1>
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
								<span>{feature}</span>
							</li>
						{/each}
					</ul>
				{/key}
			{/if}

			<slot />

			{#if related}
				<h1 id="related">Related</h1>
				{#each related.map(getRelated) as r}
					<div class="flex mb-1">
						<Icon data={mdiChevronRight} class="text-black/30" />
						<h2 class="text-base m-0">
							<a href={r.url}>{r.name}</a>
						</h2>
					</div>
				{/each}
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
