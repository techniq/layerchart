<script lang="ts">
	import { ModeWatcher, mode, setMode } from 'mode-watcher';
	import { Switch } from '@skeletonlabs/skeleton-svelte';

	import favicon from '$lib/assets/favicon.svg';
	import '../app.css';

	let { children } = $props();
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
</svelte:head>

<ModeWatcher defaultTheme="cerberus" />

<main class="p-4">
	<div class="pb-4 text-right">
		<Switch
			name="mode"
			checked={mode.current === 'dark'}
			onCheckedChange={(e) => setMode(e.checked ? 'dark' : 'light')}
		/>
	</div>

	{@render children?.()}
</main>
