<script lang="ts">
	import { uniqueId } from 'svelte-ux/utils/string';

	import ClipPath from './ClipPath.svelte';

	/** Id of path or shape */
	export let id: string;

	/** Unique id for clipPath */
	export let clipId: string = uniqueId('clipPath-');
</script>

<ClipPath id={clipId}>
	<use href="#{id}" />
</ClipPath>

{#if $$slots.default}
	<g style="clip-path: url(#{clipId})" on:click on:mousemove on:mouseleave>
		<slot {id} {clipId} />
	</g>
{/if}
