<script lang="ts">
	import Example from '$lib/components/Example.svelte';
	import { page } from '$app/state';

	let example = page.params.example!;
	let component = page.url.searchParams.get('component') ?? page.params.name!;
</script>

<Example name={example} {component} variant="basic" />
