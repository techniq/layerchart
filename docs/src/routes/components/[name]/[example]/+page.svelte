<script lang="ts">
	import Example from '$lib/components/Example.svelte';
	import { page } from '$app/state';

	let example = page.params.example!;
</script>

<Example name={example} showCode />
