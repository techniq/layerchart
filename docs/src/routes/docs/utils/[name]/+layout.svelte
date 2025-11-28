<script lang="ts">
	import { Button } from 'svelte-ux';
	import { toTitleCase } from '@layerstack/utils';

	import ViewSourceButton from '$lib/components/ViewSourceButton.svelte';
	import { examples } from '$lib/context.js';
	import { page } from '$app/state';

	import LucideCode from '~icons/lucide/code';
	import LucideChevronLeft from '~icons/lucide/chevron-left';
	import LucideChevronRight from '~icons/lucide/chevron-right';

	let { data, children } = $props();

	const { metadata } = $derived(data);

	// Add examples to context for Example component to use
	const examplesContext = {
		get current() {
			return data.examples;
		}
	};
	examples.set(examplesContext);
</script>

<div class="mb-4">
	<!-- Show back if viewing individual example -->
	{#if page.params.example}
		<Button
			size="sm"
			icon={LucideChevronLeft}
			href="/docs/utils/{page.params.name}"
			class="mb-4 border"
		>
			Back to {page.params.name}
		</Button>
	{/if}

	<div class="flex items-center gap-2 text-xs font-bold">
		<div class="text-surface-content/50 capitalize">
			{metadata.category}
		</div>

		{#if page.params.example}
			<LucideChevronRight class="text-sm opacity-25" />
			<a href="/docs/utils/{page.params.name}" class="text-primary">{metadata.name}</a>
		{/if}
	</div>

	<div class="flex items-center gap-4">
		<h1 class="text-3xl font-bold first-letter:capitalize">
			{page.params.example?.replaceAll('-', ' ') ?? metadata.name}
		</h1>
	</div>

	{#if page.params.example == null}
		<div class="text-sm text-surface-content/70">{metadata.description}</div>

		<div class="flex gap-2 mt-3">
			{#if 'source' in metadata && metadata.source}
				<ViewSourceButton
					label="Source"
					source={metadata.source}
					href={metadata.sourceUrl}
					icon={LucideCode}
				/>
			{/if}
		</div>
	{/if}
</div>

<svelte:boundary>
	{#snippet pending()}
		loading...
	{/snippet}

	{@render children()}
</svelte:boundary>
