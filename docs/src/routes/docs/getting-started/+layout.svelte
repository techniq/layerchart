<script lang="ts">
	import { LoadingPlaceholder } from '@layerstack/docs/components';
	import PageHeader from '$lib/components/PageHeader.svelte';

	import LucideCirclePlay from '~icons/lucide/circle-play';

	let { data, children } = $props();
</script>

<PageHeader title={data.metadata.title} icon={LucideCirclePlay} layers={data.layers} />

<svelte:boundary>
	{#snippet pending()}
		<LoadingPlaceholder />
	{/snippet}

	{@render children()}
</svelte:boundary>
