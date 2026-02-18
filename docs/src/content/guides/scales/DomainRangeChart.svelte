<script lang="ts">
	import { Chart, Layer, Line, type ChartContextValue } from 'layerchart';
	import { scaleLinear } from 'd3-scale';
	import { AnimationFrames } from 'runed';
	import { Button, ButtonGroup } from 'svelte-ux';
	import { cls } from '@layerstack/tailwind';

	import ResizableRect from './ResizableRect.svelte';

	import LucidePlay from '~icons/lucide/play';
	import LucideSquare from '~icons/lucide/square';

	const rectHeight = 64;

	let {
		domain = $bindable([100, 400]),
		range = $bindable([0, 500]),
		value = $bindable(0),
		rangeValue = $bindable(0)
	}: {
		domain?: number[];
		range?: number[];
		value?: number;
		rangeValue?: number;
	} = $props();

	let scale = $derived(scaleLinear().domain(domain).range(range));

	const chartDomain = [0, 500];

	// Initialize domainValue and rangeValue if not provided
	$effect(() => {
		if (value === 0) {
			value = Math.round(domain[0] + (domain[1] - domain[0]) / 2);
		}
		if (rangeValue === 0) {
			rangeValue = Math.round(scale(value));
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
</script>

<div class="text-right">
	<ButtonGroup variant="fill-light" color="primary" size="sm" class="outline rounded-full">
		<Button
			icon={LucidePlay}
			on:click={() => (isPlaying = true)}
			disabled={isPlaying}
			classes={{ icon: 'text-xs', root: 'pl-2 pr-1 py-1' }}
		/>
		<Button
			icon={LucideSquare}
			on:click={() => (isPlaying = false)}
			disabled={!isPlaying}
			classes={{ icon: 'text-xs', root: 'pl-1 pr-2 py-1' }}
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
			<ResizableRect
				{context}
				bind:bounds={domain}
				bind:value
				bind:isHovering={isHoveringDomain}
				label="Domain"
				y={0}
				{chartDomain}
				onValueChange={(v) => {
					rangeValue = Math.round(scale(v));
				}}
			/>

			<ResizableRect
				{context}
				bind:bounds={range}
				bind:value={rangeValue}
				bind:isHovering={isHoveringRange}
				label="Range"
				y={context.height - 64}
				{chartDomain}
				onValueChange={(v) => {
					value = Math.round(scale.invert(v));
				}}
			/>
		</Layer>

		<Layer type="svg" pointerEvents={false}>
			<!-- Background grid lines -->
			{@const lineCount = 20}
			{#each Array.from({ length: lineCount }) as _, i}
				{@const t = i / (lineCount - 1)}
				{@const domainVal = domain[0] + (domain[1] - domain[0]) * t}
				{@const rangeVal = range[0] + (range[1] - range[0]) * t}
				<Line
					x1={context.xScale(domainVal)}
					y1={rectHeight}
					x2={context.xScale(rangeVal)}
					y2={context.height - rectHeight}
					strokeWidth={2}
					class={cls(
						'',
						i === 0 || i === lineCount - 1
							? 'stroke-surface-content/20'
							: 'stroke-surface-content/10 '
					)}
				/>
			{/each}

			<!-- Current value line -->
			<Line
				x1={context.xScale(value)}
				y1={rectHeight}
				x2={context.xScale(rangeValue)}
				y2={context.height - rectHeight}
				strokeWidth={2}
				class="stroke-surface-content"
				markerEnd="triangle"
			/>
		</Layer>
	{/snippet}
</Chart>
