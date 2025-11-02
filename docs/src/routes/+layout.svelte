<script lang="ts">
	import { settings } from 'svelte-ux';
	import '../app.css';

	let { data, children } = $props();

	// Apply theme settings
	settings({
		components: {},
		// @ts-expect-error - shh
		themes: data.themes
	});
</script>

{@render children()}
