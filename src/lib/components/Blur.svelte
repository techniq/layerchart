<script lang="ts">
	import { uniqueId } from 'svelte-ux/utils/string';

	export let id: string = uniqueId('blur-');
	export let stdDeviation = 5;
</script>

<defs>
	<filter {id}>
		<feGaussianBlur in="SourceGraphic" {stdDeviation} />
	</filter>
</defs>

{#if $$slots.default}
	<g filter="url(#{id})">
		<slot {id} />
	</g>
{/if}
