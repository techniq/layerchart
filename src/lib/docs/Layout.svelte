<script context="module">
	// Custom components: https://mdsvex.com/docs#custom-components
	import blockquote from './Blockquote.svelte';
	import a from './Link.svelte';
	import h1 from './Header1.svelte';

	// Used by injected info via svelte preprocessor
	import { mdiCodeTags, mdiFileDocumentEditOutline } from '@mdi/js';
	import { Button, Tooltip } from 'svelte-ux';

	export { a, blockquote, h1 };
</script>

<script>
	// frontmatter: https://mdsvex.com/docs#frontmatter-1
	export let name = undefined;
	export let sourceUrl = undefined;
	export let docUrl = undefined;
	export let description = undefined;
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
							href="https://github.com/techniq/svelte-ux/blob/master/{sourceUrl}"
							target="_blank"
						/>
					</Tooltip>
				{/if}

				{#if docUrl}
					<Tooltip title="Edit this page">
						<Button
							class="text-black/50 p-1"
							icon={mdiFileDocumentEditOutline}
							href="https://github.com/techniq/svelte-ux/blob/master/{docUrl}"
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
		<div>
			<slot />
		</div>

		<div class="hidden lg:block w-[200px]">
			<div class="sticky top-0 pr-2">
				<div class="text-xs uppercase leading-8 tracking-widest text-black/50">On this page</div>
				<slot name="toc" />
			</div>
		</div>
	</div>
</div>
