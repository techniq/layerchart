<script lang="ts">
	import { scaleTime } from 'd3-scale';
	import { curveLinear, curveStepAfter, curveBumpX, curveMonotoneX } from 'd3-shape';
	import { format } from 'date-fns';
	import { Field } from 'svelte-ux';
	import { formatDate, PeriodType } from 'svelte-ux/utils/date';

	import Chart, { Svg } from '$lib/components/Chart.svelte';
	import Area from '$lib/components/Area.svelte';
	import AxisX from '$lib/components/AxisX.svelte';
	import AxisY from '$lib/components/AxisY.svelte';
	import Baseline from '$lib/components/Baseline.svelte';
	import HighlightRect from '$lib/components/HighlightRect.svelte';
	import Labels from '$lib/components/Labels.svelte';
	import Path from '$lib/components/Path.svelte';
	import Threshold from '$lib/components/Threshold.svelte';
	import Tooltip from '$lib/components/Tooltip.svelte';
	import TooltipItem from '$lib/components/TooltipItem.svelte';
	import TooltipSeparator from '$lib/components/TooltipSeparator.svelte';

	import Preview from '$lib/docs/Preview.svelte';
	import { createDateSeries } from '$lib/utils/genData';

	let selectedCurve = curveLinear;

	const data = createDateSeries({
		min: 50,
		max: 100,
		value: 'integer',
		keys: ['value', 'baseline']
	});
</script>

<Field label="Curve" let:id>
	<select bind:value={selectedCurve} class="text-sm w-full outline-none cursor-pointer" {id}>
		<option value={curveLinear}>curveLinear</option>
		<option value={curveStepAfter}>curveStepAfter</option>
		<option value={curveBumpX}>curveBumpX</option>
		<option value={curveMonotoneX}>curveMonotoneX</option>
	</select>
</Field>

<h1>Examples</h1>

<h2>Basic</h2>

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
					<g slot="pathAbove" let:areaPathData let:clipPath let:linePathData>
						<Path pathData={linePathData} color="black" width="1.5" />
						<Area pathData={areaPathData} {clipPath} class="fill-green-500" />
					</g>
					<g slot="pathBelow" let:areaPathData let:clipPath let:linePathData>
						<Path pathData={linePathData} color="black" width="1" stroke-dasharray="4" />
						<Area pathData={areaPathData} {clipPath} class="fill-red-500" />
					</g>
				</Threshold>
			</Svg>
		</Chart>
	</div>
</Preview>

<h2>With Tooltip and HighlightRect</h2>

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
			tooltip={{ findTooltipData: 'left' }}
		>
			<Svg>
				<AxisY gridlines />
				<AxisX formatTick={(d) => formatDate(d, PeriodType.Day, 'short')} />
				<Baseline x y />
				<Threshold curve={curveStepAfter}>
					<g slot="pathAbove" let:areaPathData let:clipPath let:linePathData>
						<Path pathData={linePathData} color="black" width="1.5" />
						<Area pathData={areaPathData} {clipPath} class="fill-green-500" />
					</g>
					<g slot="pathBelow" let:areaPathData let:clipPath let:linePathData>
						<Path pathData={linePathData} color="black" width="1" stroke-dasharray="4" />
						<Area pathData={areaPathData} {clipPath} class="fill-red-500" />
					</g>
				</Threshold>
				<HighlightRect />
			</Svg>
			<Tooltip header={(data) => format(data.date, 'eee, MMMM do')} let:data>
				<TooltipItem label="value" value={data.value} />
				<TooltipItem label="baseline" value={data.baseline} />
				<TooltipSeparator />
				<TooltipItem label="variance" value={data.value - data.baseline} />
			</Tooltip>
		</Chart>
	</div>
</Preview>

<h2>With Labels</h2>

<h3>TODO: Show label for both value and baseline (above and below)</h3>

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
					<g slot="pathAbove" let:areaPathData let:clipPath let:linePathData>
						<Path pathData={linePathData} color="black" width="1.5" />
						<Area pathData={areaPathData} {clipPath} class="fill-green-500" />
					</g>
					<g slot="pathBelow" let:areaPathData let:clipPath let:linePathData>
						<Path pathData={linePathData} color="black" width="1" stroke-dasharray="4" />
						<Area pathData={areaPathData} {clipPath} class="fill-red-500" />
					</g>
				</Threshold>
				<Labels format="integer" />
			</Svg>
		</Chart>
	</div>
</Preview>
