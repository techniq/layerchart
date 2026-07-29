<script lang="ts">
	import { ModeWatcher, mode, setMode, setTheme } from 'mode-watcher';

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
			checked={mode.current === 'dark'}
			class="toggle"
			onchange={(e) => {
				// daisyUI switches its palette (and `color-scheme`) via `data-theme`, so keep it in
				// sync with mode-watcher's light/dark mode. Setting both means mode-watcher's inline
				// `color-scheme` and daisyUI's agree, so `light-dark()` (e.g. LayerChart's Tooltip)
				// resolves correctly. mode-watcher persists both and sets them pre-paint (no flash).
				const theme = e.currentTarget.checked ? 'dark' : 'light';
				setMode(theme); // `.dark` class + inline `color-scheme` (drives `light-dark()`)
				setTheme(theme); // daisyUI `data-theme` (drives its palette)
			}}
		/>
	</div>

	{@render children?.()}
</main>
