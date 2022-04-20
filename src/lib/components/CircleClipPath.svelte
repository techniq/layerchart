<script lang="ts">
	import { uniqueId } from 'svelte-ux/utils/string';

	import ClipPath from './ClipPath.svelte';

	/** Unique id for clipPath */
	export let id: string = uniqueId('clipPath-');

	export let cx: number = 0;
	export let cy: number = 0;
	export let r: number;
</script>

<ClipPath {id}>
	<circle {cx} {cy} {r} />
</ClipPath>

<slot {id} />
