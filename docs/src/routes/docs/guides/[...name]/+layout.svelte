<script lang="ts">
	import { LoadingPlaceholder } from '@layerstack/docs/components';
	import OpenWithButton from '$lib/components/OpenWithButton.svelte';
	import { examples } from '@layerstack/docs/context';

	let { data, children } = $props();

	// Override examples context with guide-specific examples loaded by +layout.ts
	const examplesContext = {
		get current() {
			return data.examples ?? {};
		}
	};
	examples.set(examplesContext);
</script>

<h1 class="text-3xl font-bold mb-2">{data.metadata.title}</h1>
<!-- OpenWithButton is shown as example on LLMs page, do not show again -->
{#if data.metadata.title !== 'LLMs'}
	<div class="mb-4">
		<OpenWithButton example={data.metadata.title === 'LLMs'} />
	</div>
{/if}

<svelte:boundary>
	{#snippet pending()}
		<LoadingPlaceholder />
	{/snippet}

	{@render children()}
</svelte:boundary>
