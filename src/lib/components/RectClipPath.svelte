<script lang="ts">
	import { uniqueId } from 'svelte-ux/utils/string';

	import ClipPath from './ClipPath.svelte';

	/** Unique id for clipPath */
	export let id: string = uniqueId('clipPath-');

	export let x: number = 0;
	export let y: number = 0;
	export let width: number;
	export let height: number;
</script>

<ClipPath {id}>
	<rect {x} {y} {width} {height} />
</ClipPath>

{#if $$slots.default}
	<g style="clip-path: url(#{id})">
		<slot {id} />
	</g>
{/if}
