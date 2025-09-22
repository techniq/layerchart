<script lang="ts">
	import { settings, ThemeInit, ThemeSwitch } from 'svelte-ux';

	import favicon from '$lib/assets/favicon.svg';
	import '../app.css';

	settings();

	let { children } = $props();
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
</svelte:head>

<ThemeInit />

<main class="p-4">
	<div class="pb-4 text-right">
		<ThemeSwitch />
	</div>

	{@render children?.()}
</main>
