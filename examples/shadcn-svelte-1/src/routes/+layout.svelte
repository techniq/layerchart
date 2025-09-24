<script lang="ts">
	import { ModeWatcher, mode, setMode } from 'mode-watcher';
	import { Switch } from '$lib/components/ui/switch/index.js';

	import '../app.css';
	import favicon from '$lib/assets/favicon.svg';

	let { children } = $props();
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
</svelte:head>

<ModeWatcher />

<main class="p-4">
	<div class="pb-4 text-right">
		<Switch
			checked={mode.current === 'dark'}
			onCheckedChange={(checked) => setMode(checked ? 'dark' : 'light')}
		/>
	</div>

	{@render children?.()}
</main>
