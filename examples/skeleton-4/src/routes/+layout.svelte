<script lang="ts">
	import { Switch } from '@skeletonlabs/skeleton-svelte';
	import { ModeWatcher, mode, setMode } from 'mode-watcher';

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
			checked={mode.current === 'dark'}
			onCheckedChange={(e) => setMode(e.checked ? 'dark' : 'light')}
		>
			<Switch.Control>
				<Switch.Thumb />
			</Switch.Control>
			<Switch.HiddenInput />
		</Switch>
	</div>

	{@render children?.()}
</main>
