<script lang="ts">
	import { RangeField, SelectField } from 'svelte-ux';
	import type { GeoProjection } from 'd3-geo';

	// <GraticuleControls bind:config {projections} />

	interface Rotate {
		yaw: number;
		pitch: number;
		roll: number;
	}

	interface ProjectionOption {
		label: string;
		value: () => GeoProjection;
	}

	interface GraticuleConfig {
		stepX: number;
		stepY: number;
		projection: () => GeoProjection;
		rotate: Rotate;
	}

	interface Props {
		config?: GraticuleConfig;
		projections: ProjectionOption[];
	}

	let {
		config = $bindable({
			stepX: 10,
			stepY: 10,
			projection: () => ({}) as GeoProjection,
			rotate: { yaw: 0, pitch: -30, roll: 20 }
		}),
		projections
	}: Props = $props();
</script>

<div class="grid grid-cols-[1fr_1fr_auto] gap-2 my-2">
	<SelectField
		label="Projections"
		options={projections}
		bind:value={config.projection}
		clearable={false}
		toggleIcon={null}
		stepper
	/>
</div>
<div class="grid grid-cols-[1fr_1fr_1fr] gap-2 my-2">
	<RangeField label="Yaw" bind:value={config.rotate.yaw} min={-360} max={360} />
	<RangeField label="Pitch" bind:value={config.rotate.pitch} min={-90} max={90} />
	<RangeField label="Roll" bind:value={config.rotate.roll} min={-180} max={180} />
</div>
<div class="grid grid-cols-2 gap-2 my-2">
	<RangeField label="Step X" bind:value={config.stepX} min={0} max={180} />
	<RangeField label="Step Y" bind:value={config.stepY} min={0} max={180} />
</div>
