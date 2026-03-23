<script lang="ts">
	import { range } from 'd3-array';
	import {
		Axis,
		Chart,
		ChartClipPath,
		Circle,
		Layer,
		Points,
		defaultChartPadding,
		type DomainType
	} from 'layerchart';
	import { cls } from '@layerstack/tailwind';

	const data = range(200).map((d) => {
		return { x: d, y: Math.random() };
	});
	export { data };

	// Committed domain — drives main chart's visible range
	let xDomain = $state<DomainType>([null, null]);
	let yDomain = $state<DomainType>([null, null]);

	// Live brush position — updates during drag for minimap display
	let brushX = $state<DomainType>([null, null]);
	let brushY = $state<DomainType>([null, null]);
</script>

<div class="relative">
	<Chart
		{data}
		x="x"
		{xDomain}
		y="y"
		{yDomain}
		yNice
		brush={{
			axis: 'both',
			onChange: (e) => {
				brushX = e.brush.x;
				brushY = e.brush.y;
			},
			onBrushEnd: (e) => {
				xDomain = e.brush.x;
				yDomain = e.brush.y;
				brushX = e.brush.x;
				brushY = e.brush.y;
				e.brush.reset();
			}
		}}
		padding={defaultChartPadding({ left: 20, bottom: 24 })}
		height={400}
	>
		<Layer>
			<Axis placement="left" grid rule />
			<Axis placement="bottom" rule />

			<ChartClipPath>
				<Points class="fill-primary/30 stroke-primary" r={4} />
			</ChartClipPath>
		</Layer>
	</Chart>

	<div class="absolute top-1 right-1 w-[25%] h-[25%] border rounded-sm bg-surface-100">
		<Chart
			{data}
			x="x"
			y="y"
			yNice
			brush={{
				axis: 'both',
				x: brushX as any,
				y: brushY as any,
				onChange: (e) => {
					xDomain = e.brush.x;
					yDomain = e.brush.y;
					brushX = e.brush.x;
					brushY = e.brush.y;
				}
			}}
		>
			<Layer>
				<Points>
					{#snippet children({ points })}
						{#each points as point}
							{@const isSelected =
								(xDomain?.[0] == null || xDomain?.[0] <= point.data.x) &&
								(xDomain?.[1] == null || point.data.x <= xDomain?.[1]) &&
								(yDomain?.[0] == null || yDomain?.[0] <= point.data.y) &&
								(yDomain?.[1] == null || point.data.y <= yDomain?.[1])}

							<Circle
								cx={point.x}
								cy={point.y}
								r={0.5}
								class={cls(
									isSelected
										? 'fill-primary/30 stroke-primary'
										: 'fill-surface-content/10 stroke-neutral'
								)}
								motion="spring"
							/>
						{/each}
					{/snippet}
				</Points>
			</Layer>
		</Chart>
	</div>
</div>
