<script lang="ts">
	import { Arc, Chart, Circle, Group, Layer, Line, Text } from 'layerchart';
	import { scaleLinear } from 'd3-scale';

	let speed = $state(45);

	export { speed as data };

	const domain: [number, number] = [0, 120];
	const angleRange: [number, number] = [-120, 120];
	let outerRadius = 80;
	let innerRadius = 70;

	const angleScale = scaleLinear().domain(domain).range(angleRange);

	const zones = [
		{ min: 0, max: 45, class: 'fill-emerald-500' },
		{ min: 45, max: 75, class: 'fill-yellow-500' },
		{ min: 75, max: 100, class: 'fill-orange-500' },
		{ min: 100, max: 120, class: 'fill-red-500' }
	];

	const majorTicks = Array.from({ length: 13 }, (_, i) => i * 10);
	const minorTicks = Array.from({ length: 25 }, (_, i) => i * 5).filter((t) => t % 10 !== 0);

	const needleAngleRad = $derived((angleScale(speed) * Math.PI) / 180);
</script>

<div class="flex flex-col items-center gap-2">
	<input type="range" min={0} max={120} bind:value={speed} class="w-48" />

	<Chart height={200} padding={20}>
		<Layer center>
			<Group y={20}>
				<!-- Color zone arcs -->
				{#each zones as zone (zone.min)}
					<Arc
						startAngle={(angleScale(zone.min) * Math.PI) / 180}
						endAngle={(angleScale(zone.max) * Math.PI) / 180}
						{outerRadius}
						{innerRadius}
						class={zone.class}
					/>
				{/each}

				<!-- Track arc (background) -->
				<Arc
					value={0}
					{domain}
					range={angleRange}
					{outerRadius}
					{innerRadius}
					class="fill-none"
					track={{ class: 'fill-none stroke-surface-content/5' }}
				/>

				<!-- Major tick marks -->
				{#each majorTicks as tick (tick)}
					{@const angleDeg = angleScale(tick)}
					{@const angleRad = (angleDeg * Math.PI) / 180}
					{@const tickInner = innerRadius - 12}
					{@const tickOuter = innerRadius - 2}
					{@const labelRadius = innerRadius - 20}
					<Line
						x1={Math.sin(angleRad) * tickInner}
						y1={-Math.cos(angleRad) * tickInner}
						x2={Math.sin(angleRad) * tickOuter}
						y2={-Math.cos(angleRad) * tickOuter}
						class="stroke-surface-content"
						strokeWidth={2}
					/>
					<Text
						x={Math.sin(angleRad) * labelRadius}
						y={-Math.cos(angleRad) * labelRadius}
						value={String(tick)}
						textAnchor="middle"
						verticalAnchor="middle"
						class="text-[9px] fill-surface-content/60 tabular-nums"
					/>
				{/each}

				<!-- Minor tick marks -->
				{#each minorTicks as tick (tick)}
					{@const angleDeg = angleScale(tick)}
					{@const angleRad = (angleDeg * Math.PI) / 180}
					{@const tickInner = innerRadius - 8}
					{@const tickOuter = innerRadius - 2}
					<Line
						x1={Math.sin(angleRad) * tickInner}
						y1={-Math.cos(angleRad) * tickInner}
						x2={Math.sin(angleRad) * tickOuter}
						y2={-Math.cos(angleRad) * tickOuter}
						class="stroke-surface-content/40"
						strokeWidth={1}
					/>
				{/each}

				<!-- Needle -->
				<Line
					x1={Math.sin(needleAngleRad) * -10}
					y1={-Math.cos(needleAngleRad) * -10}
					x2={Math.sin(needleAngleRad) * (innerRadius - 10)}
					y2={-Math.cos(needleAngleRad) * (innerRadius - 10)}
					class="stroke-red-500"
					strokeWidth={2.5}
				/>
				<Circle r={5} class="fill-surface-content" />

				<!-- Speed readout -->
				<Text
					value={String(Math.round(speed))}
					textAnchor="middle"
					verticalAnchor="middle"
					dy={28}
					class="text-2xl font-bold tabular-nums"
				/>
				<Text
					x={0}
					y={42}
					value="mph"
					textAnchor="middle"
					verticalAnchor="middle"
					class="text-[8px] fill-surface-content/50"
				/>
			</Group>
		</Layer>
	</Chart>
</div>
