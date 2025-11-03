<script lang="ts">
	import ExampleLink from '$lib/components/ExampleLink.svelte';
	import H1 from '$lib/markdown/components/h1.svelte';
	import H2 from '$lib/markdown/components/h2.svelte';

	let { data } = $props();
</script>

<svelte:head>
	<title>Examples - LayerChart</title>
</svelte:head>

<H1>Examples</H1>
<p class="text-sm text-surface-content/50 mb-6">
	Browse {data.totalExamples} examples across {data.components.length} components
</p>

<div class="grid gap-10">
	{#each data.components as { component, examples }}
		<div>
			<H2>{component}</H2>
			<div class="grid grid-cols-2 sm:grid-cols-3 gap-4">
				{#each examples as example}
					<ExampleLink {component} example={example.name} />
				{/each}
			</div>
		</div>
	{/each}
</div>
