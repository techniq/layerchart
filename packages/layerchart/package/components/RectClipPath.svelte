<script>import { uniqueId } from 'svelte-ux/utils/string';
import ClipPath from './ClipPath.svelte';
import Rect from './Rect.svelte';
/** Unique id for clipPath */
export let id = uniqueId('clipPath-');
export let x = 0;
export let y = 0;
export let width;
export let height;
export let spring = undefined;
export let tweened = undefined;
</script>

<ClipPath {id}>
	<Rect {x} {y} {width} {height} {spring} {tweened} />
</ClipPath>

{#if $$slots.default}
	<g style="clip-path: url(#{id})" on:click on:mousemove on:mouseleave>
		<slot {id} />
	</g>
{/if}
