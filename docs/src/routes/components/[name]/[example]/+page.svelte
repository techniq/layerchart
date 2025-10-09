<script lang="ts">
	import { h3 as H3 } from '$lib/markdown/blueprints/default/blueprint.svelte';

	import Example from '$lib/components/Example.svelte';
	import { page } from '$app/state';

	let example = page.params.example!;
</script>

<H3 class="first-letter:capitalize">{example.replaceAll('-', ' ')}</H3>
<Example name={example} />
