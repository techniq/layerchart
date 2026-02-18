<script lang="ts">
	import Example from '$lib/components/Example.svelte';
	import { page } from '$app/state';

	let component = page.params.component!;
	let example = page.params.example!;
</script>

<svelte:head>
	<title>{component} - {example} - LayerChart Examples</title>
</svelte:head>

<div class="p-2">
	<Example name={example} {component} variant="basic" />
</div>
