---
title: ['Charts', 'Pie']
---

<script lang="ts">
	import { scaleOrdinal } from 'd3-scale';
	import { format } from 'date-fns';
	import { formatDate, PeriodType } from 'svelte-ux/utils/date';
	import { formatNumberAsStyle } from 'svelte-ux/utils/number';

	import Chart, { Svg } from '$lib/components/Chart.svelte';
	import Arc from '$lib/components/Arc.svelte';
	import Pie from '$lib/components/Pie.svelte';

	import Preview from '$lib/docs/Preview.svelte';
	import { createDateSeries } from '$lib/utils/genData';


	const data = createDateSeries({ min: 20, max: 100, value: 'integer', count: 4 });
	const data2 = createDateSeries({ min: 20, max: 100, value: 'integer', count: 4 });

	const colorKeys = [...new Set(data.map(d => d.date))]
	const keyColors = ['var(--color-blue-500)', 'var(--color-green-500)', 'var(--color-purple-500)', 'var(--color-orange-500)'];
</script>

## Basic

<Preview>
	<div class="h-[300px] p-4 border rounded">
		<Chart
			{data}
			x="value"
			r={d => d.date}
			rScale={scaleOrdinal()}
			rDomain={colorKeys}
			rRange={keyColors}
		>
			<Svg>
				<Pie />
			</Svg>
		</Chart>
	</div>
</Preview>

## Partial range (Chart xRange)

<Preview>
	<div class="h-[300px] p-4 border rounded">
		<Chart
			{data}
			x="value"
			xRange={[-90, 90]}
			r={d => d.date}
			rScale={scaleOrdinal()}
			rDomain={colorKeys}
			rRange={keyColors}
		>
			<Svg>
				<Pie />
			</Svg>
		</Chart>
	</div>
</Preview>

## Partial range (range prop)

<Preview>
	<div class="h-[300px] p-4 border rounded">
		<Chart 
			{data}
			x="value"
			r={d => d.date}
			rScale={scaleOrdinal()}
			rDomain={colorKeys}
			rRange={keyColors}
		>
			<Svg>
				<Pie range={[-90, 90]} color="var(--color-blue-500)" />
			</Svg>
		</Chart>
	</div>
</Preview>

## Pad angle

<Preview>
	<div class="h-[300px] p-4 border rounded">
		<Chart
			{data}
			x="value"
			r={d => d.date}
			rScale={scaleOrdinal()}
			rDomain={colorKeys}
			rRange={keyColors}
		>
			<Svg>
				<Pie padAngle={0.05} />
			</Svg>
		</Chart>
	</div>
</Preview>

## Pad angle

<Preview>
	<div class="h-[300px] p-4 border rounded">
		<Chart
			{data}
			x="value"
			r={d => d.date}
			rScale={scaleOrdinal()}
			rDomain={colorKeys}
			rRange={keyColors}
		>
			<Svg>
				<Pie innerRadius={100} padAngle={0.03} />
			</Svg>
		</Chart>
	</div>
</Preview>

## Inner radius

### If value >= 1, value will be treated as discrete

<Preview>
	<div class="h-[300px] p-4 border rounded">
		<Chart
			{data}
			x="value"
			r={d => d.date}
			rScale={scaleOrdinal()}
			rDomain={colorKeys}
			rRange={keyColors}
		>
			<Svg>
				<Pie innerRadius={100} />
			</Svg>
		</Chart>
	</div>
</Preview>

### If value >= 0 and less than 1, value will be treated as a percentage of outerRadius

<Preview>
	<div class="h-[300px] p-4 border rounded">
		<Chart
			{data}
			x="value"
			r={d => d.date}
			rScale={scaleOrdinal()}
			rDomain={colorKeys}
			rRange={keyColors}
		>
			<Svg>
				<Pie innerRadius={.9} />
			</Svg>
		</Chart>
	</div>
</Preview>

### If value less than 0, value will be treated as a offset of outerRadius

<Preview>
	<div class="h-[300px] p-4 border rounded">
		<Chart
			{data}
			x="value"
			r={d => d.date}
			rScale={scaleOrdinal()}
			rDomain={colorKeys}
			rRange={keyColors}
		>
			<Svg>
				<Pie innerRadius={-30} />
			</Svg>
		</Chart>
	</div>
</Preview>

## Outer radius

<Preview>
	<div class="h-[300px] p-4 border rounded">
		<Chart
			{data}
			x="value"
			r={d => d.date}
			rScale={scaleOrdinal()}
			rDomain={colorKeys}
			rRange={keyColors}
		>
			<Svg>
				<Pie outerRadius={100} />
			</Svg>
		</Chart>
	</div>
</Preview>

## Multiple (data prop)

<Preview>
	<div class="h-[300px] p-4 border rounded">
		<Chart
			{data}
			x="value"
			r={d => d.date}
			rScale={scaleOrdinal()}
			rDomain={colorKeys}
			rRange={keyColors}
		>
			<Svg>
				<Pie innerRadius={100} {data} />
				<Pie outerRadius={90} data={data2} />
			</Svg>
		</Chart>
	</div>
</Preview>

## Tweened

<Preview>
	<div class="h-[300px] p-4 border rounded">
		<Chart
			{data}
			x="value"
			r={d => d.date}
			rScale={scaleOrdinal()}
			rDomain={colorKeys}
			rRange={keyColors}
		>
			<Svg>
				<Pie tweened />
			</Svg>
		</Chart>
	</div>
</Preview>

## Offset

<Preview>
	<div class="h-[300px] p-4 border rounded">
		<Chart
			{data}
			x="value"
			r={d => d.date}
			rScale={scaleOrdinal()}
			rDomain={colorKeys}
			rRange={keyColors}
		>
			<Svg>
				<Pie offset={4} />
			</Svg>
		</Chart>
	</div>
</Preview>

## default slot / render each `<Arc>`

<Preview>
	<div class="h-[300px] p-4 border rounded">
		<Chart
			{data}
			x="value"
			r={d => d.date}
			rScale={scaleOrdinal()}
			rDomain={colorKeys}
			rRange={keyColors}
		>
			<Svg>
				<Pie let:arcs>
					{#each arcs as arc, index}
						<Arc
							startAngle={arc.startAngle}
							endAngle={arc.endAngle}
							padAngle={arc.padAngle}
							fill={keyColors[index]}
							offset={index === 0 ? 16 : 0}
						/>
					{/each}
				</Pie>
			</Svg>
		</Chart>
	</div>
</Preview>
