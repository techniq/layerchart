<script lang="ts">
	import { Rect, Text, type ChartContextValue } from 'layerchart';
	import { movable } from '$lib/attachments/movable';
	import { scaleLinear } from 'd3-scale';

	import LucideGripVertical from '~icons/lucide/grip-vertical';

	const rectHeight = 64;
	const handleWidth = 16;

	let {
		context,
		bounds = $bindable(),
		value = $bindable(0),
		label,
		y,
		chartDomain,
		isHovering = $bindable(false),
		onValueChange
	}: {
		context: ChartContextValue;
		bounds: number[];
		value?: number;
		label: string;
		y: number;
		chartDomain: number[];
		isHovering?: boolean;
		onValueChange?: (value: number) => void;
	} = $props();

	let midBounds = $derived(Math.round(bounds[0] + (bounds[1] - bounds[0]) / 2));

	// Map rect width to bounds values
	let boundsScale = $derived(
		scaleLinear()
			.domain([0, context ? context.xScale(bounds[1]) - context.xScale(bounds[0]) : 0])
			.range(bounds)
	);

	function handlePointerMove(e: PointerEvent, isRightHandle = false) {
		let offsetValue: number;
		if (isRightHandle) {
			const rectWidth = context.xScale(bounds[1]) - context.xScale(bounds[0]);
			offsetValue = Math.round(boundsScale(rectWidth - handleWidth + e.offsetX));
		} else {
			offsetValue = Math.round(boundsScale(e.offsetX));
		}
		value = offsetValue;
		onValueChange?.(offsetValue);
	}
</script>

<!-- Main Rect -->
<Rect
	x={context.xScale(bounds[0])}
	{y}
	width={context.xScale(bounds[1]) - context.xScale(bounds[0])}
	height={rectHeight}
	class="bg-primary/10 border-2 border-primary/70 rounded-lg grid items-center"
	onpointerenter={() => {
		isHovering = true;
	}}
	onpointerleave={() => {
		isHovering = false;
	}}
	onpointermove={(e) => handlePointerMove(e)}
/>

<!-- Left handle -->
<Rect
	x={context.xScale(bounds[0])}
	{y}
	width={handleWidth}
	height={rectHeight}
	rx={2}
	class="bg-primary/20 hover:bg-primary/30 cursor-ew-resize flex items-center justify-center pl-0.5"
	onpointerenter={() => {
		isHovering = true;
	}}
	onpointerleave={() => {
		isHovering = false;
	}}
	onpointermove={(e) => handlePointerMove(e)}
	{@attach movable({
		onMove: ({ dx }) => {
			// @ts-expect-error
			const newLow = context.xScale.invert(context.xScale(bounds[0]) + dx);
			if (newLow >= 0 && newLow < bounds[1]) {
				bounds = [Math.round(newLow), bounds[1]];
			}
		}
	})}
>
	<LucideGripVertical class="text-primary/50" />
</Rect>

<!-- Right handle -->
<Rect
	x={context.xScale(bounds[1]) - handleWidth}
	{y}
	width={handleWidth}
	height={rectHeight}
	rx={2}
	class="bg-primary/20 hover:bg-primary/30 cursor-ew-resize flex items-center justify-center pr-0.5"
	onpointerenter={() => {
		isHovering = true;
	}}
	onpointerleave={() => {
		isHovering = false;
	}}
	onpointermove={(e) => handlePointerMove(e, true)}
	{@attach movable({
		onMove: ({ dx }) => {
			// @ts-expect-error
			const newHigh = context.xScale.invert(context.xScale(bounds[1]) + dx);
			if (newHigh <= chartDomain[1] && newHigh > bounds[0]) {
				bounds = [bounds[0], Math.round(newHigh)];
			}
		}
	})}
>
	<LucideGripVertical class="text-primary/50" />
</Rect>

<!-- Left bound text -->
<Text
	value={bounds[0]}
	x={context.xScale(bounds[0])}
	dx={handleWidth + 2}
	y={y + rectHeight / 2}
	textAnchor="start"
	verticalAnchor="middle"
	class="text-sm text-primary pointer-events-none"
/>

<!-- Label text -->
<Text
	value={label}
	x={context.xScale(midBounds)}
	y={y + rectHeight / 2}
	textAnchor="middle"
	verticalAnchor="middle"
	class="text-primary font-semibold pointer-events-none"
/>

<!-- Current value text -->
<Text
	{value}
	x={context.xScale(value)}
	y={y + (label === 'Domain' ? rectHeight : 0)}
	dy={label === 'Domain' ? -3 : 3}
	textAnchor="middle"
	verticalAnchor={label === 'Domain' ? 'end' : 'start'}
	class="text-sm text-white bg-primary rounded-full px-2 font-medium pointer-events-none"
/>

<!-- Right bound text -->
<Text
	value={bounds[1]}
	x={context.xScale(bounds[1])}
	dx={-handleWidth - 2}
	y={y + rectHeight / 2}
	textAnchor="end"
	verticalAnchor="middle"
	class="text-sm text-primary pointer-events-none"
/>
