<script lang="ts">
	import { examples } from '@layerstack/docs/context';

	let { data, children } = $props();

	// Add examples to context for Example component to use
	const examplesContext = {
		get current() {
			return data.examples;
		}
	};
	examples.set(examplesContext);
</script>

{@render children()}

<style>
	:global(body) {
		/* Remove background set in `app.html` to allow for transparent screenshots */
		background: unset;
	}
</style>
