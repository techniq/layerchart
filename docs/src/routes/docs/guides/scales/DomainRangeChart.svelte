<script lang="ts">
	import { Chart, Layer, Line, Rect, Text, type ChartContextValue } from 'layerchart';
	import { movable } from '$lib/attachments/movable';
	import { localPoint } from '@layerstack/utils';
	import { scaleLinear } from 'd3-scale';

	import LucideGripVertical from '~icons/lucide/grip-vertical';

	const rectHeight = 64;
	const handleWidth = 16;

	let domain = $state([100, 400]);
	let range = $state([0, 500]);
	let scale = $derived(scaleLinear().domain(domain).range(range));

	const chartDomain = [0, 500];

	let midDomain = $derived(Math.round(domain[0] + (domain[1] - domain[0]) / 2));
	let midRange = $derived(Math.round(range[0] + (range[1] - range[0]) / 2));

	let domainValue = $derived(midDomain);
	let rangeValue = $derived(Math.round(scale(midDomain)));

	let context = $state<ChartContextValue>(null!);

	// Map domain rect width to domain values
	let domainScale = $derived(
		scaleLinear()
			.domain([0, context ? context.xScale(domain[1]) - context.xScale(domain[0]) : 0])
			.range(domain)
	);
	// Map range rect width to range values
	let rangeScale = $derived(
		scaleLinear()
			.domain([0, context ? context.xScale(range[1]) - context.xScale(range[0]) : 0])
			.range(range)
	);
</script>

<Chart
	xDomain={chartDomain}
	height={250}
	padding={{ top: 16, right: 16, bottom: 16, left: 16 }}
	class="select-none"
	bind:context
