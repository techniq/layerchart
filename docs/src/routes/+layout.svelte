<script lang="ts">
	import { onMount } from 'svelte';
	import { settings } from 'svelte-ux';
	import posthog from 'posthog-js';

	import { dev } from '$app/environment';
	import { afterNavigate } from '$app/navigation';
	import { page } from '$app/state';
	import { pageMeta } from '$lib/meta';
	import { preparePageTransition } from '@layerstack/docs/page-transitions';
	import '@fontsource-variable/inter';
	import '../app.css';

	let { data, children } = $props();

	// Apply theme settings
	settings({
		components: {},
		// svelte-ignore state_referenced_locally
		themes: data.themes
	});

	let currentPath = '';
	onMount(() => {
		// Delay adding `scroll-smooth` to `<html>` as provides better refresh experience
		// and fixes issue where sometimes doesn't scroll far enough
		setTimeout(() => {
			document.documentElement.classList.add('scroll-smooth');
		}, 0);

		// Posthog analytics
		if (!dev) {
			const handleBeforeUnload = () => {
				// Hard reloads or browser exit
				posthog.capture('$pageleave');
			};
			window.addEventListener('beforeunload', handleBeforeUnload);
			return () => {
				window.removeEventListener('beforeunload', handleBeforeUnload);
			};
		}
	});

	// Posthog page views (automatic capture is disabled in `+layout.ts`).  Tracks the pathname, as
	// reading `page` itself is not reactive
	$effect(() => {
		if (dev) return;
		const pathname = page.url.pathname;
		if (currentPath && currentPath !== pathname) {
			// Page navigated away
			posthog.capture('$pageleave');
		}
		// Page entered
		currentPath = pathname;
		posthog.capture('$pageview');
	});

	// View transition for navigation
	preparePageTransition();

	// Scroll to hash target after client-side navigation (View Transitions can prevent native hash scrolling)
	afterNavigate(() => {
		const hash = window.location.hash;
		if (hash) {
			const el = document.querySelector(hash);
			if (el) {
				// Use requestAnimationFrame to ensure the view transition has finished rendering
				requestAnimationFrame(() => {
					el.scrollIntoView();
				});
			}
		}
	});

	// The title and tags for search and link previews (see `$lib/meta`)
	let meta = $derived(pageMeta(page.url, page.data.metadata));
</script>

<svelte:head>
	<title>{meta.title}</title>
	{#each meta.tags as [attribute, key, content] (key)}
		<meta {...{ [attribute]: key }} {content} />
	{/each}

	<link rel="icon" href="/favicon.svg" type="image/svg+xml" />
	<!-- Raster fallbacks for services that don't read SVG icons (e.g. DuckDuckGo's icon service) -->
	<link rel="icon" href="/favicon-32.png" sizes="32x32" type="image/png" />
	<link rel="icon" href="/favicon.ico" sizes="16x16 32x32 48x48" />
	<link rel="apple-touch-icon" href="/apple-touch-icon.png" />

	{#if page.url.origin.includes('https')}
		<script
			defer
			src="https://static.cloudflareinsights.com/beacon.min.js"
			data-cf-beacon={JSON.stringify({ token: 'aff39463882545fd8cca0adba6afa86e' })}
		></script>

		<script
			async
			defer
			src="https://us.umami.is/script.js"
			data-website-id="98141640-7328-4228-ba7b-2287da133ee9"
		></script>
	{/if}
</svelte:head>

<!-- Disable data preloading until Svelte async/fork is improved -->
<!-- TODO: might be fixed in 2.49.4 - https://github.com/sveltejs/kit/releases/tag/%40sveltejs%2Fkit%402.49.4 -->
<div data-sveltekit-preload-data="off">
	{@render children()}
</div>
