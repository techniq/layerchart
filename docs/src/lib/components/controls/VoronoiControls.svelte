<script lang="ts">
	import { RangeField } from 'svelte-ux';

	interface Props {
		radius?: number;
	}

	let { radius = $bindable() }: Props = $props();
</script>

<div class="mb-4 screenshot-hidden">
	<RangeField label="Radius" bind:value={radius} max={100} />
</div>
