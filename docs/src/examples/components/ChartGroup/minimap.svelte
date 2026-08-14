<script lang="ts">
	import { range } from 'd3-array';
	import {
		Axis,
		Chart,
		ChartClipPath,
		ChartGroup,
		Circle,
		Layer,
		Points,
		defaultChartPadding
	} from 'layerchart';
	import { cls } from '@layerstack/tailwind';

	const data = range(200).map((d) => ({ x: d, y: Math.random() }));
	export { data };
</script>

<!--
	Both charts are brushable and share one visible domain.  The detail chart zooms to its own
	selection (`zoomOnBrush`), and the overview publishes its selection as the group's domain
	instead — zooming the others without zooming itself.  The most recent brush wins.
-->
<ChartGroup domain={{ axis: 'both' }}>
	{#snippet children({ group })}
		<!--
			What the overview's rectangle shows: the selection while one is being dragged anywhere in
			the group, otherwise the committed domain.  `[null, null]` rather than `undefined` is what
			clears a controlled brush — `undefined` means "uncontrolled", so the rectangle would stick.
		-->
		{@const viewport = group.brush.active ? group.brush : group.domain}
		{@const viewportX = (viewport.x ?? [null, null]) as any}
		{@const viewportY = (viewport.y ?? [null, null]) as any}

		<div class="relative">
			<Chart
				{data}
				x="x"
				y="y"
				yNice
				brush={{ axis: 'both', zoomOnBrush: true }}
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
					brush={{ axis: 'both', x: viewportX, y: viewportY }}
					groupOptions={{ publish: ['domain'], subscribe: ['pointer'] }}
				>
					{#snippet children({ context })}
						<Layer>
							<Points>
								{#snippet children({ points })}
									{#each points as point}
										{@const isSelected = context.brush.contains(point.data)}

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
					{/snippet}
				</Chart>
			</div>
		</div>
	{/snippet}
</ChartGroup>
