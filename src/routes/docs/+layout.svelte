<script lang="ts">
	import { mdiCodeTags, mdiFileDocumentEditOutline } from '@mdi/js';

	import { Button, TableOfContents, Tooltip } from 'svelte-ux';
	import Code from '$lib/docs/Code.svelte';

	import { page } from '$app/stores';

	$: [path, type, name] = $page.url.pathname.match('.*/(.*)/(.*)');
	$: docUrl = `src/routes/docs/${type}/${name}/+page.md?plain=1`;
	$: sourceUrl = ['components', 'utils'].includes(type)
		? `src/lib/${type}/${name}.${type === 'components' ? 'svelte' : 'ts'}`
		: null;
	$: description = $page.data.meta?.description;
	$: hideUsage = $page.data.meta?.hideUsage;
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
					<Code code={`import { ${name} } from 'layerchart';`} language="javascript" />
				{/key}
			{/if}

			<slot />
		</div>

		<div class="hidden lg:block w-[224px]">
			<div class="sticky top-0 pr-2">
				<div class="text-xs uppercase leading-8 tracking-widest text-black/50">On this page</div>
				<!-- Rebuild toc when page changes -->
				{#key $page.route.id}
					<TableOfContents />
				{/key}
			</div>
		</div>
	</div>
</div>