>
	{#snippet children({ context })}
		<Layer type="html">
			<!-- Domain -->
			<Rect
				x={context.xScale(domain[0])}
				y={0}
				width={context.xScale(domain[1]) - context.xScale(domain[0])}
				height={rectHeight}
				class="bg-primary/10 border-2 border-primary/70 rounded-lg grid items-center"
				onpointermove={(e) => {
					const { x } = localPoint(e);
					domainValue = Math.round(domainScale(x));
					rangeValue = Math.round(scale(domainValue));
				}}
			/>
			<!-- Left handle -->
			<Rect
				x={context.xScale(domain[0])}
				y={0}
				width={handleWidth}
				height={rectHeight}
				rx={2}
				class="bg-primary/20 hover:bg-primary/30 cursor-ew-resize flex items-center justify-center pl-0.5"
				{@attach movable({
					onMove: ({ dx }) => {
						// @ts-expect-error
						const newLow = context.xScale.invert(context.xScale(domain[0]) + dx);
						if (newLow >= 0 && newLow < domain[1]) {
							domain = [Math.round(newLow), domain[1]];
						}
					}
				})}
			>
				<LucideGripVertical class="text-primary/50" />
			</Rect>

			<!-- Right handle -->
			<Rect
				x={context.xScale(domain[1]) - handleWidth}
				y={0}
				width={handleWidth}
				height={rectHeight}
				rx={2}
				class="bg-primary/20 hover:bg-primary/30 cursor-ew-resize flex items-center justify-center pr-0.5"
				{@attach movable({
					onMove: ({ dx }) => {
						// @ts-expect-error
						const newHigh = context.xScale.invert(context.xScale(domain[1]) + dx);
						if (newHigh <= chartDomain[1] && newHigh > domain[0]) {
							domain = [domain[0], Math.round(newHigh)];
						}
					}
				})}
			>
				<LucideGripVertical class="text-primary/50" />
			</Rect>
			<Text
				value={domain[0]}
				x={context.xScale(domain[0])}
				dx={handleWidth + 2}
				y={rectHeight / 2}
				textAnchor="start"
				verticalAnchor="middle"
				class="text-sm text-primary pointer-events-none"
			/>
			<Text
				value="Domain"
				x={context.xScale(midDomain)}
				y={rectHeight / 2}
				textAnchor="middle"
				verticalAnchor="middle"
				class="text-primary font-semibold pointer-events-none"
			/>
			<Text
				value={domainValue}
				x={context.xScale(domainValue)}
				y={rectHeight}
				textAnchor="middle"
				verticalAnchor="middle"
				class="text-sm text-white bg-primary rounded-full px-2 font-medium pointer-events-none"
			/>
			<Text
				value={domain[1]}
				x={context.xScale(domain[1])}
				dx={-handleWidth - 2}
				y={rectHeight / 2}
				textAnchor="end"
				verticalAnchor="middle"
				class="text-sm text-primary pointer-events-none"
			/>

			<!-- Range -->
			<Rect
				x={context.xScale(range[0])}
				y={context.height - rectHeight}
				width={context.xScale(range[1]) - context.xScale(range[0])}
				height={rectHeight}
				rx={8}
				class="bg-primary/10 border-2 border-primary/70 rounded-lg"
				onpointermove={(e) => {
					const { x } = localPoint(e);
					rangeValue = Math.round(rangeScale(x));
					domainValue = Math.round(scale.invert(rangeValue));
				}}
			/>
			<!-- Left handle -->
			<Rect
				x={context.xScale(range[0])}
				y={context.height - rectHeight}
				width={handleWidth}
				height={rectHeight}
				rx={2}
				class="bg-primary/20 hover:bg-primary/30 cursor-ew-resize flex items-center justify-center pl-0.5"
				{@attach movable({
					onMove: ({ dx }) => {
						// @ts-expect-error
						const newLow = context.xScale.invert(context.xScale(range[0]) + dx);
						if (newLow >= 0 && newLow < range[1]) {
							range = [Math.round(newLow), range[1]];
						}
					}
				})}
			>
				<LucideGripVertical class="text-primary/50" />
			</Rect>
			<!-- Right handle -->
			<Rect
				x={context.xScale(range[1]) - handleWidth}
				y={context.height - rectHeight}
				width={handleWidth}
				height={rectHeight}
				rx={2}
				class="bg-primary/20 hover:bg-primary/30 cursor-ew-resize flex items-center justify-center pr-0.5"
				{@attach movable({
					onMove: ({ dx }) => {
						// @ts-expect-error
						const newHigh = context.xScale.invert(context.xScale(range[1]) + dx);
						if (newHigh <= chartDomain[1] && newHigh > range[0]) {
							range = [range[0], Math.round(newHigh)];
						}
					}
				})}
			>
				<LucideGripVertical class="text-primary/50" />
			</Rect>
			<Text
				value={range[0]}
				x={context.xScale(range[0])}
				dx={handleWidth + 2}
				y={context.height - rectHeight / 2}
				textAnchor="start"
				verticalAnchor="middle"
				class="text-sm text-primary pointer-events-none"
			/>
			<Text
				value="Range"
				x={context.xScale(midRange)}
				y={context.height - rectHeight / 2}
				textAnchor="middle"
				verticalAnchor="middle"
				class="text-primary font-semibold pointer-events-none"
			/>
			<Text
				value={rangeValue}
				x={context.xScale(rangeValue)}
				y={context.height - rectHeight}
				textAnchor="middle"
				verticalAnchor="middle"
				class="text-sm text-white bg-primary rounded-full px-2 font-medium pointer-events-none"
			/>
			<Text
				value={range[1]}
				x={context.xScale(range[1])}
				dx={-handleWidth - 2}
				y={context.height - rectHeight / 2}
				textAnchor="end"
				verticalAnchor="middle"
				class="text-sm text-primary pointer-events-none"
			/>
		</Layer>

		<Layer type="svg" pointerEvents={false}>
			<!-- left line -->
			<Line
				x1={context.xScale(domain[0])}
				y1={rectHeight}
				x2={context.xScale(range[0])}
				y2={context.height - rectHeight}
				strokeWidth={2}
				class="stroke-surface-content/20 [stroke-dasharray:2]"
			/>

			<!-- mid line -->
			<Line
				x1={context.xScale(domainValue)}
				y1={rectHeight + 10}
				x2={context.xScale(rangeValue)}
				y2={context.height - rectHeight - 11}
				strokeWidth={2}
				class="stroke-surface-content"
				markerEnd="triangle"
			/>

			<!-- right line -->
			<Line
				x1={context.xScale(domain[1])}
				y1={rectHeight}
				x2={context.xScale(range[1])}
				y2={context.height - rectHeight}
				strokeWidth={2}
				class="stroke-surface-content/20 [stroke-dasharray:2]"
			/>
		</Layer>
	{/snippet}
</Chart>
