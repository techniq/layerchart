<script lang="ts">
	import { Field, SelectField, RangeField, ToggleGroup, ToggleOption } from 'svelte-ux';

	// <GeoCircleControls bind:config {projections} />

	interface GeoCircleConfig {
		example: 'single' | 'multi';
		projection: any;
		latitude: number;
		longitude: number;
		radius: number;
		precision: number;
	}

	interface Props {
		config?: GeoCircleConfig;
		projections?: { label: string; value: any }[];
	}

	let {
		config = $bindable({
			example: 'single' as 'single' | 'multi',
			projection: null,
			latitude: 0,
			longitude: 0,
			radius: 600,
			precision: 6
		}),
		projections = []
	}: Props = $props();
</script>

<div class="grid grid-cols-2 gap-2 my-2">
	<Field label="Example">
		<ToggleGroup bind:value={config.example} variant="outline" inset class="w-full" size="sm">
			<ToggleOption value="single">Single</ToggleOption>
			<ToggleOption value="multi">Multi</ToggleOption>
		</ToggleGroup>
	</Field>

	<SelectField
		label="Projections"
		options={projections}
		bind:value={config.projection}
		clearable={false}
		toggleIcon={null}
		stepper
	/>

	<RangeField
		label="Latitude"
		bind:value={config.latitude}
		min={-90}
		max={90}
		disabled={config.example != 'single'}
	/>
	<RangeField
		label="Longitude"
		bind:value={config.longitude}
		min={-180}
		max={180}
		disabled={config.example != 'single'}
	/>
	<RangeField
		label="Radius (km)"
		bind:value={config.radius}
		max={6371}
		disabled={config.example != 'single'}
	/>
	<RangeField
		label="Precision"
		bind:value={config.precision}
		max={90}
		disabled={config.example != 'single'}
	/>
</div>
