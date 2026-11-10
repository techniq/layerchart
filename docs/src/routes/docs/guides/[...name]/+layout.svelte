<script lang="ts">
	import { LoadingPlaceholder } from '@layerstack/docs/components';
	import { toTitleCase } from '@layerstack/utils';
	import { examples } from '@layerstack/docs/context';
	import PageHeader from '$lib/components/PageHeader.svelte';
	import { page } from '$app/state';

	import LucideGlobe from '~icons/lucide/globe';

	let { data, children } = $props();

	// Override examples context with guide-specific examples loaded by +layout.ts
	const examplesContext = {
		get current() {
			return data.examples ?? {};
		}
	};
	examples.set(examplesContext);

	// Guides › any parent directories (e.g. Migrations)
	const breadcrumbs = $derived([
		{ label: 'Guides' },
		...page.params
			.name!.split('/')
			.slice(0, -1)
			.map((segment) => ({ label: toTitleCase(segment.replaceAll('-', ' ')) }))
	]);
</script>

<!-- OpenWithButton is shown as example on LLMs page, do not show again -->
<PageHeader
	title={data.metadata.title}
	icon={LucideGlobe}
	{breadcrumbs}
	layers={data.layers}
	showOpenWith={data.metadata.title !== 'LLMs'}
/>

<svelte:boundary>
	{#snippet pending()}
		<LoadingPlaceholder />
	{/snippet}

	{@render children()}
</svelte:boundary>
