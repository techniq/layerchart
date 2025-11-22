<script lang="ts">
	import { Field, RangeField, SelectField, Switch } from 'svelte-ux';

	interface Rotate {
		yaw: number;
		pitch: number;
		roll: number;
	}

	interface Props {
		projections: Array<{ label: string; value: any }>;
		projection: any;
		scale: number;
		detailed: boolean;
		rotate: Rotate;
	}

	let {
		projections,
		projection = $bindable(),
		scale = $bindable(),
		detailed = $bindable(),
		rotate = $bindable()
	}: Props = $props();
</script>

<div class="grid grid-cols-[1fr_1fr_auto] gap-2 my-2 screenshot-hidden">
	<SelectField
		label="Projections"
		options={projections}
		bind:value={projection}
		clearable={false}
		toggleIcon={null}
		stepper
	/>
	<RangeField label="Scale" bind:value={scale} min={-100} max={3000} />
	<Field label="Detail" let:id>
		<Switch bind:checked={detailed} {id} />
	</Field>
</div>
<div class="grid grid-cols-[1fr_1fr_1fr] gap-2 my-2">
	<RangeField label="Yaw" bind:value={rotate.yaw} min={-360} max={360} />
	<RangeField label="Pitch" bind:value={rotate.pitch} min={-90} max={90} />
	<RangeField label="Roll" bind:value={rotate.roll} min={-180} max={180} />
</div>
