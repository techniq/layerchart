<script lang="ts">
	import { Field, RangeField, Switch, TextField } from 'svelte-ux';
	import { Arc, Chart, LinearGradient, Text, Layer } from 'layerchart';

	let value = $state(60);
	// let value = 100;
	let domain = $state<[number, number]>([0, 100]);
	// let range = [-120, 120];
	let range = $state<[number, number]>([-90, 90]);
	let innerRadius = $state(70);
	let outerRadius = $state(140);
	let cornerRadius = $state(8);
	let padAngle = $state(0);
	let padRadius = $state(0);

	let spring = $state(true);

	let outerText = $state('outer text');
	let innerText = $state('inner text');
	let centroidText = $state('centroid text');
	let textSize = $state(16);

	const labelOptions = [
		{ name: 'None', value: undefined },
		{ name: 'SVG Center', value: 'svg-center' },
		{ name: 'Arc Center', value: 'arc-center' },
		{ name: 'Arc Bottom', value: 'arc-bottom' },
		{ name: 'Arc Centroid', value: 'arc-centroid' }
	];
	let label = 'svg-center';
</script>

<div class="grid grid-cols-[1fr_1fr_1fr_1fr] gap-2 mb-2">
	<RangeField label="Value" bind:value min={domain[0]} max={domain[1]} class="col-span-3" />
	<Field label="Use spring" let:id>
		<Switch bind:checked={spring} {id} />
	</Field>
	<RangeField label="Domain Min" bind:value={domain[0]} max={domain[1]} />
	<RangeField label="Domain Max" bind:value={domain[1]} max={1000} />
	<RangeField label="Range Min (degrees)" bind:value={range[0]} min={-360} max={360} />
	<RangeField label="Range Max (degrees)" bind:value={range[1]} min={-360} max={360} />
	<RangeField label="Inner radius" bind:value={innerRadius} max={outerRadius} />
	<RangeField label="Outer radius" bind:value={outerRadius} min={innerRadius} max={200} />
	<RangeField
		label="Corner radius"
		bind:value={cornerRadius}
		max={(outerRadius - innerRadius) / 2}
	/>
	<RangeField label="Pad angle" bind:value={padAngle} max={2} step={0.1} />
	<!-- <RangeField label="Pad radius" bind:value={padRadius} max={2} step={0.1} /> -->
	<TextField label="Outer Arc Text" bind:value={outerText} />
	<TextField label="Inner Arc Text" bind:value={innerText} />
	<TextField label="Centroid Arc Text" bind:value={centroidText} />
	<RangeField label="Font size (px)" bind:value={textSize} min={domain[0]} max={domain[1]} />
</div>

<Chart height={400}>
	<Layer center>
		{#key spring}
			<LinearGradient class="from-secondary to-primary" vertical>
				{#snippet children({ gradient })}
					<Arc
						{value}
						{domain}
						{range}
						{innerRadius}
						{outerRadius}
						{cornerRadius}
						{padAngle}
						motion={spring ? 'spring' : undefined}
						fill={gradient}
						track={{ class: 'fill-surface-content/5' }}
					>
						{#snippet children({ value, getArcTextProps })}
							<Text
								value={Math.round(value)}
								textAnchor="middle"
								verticalAnchor="middle"
								class="text-4xl"
								dy={8}
							/>
							<!-- Arc labels -->
							<Text
								{...getArcTextProps('inner')}
								value={innerText}
								font-size="{textSize}px"
								truncate
							/>
							<Text
								{...getArcTextProps('outer')}
								value={outerText}
								font-size="{textSize}px"
								truncate
							/>
							<Text
								{...getArcTextProps('middle')}
								value={centroidText}
								font-size="{textSize}px"
								truncate
							/>
						{/snippet}
					</Arc>
				{/snippet}
			</LinearGradient>
		{/key}
	</Layer>
</Chart>
