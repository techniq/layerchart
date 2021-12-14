---
title: ['Charts', 'Threshold']
---

<script lang="ts">
	import { scaleTime } from 'd3-scale';
	import { curveLinear, curveStepAfter, curveBumpX, curveMonotoneX } from 'd3-shape';
	import { format } from 'date-fns';
	import { formatDate, PeriodType } from 'svelte-ux/utils/date';
	import { formatNumberAsStyle } from 'svelte-ux/utils/number';

	import Chart, { Svg } from '$lib/components/Chart.svelte';
	import Area from '$lib/components/Area.svelte';
	import AxisX from '$lib/components/AxisX.svelte';
	import AxisY from '$lib/components/AxisY.svelte';
	import Baseline from '$lib/components/Baseline.svelte';
	import HighlightBar from '$lib/components/HighlightBar.svelte';
	import HighlightLine from '$lib/components/HighlightLine.svelte';
	import Labels from '$lib/components/Labels.svelte';
	import Path from '$lib/components/Path.svelte';
	import Threshold from '$lib/components/Threshold.svelte';
	import Tooltip from '$lib/components/Tooltip.svelte';

	import Preview from '$lib/docs/Preview.svelte';
	import { createDateSeries } from '$lib/utils/genData';

	let selectedCurve = curveLinear;

	const data = createDateSeries({ min: 50, max: 100, value: 'integer', keys: ['value', 'baseline'] });
</script>

<select bind:value={selectedCurve}>
  <option value={curveLinear}>curveLinear</option>
  <option value={curveStepAfter}>curveStepAfter</option>
  <option value={curveBumpX}>curveBumpX</option>
  <option value={curveMonotoneX}>curveMonotoneX</option>
</select>

## Basic

<Preview>
	<div class="h-[300px] p-4 border rounded">
		<Chart
			{data}
			x="date"
			xScale={scaleTime()}
			y={['value', 'baseline']}
			yDomain={[0, null]}
			yNice
			padding={{ left: 16, bottom: 24 }}
		>
			<Svg>
				<AxisY gridlines />
				<AxisX formatTick={(d) => formatDate(d, PeriodType.Day, 'short')} />
				<Baseline x y />
				<Threshold curve={selectedCurve}>
					<g
						slot="pathAbove"
						let:areaPathData
						let:clipPath
						let:linePathData
					>
						<Path pathData={linePathData} color="black" width="1.5" />
						<Area
							pathData={areaPathData}
							{clipPath}
							color="var(--color-green-500)"
						/>
					</g>
					<g
						slot="pathBelow"
						let:areaPathData
						let:clipPath
						let:linePathData
					>
						<Path
							pathData={linePathData}
							color="black"
							width="1"
							stroke-dasharray="4"
						/>
						<Area
							pathData={areaPathData}
							{clipPath}
							color="var(--color-red-500)"
						/>
					</g>
				</Threshold>
			</Svg>
		</Chart>
	</div>
</Preview>

## With Tooltip and HighlightBar

<Preview>
	<div class="h-[300px] p-4 border rounded">
		<Chart
			{data}
			x="date"
			xScale={scaleTime()}
			y={['value', 'baseline']}
			yDomain={[0, null]}
			yNice
			padding={{ left: 16, bottom: 24 }}
		>
			<Svg>
				<AxisY gridlines />
				<AxisX formatTick={(d) => formatDate(d, PeriodType.Day, 'short')} />
				<Baseline x y />
				<Threshold curve={curveStepAfter}>
					<g
						slot="pathAbove"
						let:areaPathData
						let:clipPath
						let:linePathData
					>
						<Path pathData={linePathData} color="black" width="1.5" />
						<Area
							pathData={areaPathData}
							{clipPath}
							color="var(--color-green-500)"
						/>
					</g>
					<g
						slot="pathBelow"
						let:areaPathData
						let:clipPath
						let:linePathData
					>
						<Path
							pathData={linePathData}
							color="black"
							width="1"
							stroke-dasharray="4"
						/>
						<Area
							pathData={areaPathData}
							{clipPath}
							color="var(--color-red-500)"
						/>
					</g>
				</Threshold>
			</Svg>
			<Tooltip findTooltipData="left" let:data>
				<div class="tooltip">
					<div class="tooltip-header">
						{format(data.date, 'eee, MMMM do')}
					</div>
					<div class="grid grid-cols-[1fr,auto] gap-x-2 gap-y-1 items-center">
						<div class="tooltip-label">value:</div>
						<div class="tooltip-value">
							{formatNumberAsStyle(data.value, 'integer')}
						</div>
						<div class="tooltip-label">baseline:</div>
						<div class="tooltip-value">
							{formatNumberAsStyle(data.baseline, 'integer')}
						</div>
					</div>
				</div>
				<g slot="highlight">
					<HighlightBar {data} />
				</g>
			</Tooltip>
		</Chart>
	</div>
</Preview>

## With Labels

### TODO: Show label for both value and baseline (above and below)

<Preview>
	<div class="h-[300px] p-4 border rounded">
		<Chart
			{data}
			x="date"
			xScale={scaleTime()}
			y={['value', 'baseline']}
			yDomain={[0, null]}
			yNice
			padding={{ left: 16, bottom: 24 }}
		>
			<Svg>
				<AxisY gridlines />
				<AxisX formatTick={(d) => formatDate(d, PeriodType.Day, 'short')} />
				<Baseline x y />
				<Threshold>
					<g
						slot="pathAbove"
						let:areaPathData
						let:clipPath
						let:linePathData
					>
						<Path pathData={linePathData} color="black" width="1.5" />
						<Area
							pathData={areaPathData}
							{clipPath}
							color="var(--color-green-500)"
						/>
					</g>
					<g
						slot="pathBelow"
						let:areaPathData
						let:clipPath
						let:linePathData
					>
						<Path
							pathData={linePathData}
							color="black"
							width="1"
							stroke-dasharray="4"
						/>
						<Area
							pathData={areaPathData}
							{clipPath}
							color="var(--color-red-500)"
						/>
					</g>
				</Threshold>
				<Labels formatStyle="integer" />
			</Svg>
		</Chart>
	</div>
</Preview>

<style lang="postcss">
	.tooltip {
		@apply bg-gray-900/90 backdrop-filter backdrop-blur-[2px] text-white rounded elevation-1 px-2 py-1;
	}
	.tooltip-header {
		@apply text-center font-semibold pb-1 whitespace-nowrap;
	}
	.tooltip-label {
		@apply text-xs text-white/75 text-right whitespace-nowrap;
	}
	.tooltip-value {
		@apply text-sm text-right;
	}
	.tooltip-separator {
		@apply rounded bg-white/50 my-1;
		grid-column: 1 / -1;
		height: 2px;
	}
</style>
