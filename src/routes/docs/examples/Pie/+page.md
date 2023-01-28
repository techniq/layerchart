---
name: $name
docUrl: $docUrl
---

<script lang="ts">
	import { scaleOrdinal } from 'd3-scale';
	import { format } from 'date-fns';
	import { sum } from 'd3-array';
	import { formatDate, PeriodType } from 'svelte-ux/utils/date';
	import { formatNumberAsStyle } from 'svelte-ux/utils/number';

	import Chart, { Svg } from '$lib/components/Chart.svelte';
	import Arc from '$lib/components/Arc.svelte';
	import Pie from '$lib/components/Pie.svelte';
	import Text from '$lib/components/Text.svelte';
	import TooltipContext from '$lib/components/TooltipContext.svelte';
	import Tooltip from '$lib/components/Tooltip.svelte';
	import TooltipItem from '$lib/components/TooltipItem.svelte';

	import Preview from '$lib/docs/Preview.svelte';
	import { createDateSeries } from '$lib/utils/genData';


	const data = createDateSeries({ min: 20, max: 100, value: 'integer', count: 4 });
	const data2 = createDateSeries({ min: 20, max: 100, value: 'integer', count: 4 });

	$: dataSum = sum(data, d => d.value);

	const colorKeys = [...new Set(data.map(d => d.date))]
	const keyColors = ['var(--color-blue-500)', 'var(--color-green-500)', 'var(--color-purple-500)', 'var(--color-orange-500)'];
</script>

## Basic

<Preview>
	<div class="h-[300px] p-4 border rounded">
		<Chart
			{data}
			x="value"
			r="date"
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
			r="date"
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
			r="date"
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
			r="date"
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
			r="date"
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
			r="date"
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
			r="date"
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
			r="date"
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
			r="date"
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
			r="date"
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
			r="date"
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
			r="date"
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
			r="date"
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

## Centroid labels

<Preview>
	<div class="h-[300px] p-4 border rounded">
		<Chart
			{data}
			x="value"
			r="date"
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
							let:centroid
						>
							<Text
								value={formatNumberAsStyle(data[index].value / dataSum, 'percent')}
								x={centroid[0]}
								y={centroid[1]}
								dy={-8}
								textAnchor="middle"
								verticalAnchor="middle"
								class="text-lg"
              />
							<Text
								value={data[index].value}
								x={centroid[0]}
								y={centroid[1]}
								dy={8}
								textAnchor="middle"
								verticalAnchor="middle"
								class="text-sm fill-black/50"
              />
						</Arc>
					{/each}
				</Pie>
			</Svg>
		</Chart>
	</div>
</Preview>

## Tooltip

<Preview>
	<div class="h-[300px] p-4 border rounded">
		<Chart
			{data}
			x="value"
			r="date"
			rScale={scaleOrdinal()}
			rDomain={colorKeys}
			rRange={keyColors}
		>
			<TooltipContext mode="manual">
				<Svg>
					<Pie />
				</Svg>
				<Tooltip
					header={data => format(data.date, 'eee, MMMM do')}
					let:data
				>
					<TooltipItem
						label="value"
						value={formatNumberAsStyle(data.value, 'integer')}
						valueAlign="right"
					/>
					<TooltipItem
						label="percent"
						value={formatNumberAsStyle(data.value / dataSum, 'percent')}
						valueAlign="right"
					/>
				</Tooltip>
			</TooltipContext>
		</Chart>
	</div>
</Preview>
