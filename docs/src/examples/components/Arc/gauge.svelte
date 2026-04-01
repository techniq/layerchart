<script lang="ts">
	import { Arc, Chart, ClipPath, Group, Layer, Line, LinearGradient, Text } from 'layerchart';
	import { scaleLinear, scaleThreshold } from 'd3-scale';

	let value = $state(62);
	let outerRadius = 80;
	let innerRadius = 68;
	export { value as data };

	const domain: [number, number] = [0, 100];
	const angleRange: [number, number] = [-120, 120];

	const angleScale = scaleLinear().domain(domain).range(angleRange);

	const ticks = [0, 25, 50, 75, 100];

	const statusScale = scaleThreshold<number, { label: string; class: string }>()
		.domain([30, 70, 90])
		.range([
			{ label: 'Low', class: 'fill-red-500' },
			{ label: 'Good', class: 'fill-emerald-500' },
			{ label: 'Warning', class: 'fill-yellow-500' },
			{ label: 'Critical', class: 'fill-red-500' }
		]);

	const status = $derived(statusScale(value));
</script>

<div class="flex flex-col items-center gap-2">
	<input type="range" min={0} max={100} bind:value class="w-48" />

	<Chart height={160} padding={20}>
		<Layer center>
			<Group y={20}>
				<LinearGradient class="from-emerald-500 via-yellow-500 to-red-500">
					{#snippet children({ gradient })}
						<ClipPath>
							{#snippet clip()}
								<Arc
									{value}
									{domain}
									range={angleRange}
									{outerRadius}
									{innerRadius}
									cornerRadius={6}
									motion="spring"
								/>
							{/snippet}
							<Arc
								value={domain[1]}
								{domain}
								range={angleRange}
								{outerRadius}
								{innerRadius}
								cornerRadius={6}
								fill={gradient}
							/>
						</ClipPath>
					{/snippet}
				</LinearGradient>

				<!-- Track outline -->
				<Arc
					value={domain[1]}
					{domain}
					range={angleRange}
					{outerRadius}
					{innerRadius}
					cornerRadius={6}
					class="fill-none"
					track={{ class: 'fill-none stroke-surface-content/10' }}
				/>

				<!-- Tick marks and labels -->
				{#each ticks as tick (tick)}
					{@const angleDeg = angleScale(tick)}
					{@const angleRad = (angleDeg * Math.PI) / 180}
					{@const tickOuter = innerRadius - 3}
					{@const tickInner = innerRadius - 10}
					{@const labelRadius = innerRadius - 16}
					<Line
						x1={Math.sin(angleRad) * tickInner}
						y1={-Math.cos(angleRad) * tickInner}
						x2={Math.sin(angleRad) * tickOuter}
						y2={-Math.cos(angleRad) * tickOuter}
						class="stroke-surface-content/40"
						strokeWidth={1.5}
					/>
					<Text
						x={Math.sin(angleRad) * labelRadius}
						y={-Math.cos(angleRad) * labelRadius}
						value={String(tick)}
						textAnchor="middle"
						verticalAnchor="middle"
						class="text-[8px] fill-surface-content/50 tabular-nums"
					/>
				{/each}

				<!-- Value display -->
				<Text
					value={Math.round(value) + '%'}
					textAnchor="middle"
					verticalAnchor="middle"
					class="text-3xl font-bold tabular-nums"
				/>

				<!-- Status label -->
				<Text
					x={0}
					y={22}
					value={status.label}
					textAnchor="middle"
					verticalAnchor="middle"
					class={`text-[10px] font-medium ${status.class}`}
				/>
			</Group>
		</Layer>
	</Chart>
</div>
