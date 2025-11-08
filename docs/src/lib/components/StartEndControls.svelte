<script lang="ts">
	import { Field, Switch } from 'svelte-ux';

	interface Props {
		markerStart?: boolean;
		markerEnd?: boolean;
	}

	let { markerStart = $bindable(true), markerEnd = $bindable(true) }: Props = $props();
</script>

<div class="grid grid-cols-[60px_60px] gap-2 mb-2">
	<Field label="Start" let:id>
		<Switch bind:checked={markerStart} {id} size="md" />
	</Field>
	<Field label="End" let:id>
		<Switch bind:checked={markerEnd} {id} size="md" />
	</Field>
</div>
