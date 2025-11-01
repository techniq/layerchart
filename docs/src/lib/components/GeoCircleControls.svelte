<script lang="ts">
	import { Field, SelectField, RangeField, ToggleGroup, ToggleOption } from 'svelte-ux';

	// <GeoCircleControls bind:example bind:projection projections={projections} bind:latitude bind:longitude bind:radius bind:precision />

	interface Props {
		example?: 'single' | 'multi';
		projection?: any;
		projections?: { label: string; value: any }[];
		latitude?: number;
		longitude?: number;
		radius?: number;
		precision?: number;
	}

	let {
		example = $bindable('single'),
		projection = $bindable(null),
		projections = [],
		latitude = $bindable(0),
		longitude = $bindable(0),
		radius = $bindable(600),
		precision = $bindable(6)
	}: Props = $props();
</script>

<div class="grid grid-cols-2 gap-2 my-2">
	<Field label="Example">
		<ToggleGroup bind:value={example} variant="outline" inset class="w-full" size="sm">
			<ToggleOption value="single">Single</ToggleOption>
			<ToggleOption value="multi">Multi</ToggleOption>
		</ToggleGroup>
	</Field>

	<SelectField
		label="Projections"
		options={projections}
		bind:value={projection}
		clearable={false}
		toggleIcon={null}
		stepper
	/>

	<RangeField
		label="Latitude"
		bind:value={latitude}
		min={-90}
		max={90}
		disabled={example != 'single'}
	/>
	<RangeField
		label="Longitude"
		bind:value={longitude}
		min={-180}
		max={180}
		disabled={example != 'single'}
	/>
	<RangeField label="Radius (km)" bind:value={radius} max={6371} disabled={example != 'single'} />
	<RangeField label="Precision" bind:value={precision} max={90} disabled={example != 'single'} />
</div>
