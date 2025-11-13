<script lang="ts">
	import Example from '$lib/components/Example.svelte';
	import { page } from '$app/state';
	import { Button } from 'svelte-ux';

	let component = page.params.component!;
	let example = page.params.example!;
</script>

<svelte:head>
	<title>{component} - {example} - LayerChart Examples</title>
</svelte:head>

<div class="mb-4">
	<Button href="/docs/examples" variant="outline" size="sm">← Back to Examples</Button>
</div>

<div class="prose prose-sm max-w-none mb-6">
	<h1>{component}</h1>
	<p class="text-surface-content/70">{example}</p>
</div>

<Example name={example} {component} />
