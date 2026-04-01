<script lang="ts">
	import '../app.css';
	import Lightswitch from '$lib/components/Lightswitch.svelte';
	import favicon from '$lib/assets/favicon.svg';

	let { children } = $props();
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
</svelte:head>

<main class="p-4">
	<div class="pb-4 text-right">
		<Lightswitch />
	</div>
	{@render children()}
</main>
