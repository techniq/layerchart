<script lang="ts" module>
	export { default as h1 } from '../../components/h1.svelte';
	export { default as code } from '../../components/code.svelte';
	export { default as img } from '../../components/img.svelte';
	export { default as pre } from '../../components/pre.svelte';
	export { default as table } from '../../components/table.svelte';
	export { default as tr } from '../../components/tr.svelte';
	export { default as th } from '../../components/th.svelte';
	export { default as td } from '../../components/td.svelte';
</script>

<script lang="ts">
	import { type Snippet } from 'svelte';

	let { metadata, children }: { metadata: any; children: Snippet } = $props();
</script>

{@render children()}
