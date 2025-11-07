<script lang="ts">
	import { RangeField } from 'svelte-ux';

	// <VoronoiControls bind:radius />

	interface Props {
		radius?: number;
	}

	let { radius = $bindable(0) }: Props = $props();
</script>

<div class="mb-4 lc-example-controls">
	<RangeField label="Radius" bind:value={radius} max={100} />
</div>
