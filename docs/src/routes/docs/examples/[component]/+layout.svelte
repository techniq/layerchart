<script lang="ts">
	import { examples } from '$lib/context.js';

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
