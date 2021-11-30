---
title: ['Chart', 'Bar']
---

<script lang="ts">
	import { flatGroup, sum, extent } from 'd3-array';
	import { scaleBand, scaleOrdinal } from 'd3-scale';
	import { stack } from 'd3-shape';
	import { format } from 'date-fns';
	import { formatDate, PeriodType } from 'svelte-ux/utils/date';
	import { formatNumberAsStyle } from 'svelte-ux/utils/number';

	import Chart, { Svg } from '$lib/components/Chart.svelte';
	import AxisX from '$lib/components/AxisX.svelte';
	import AxisY from '$lib/components/AxisY.svelte';
	import Baseline from '$lib/components/Baseline.svelte';
	import Bar from '$lib/components/Bar.svelte';
	import HighlightBar from '$lib/components/HighlightBar.svelte';
	import Label from '$lib/components/Label.svelte';
	import Tooltip from '$lib/components/Tooltip.svelte';

	import Preview from '$lib/docs/Preview.svelte';

	import { longData as data } from '$lib/utils/genData';
	import { pivotWider } from '$lib/utils/pivot';
	import { createStackData } from '$lib/utils/stack';

	const xKey = "year";
	const groupBy = null;
	const stackBy = 'fruit';
	const offset = null;

	const colorBy = 'fruit'
	$: colorKeys = [...new Set(data.map(x => x[colorBy]))]
	const keyColors = ['var(--color-blue-500)', 'var(--color-green-500)', 'var(--color-purple-500)', 'var(--color-orange-500)'];

	$: chartData = createStackData(data, { xKey, groupBy, stackBy })

	$: extents = {
		y: extent(chartData.flatMap(d => d.values))
	}
</script>

## Basic

<Preview>
	<div class="h-[300px] p-4 border rounded">
		<Chart
			data={chartData}
			flatData={data}
			{extents}
			x={xKey}
			xScale={scaleBand().paddingInner(0.4).paddingOuter(0.1)}
			xDomain={data.map(d => d[xKey])}
			y="values"
			yNice
			r={d => d}
			rScale={scaleOrdinal()}
			rDomain={colorKeys}
			rRange={keyColors}
			padding={{ left: 16, bottom: 24 }}
		>
			<Svg>
				<AxisY gridlines />
				<AxisX />
				<Baseline x y />
				<Bar {groupBy} getKey={item => item.keys.join('-')} radius={4} strokeWidth={1} />
			</Svg>
		</Chart>
	</div>
</Preview>
