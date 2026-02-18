<script lang="ts">
	import { onMount } from 'svelte';
	import { settings } from 'svelte-ux';
	import posthog from 'posthog-js';
	import { watch } from 'runed';

	import { dev } from '$app/environment';
	import { page } from '$app/state';
	import { preparePageTransition } from '$lib/page-transitions';
	import favicon from '$lib/assets/favicon.svg';

	import '@fontsource-variable/inter';
	import '../app.css';

	let { data, children } = $props();

	// Apply theme settings
	settings({
		components: {},
		// @ts-expect-error - shh
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
			watch(
				() => page,
				() => {
					if (currentPath && currentPath !== page.url.pathname) {
						// Page navigated away
						posthog.capture('$pageleave');
					}
					// Page entered
					currentPath = page.url.pathname;
					posthog.capture('$pageview');
				}
			);
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

	// View transition for navigation
	preparePageTransition();

	const defaultDescription =
		'Composable Svelte chart components to build a large variety of visualizations';

	let pageTitle = $derived(
		page.data.metadata?.name ? `${page.data.metadata.name} | LayerChart` : 'LayerChart'
	);
	let pageDescription = $derived(page.data.metadata?.description ?? defaultDescription);
	let ogImageUrl = $derived(
		`${page.url.origin}/og?title=${encodeURIComponent(page.data.metadata?.name ?? 'LayerChart')}${page.data.metadata?.description ? `&description=${encodeURIComponent(page.data.metadata.description)}` : `&description=${encodeURIComponent(defaultDescription)}`}${page.data.metadata?.category ? `&component=${encodeURIComponent(page.data.metadata.category)}` : ''}`
	);
</script>

<svelte:head>
	<title>{pageTitle}</title>
	<meta name="description" content={pageDescription} />

	<!-- Open Graph -->
	<meta property="og:type" content="website" />
	<meta property="og:title" content={pageTitle} />
	<meta property="og:description" content={pageDescription} />
	<meta property="og:image" content={ogImageUrl} />
	<meta property="og:image:width" content="1200" />
	<meta property="og:image:height" content="630" />
	<meta property="og:url" content={page.url.href} />
	<meta property="og:site_name" content="LayerChart" />

	<!-- Twitter Card -->
	<meta name="twitter:card" content="summary_large_image" />
	<meta name="twitter:site" content="@techniq35" />
	<meta name="twitter:title" content={pageTitle} />
	<meta name="twitter:description" content={pageDescription} />
	<meta name="twitter:image" content={ogImageUrl} />

	<link rel="icon" href={favicon} />
</svelte:head>

<!-- Disable data preloading until Svelte async/fork is improved -->
<!-- TODO: might be fixed in 2.49.4 - https://github.com/sveltejs/kit/releases/tag/%40sveltejs%2Fkit%402.49.4 -->
<div data-sveltekit-preload-data="off">
	{@render children()}
</div>
