<script lang="ts">
	import { ModeWatcher, theme, setTheme } from 'mode-watcher';

	import favicon from '$lib/assets/favicon.svg';
	import '../app.css';

	let { children } = $props();
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
</svelte:head>

<ModeWatcher />

<main class="p-4">
	<div class="pb-4 text-right">
		<input
			type="checkbox"
			checked={theme.current === 'dark'}
			class="toggle"
			onchange={(e) => {
				// @ts-expect-error
				setTheme(e.target.checked ? 'dark' : 'light');
			}}
		/>
	</div>

	{@render children?.()}
</main>
