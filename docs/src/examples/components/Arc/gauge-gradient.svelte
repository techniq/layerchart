<script lang="ts">
	import { Arc, Chart, Circle, Group, Layer, Line, Text } from 'layerchart';
	import { scaleLinear } from 'd3-scale';
	import * as chromatic from 'd3-scale-chromatic';
	import { RangeField, SelectField, Switch } from 'svelte-ux';

	let value = $state(68);
	let segments = $state(150);
	let tickCount = $state(5);
	let outerRadius = $state(80);
	let innerRadius = $state(68);
	let arcSpan = $state(240);
	let colorScheme = $state('interpolateRdYlBu');
	let invertColors = $state(true);

	export { value as data };

	const colorSchemes = [
		'interpolateRdYlBu',
		'interpolateRdYlGn',
		'interpolateSpectral',
		'interpolateRdBu',
		'interpolatePiYG',
		'interpolatePRGn',
		'interpolateBrBG',
		'interpolateRdGy',
		'interpolatePuOr',
		'interpolateViridis',
		'interpolatePlasma',
		'interpolateInferno',
		'interpolateMagma',
		'interpolateTurbo',
		'interpolateCool',
		'interpolateWarm',
		'interpolateRainbow',
		'interpolateSinebow',
		'interpolateCividis'
	];

	const domain: [number, number] = [0, 100];
	const halfSpan = $derived(arcSpan / 2);
	const angleRange = $derived([-halfSpan, halfSpan] as [number, number]);
	const angleScale = $derived(scaleLinear().domain(domain).range(angleRange));
	const interpolate = $derived(
		(chromatic as unknown as Record<string, (t: number) => string>)[colorScheme]
	);

	const segmentData = $derived(
		Array.from({ length: segments }, (_, i) => {
			const t = i / segments;
			return {
				startAngle: (angleScale(t * 100) * Math.PI) / 180,
				endAngle: (angleScale(((i + 1) / segments) * 100) * Math.PI) / 180,
				color: interpolate(invertColors ? 1 - t : t)
			};
		})
	);

	const ticks = $derived(Array.from({ length: tickCount + 1 }, (_, i) => (i / tickCount) * 100));

	const needleAngleRad = $derived((angleScale(value) * Math.PI) / 180);
</script>

<div class="grid grid-cols-[1fr_1fr_1fr] gap-2 mb-2">
	<RangeField label="Value" bind:value min={0} max={100} step={1} />
	<RangeField label="Arc Span" bind:value={arcSpan} min={10} max={360} step={5} />
	<RangeField label="Ticks" bind:value={tickCount} min={1} max={20} />
	<RangeField label="Inner Radius" bind:value={innerRadius} min={10} max={outerRadius - 2} />
	<RangeField label="Outer Radius" bind:value={outerRadius} min={20} max={120} />
	<RangeField label="Color Steps" bind:value={segments} min={tickCount} max={200} />
	<SelectField
		label="Color Scheme"
		bind:value={colorScheme}
		options={colorSchemes.map((s) => ({ label: s.replace('interpolate', ''), value: s }))}
		stepper
		clearable={false}
		toggleIcon={null}
		class="col-span-full"
	>
		<div slot="append" onclick={(e) => e.stopPropagation()} role="none">
			<div class="text-[10px] text-surface-content/50 text-center">Invert</div>
			<Switch bind:checked={invertColors} size="md" />
		</div>
	</SelectField>
</div>

<Chart height={200} padding={20}>
	<Layer center>
		<Group y={16}>
			<!-- Color segments -->
			{#each segmentData as seg, i (i)}
				<Arc
					startAngle={seg.startAngle}
					endAngle={seg.endAngle}
					{outerRadius}
					{innerRadius}
					fill={seg.color}
				/>
			{/each}

			<!-- Tick marks and labels -->
			{#each ticks as tick (tick)}
				{@const angleRad = (angleScale(tick) * Math.PI) / 180}
				{@const tickInner = innerRadius - 0}
				{@const tickOuter = outerRadius + 0}
				{@const labelRadius = innerRadius - 14}
				<Line
					x1={Math.sin(angleRad) * tickInner}
					y1={-Math.cos(angleRad) * tickInner}
					x2={Math.sin(angleRad) * tickOuter}
					y2={-Math.cos(angleRad) * tickOuter}
					class="stroke-surface-200"
					strokeWidth={1.5}
				/>
				<Text
					x={Math.sin(angleRad) * labelRadius}
					y={-Math.cos(angleRad) * labelRadius}
					value={tick / 100}
					format="percentRound"
					textAnchor="middle"
					verticalAnchor="middle"
					class="text-[8px] fill-surface-content/50 tabular-nums"
				/>
			{/each}

			<!-- Needle -->
			<Line
				x1={Math.sin(needleAngleRad) * -10}
				y1={-Math.cos(needleAngleRad) * -10}
				x2={Math.sin(needleAngleRad) * (outerRadius + 2)}
				y2={-Math.cos(needleAngleRad) * (outerRadius + 2)}
				class="stroke-surface-content"
				strokeWidth={2}
			/>
			<Circle r={6} class="fill-surface-content" />
			<Circle r={3} class="fill-surface-200" />

			<!-- Value display -->
			<Text
				value={value + '%'}
				textAnchor="middle"
				verticalAnchor="middle"
				dy={30}
				class="text-2xl font-bold tabular-nums"
			/>
		</Group>
	</Layer>
</Chart>
