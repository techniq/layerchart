<script lang="ts">
	import { Chart, Layer, Line, Rect, Text, type ChartContextValue } from 'layerchart';
	import { movable } from '$lib/attachments/movable';
	import { localPoint } from '@layerstack/utils';
	import { scaleLinear } from 'd3-scale';
	import { AnimationFrames } from 'runed';
	import { Button, ButtonGroup } from 'svelte-ux';

	import LucideGripVertical from '~icons/lucide/grip-vertical';
	import LucidePlay from '~icons/lucide/play';
	import LucideSquare from '~icons/lucide/square';

	const rectHeight = 64;
	const handleWidth = 16;

	let {
		domain = $bindable([100, 400]),
		range = $bindable([0, 500]),
		value = $bindable(),
		rangeValue = $bindable()
	}: {
		domain?: number[];
		range?: number[];
		value?: number;
		rangeValue?: number;
	} = $props();

	let scale = $derived(scaleLinear().domain(domain).range(range));

	const chartDomain = [0, 500];

	let midDomain = $derived(Math.round(domain[0] + (domain[1] - domain[0]) / 2));
	let midRange = $derived(Math.round(range[0] + (range[1] - range[0]) / 2));

	// Initialize domainValue and rangeValue if not provided
	$effect(() => {
		if (value === undefined) {
			value = midDomain;
		}
		if (rangeValue === undefined) {
			rangeValue = Math.round(scale(midDomain));
		}
	});

	// Track hover state for domain and range rects
	let isHoveringDomain = $state(false);
	let isHoveringRange = $state(false);

	// Animation state
	let isPlaying = $state(true);
	let animationDirection = $state<'forward' | 'backward'>('forward');
	const animationSpeed = 1; // whole integers per step

	const animationFrames = new AnimationFrames(
		() => {
			if (isPlaying && !isHoveringDomain && !isHoveringRange) {
				if (animationDirection === 'forward') {
					value = Math.min(Math.round(value! + animationSpeed), domain[1]);
					if (value >= domain[1]) {
						animationDirection = 'backward';
					}
				} else {
					value = Math.max(Math.round(value! - animationSpeed), domain[0]);
					if (value <= domain[0]) {
						animationDirection = 'forward';
					}
				}
				rangeValue = Math.round(scale(value));
			}
		},
		{ fpsLimit: 60 }
	);

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

<div class="text-right">
	<ButtonGroup variant="fill-light" color="primary" size="sm" class="outline rounded-full">
		<Button
			icon={LucidePlay}
			on:click={() => (isPlaying = true)}
			disabled={isPlaying}
			classes={{ icon: 'text-xs', root: 'px-2 py-1' }}
		/>
		<Button
			icon={LucideSquare}
			on:click={() => (isPlaying = false)}
			disabled={!isPlaying}
			classes={{ icon: 'text-xs', root: 'px-2 py-1' }}
		/>
	</ButtonGroup>
</div>

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
				onpointerenter={() => {
					isHoveringDomain = true;
				}}
				onpointerleave={() => {
					isHoveringDomain = false;
				}}
				onpointermove={(e) => {
					const { x } = localPoint(e);
					value = Math.round(domainScale(x));
					rangeValue = Math.round(scale(value));
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
				{value}
				x={context.xScale(value)}
				y={rectHeight}
				dy={-3}
				textAnchor="middle"
				verticalAnchor="end"
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
				onpointerenter={() => {
					isHoveringRange = true;
				}}
				onpointerleave={() => {
					isHoveringRange = false;
				}}
				onpointermove={(e) => {
					const { x } = localPoint(e);
					rangeValue = Math.round(rangeScale(x));
					value = Math.round(scale.invert(rangeValue));
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
				dy={3}
				textAnchor="middle"
				verticalAnchor="start"
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
				x1={context.xScale(value)}
				y1={rectHeight}
				x2={context.xScale(rangeValue)}
				y2={context.height - rectHeight}
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
