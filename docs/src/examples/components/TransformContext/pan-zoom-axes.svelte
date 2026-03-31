<script lang="ts">
	import { Chart, Layer, Axis, Rect, LinearGradient, ChartClipPath } from 'layerchart';
	import { interpolateSpectral } from 'd3-scale-chromatic';
	import { quantize } from 'd3-interpolate';
	import { cubicOut } from 'svelte/easing';
	import TransformControls from '$lib/components/controls/TransformContextControls.svelte';

	const domainSize = 500;
	const stops = quantize((t) => interpolateSpectral(1 - t), 9);

	const data = [
		{ x: 0, y: 0 },
		{ x: domainSize, y: domainSize }
	];

	export { data };
</script>

<Chart
	{data}
	x="x"
	y="y"
	xDomain={[0, domainSize]}
	yDomain={[domainSize, 0]}
	transform={{
		mode: 'domain',
		scaleExtent: [1, 40],
		domainExtent: {
			x: { min: -100, max: domainSize + 100 },
			y: { min: -100, max: domainSize + 100 }
		},
		motion: { type: 'spring' }
	}}
	height={500}
	clip
>
	{#snippet children({ context })}
		<TransformControls />

		<Layer>
			<LinearGradient x1="0%" y1="0%" x2="100%" y2="100%" {stops}>
				{#snippet children({ gradient })}
					<Rect
						x={context.xScale(0)}
						y={context.yScale(0)}
						width={context.xScale(domainSize) - context.xScale(0)}
						height={context.yScale(domainSize) - context.yScale(0)}
						fill={gradient}
					/>
				{/snippet}
			</LinearGradient>

			<Axis
				placement="top"
				grid={{ class: 'mix-blend-difference' }}
				rule={false}
				tickMarks={false}
				tickLabelProps={{ verticalAnchor: 'start', dy: 4, class: 'text-current' }}
			/>
			<Axis
				placement="left"
				grid={{ class: 'mix-blend-difference' }}
				rule={false}
				tickMarks={false}
				tickLabelProps={{ textAnchor: 'start', dx: 4, class: 'text-current' }}
			/>
		</Layer>
	{/snippet}
</Chart>
