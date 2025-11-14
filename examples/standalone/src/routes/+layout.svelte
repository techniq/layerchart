<script lang="ts">
	import { ModeWatcher, mode, toggleMode } from 'mode-watcher';

	import favicon from '$lib/assets/favicon.svg';

	let { children } = $props();
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
</svelte:head>

<ModeWatcher />

<main>
	<div class="pb-4 text-right">
		<button onclick={toggleMode}>
			{mode.current === 'dark' ? '🌞' : '🌙'} Toggle mode
		</button>
	</div>

	{@render children?.()}
</main>
