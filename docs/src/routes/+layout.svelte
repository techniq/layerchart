<script lang="ts">
	import { onMount } from 'svelte';
	import { settings } from 'svelte-ux';
	import posthog from 'posthog-js';
	import { watch } from 'runed';

	import { dev } from '$app/environment';
	import { page } from '$app/state';

	import '@fontsource-variable/inter';
	import '../app.css';

	let { data, children } = $props();

	// Apply theme settings
	settings({
		components: {},
		// @ts-expect-error - shh
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
</script>

{@render children()}
