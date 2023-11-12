<script>import { uniqueId } from 'svelte-ux/utils/string';
import ClipPath from './ClipPath.svelte';
import Circle from './Circle.svelte';
/** Unique id for clipPath */
export let id = uniqueId('clipPath-');
export let cx = 0;
export let cy = 0;
export let r;
export let spring = undefined;
export let tweened = undefined;
</script>

<ClipPath {id}>
	<Circle {cx} {cy} {r} {spring} {tweened} />
</ClipPath>

{#if $$slots.default}
	<g style="clip-path: url(#{id})" on:click on:mousemove on:mouseleave>
		<slot {id} />
	</g>
{/if}
