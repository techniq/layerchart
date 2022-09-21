---
name: $name
sourceUrl: $sourceUrl
docUrl: $docUrl
---

<script lang="ts">
	import { scaleOrdinal } from 'd3-scale';

	import { ApiDocs } from 'svelte-ux';

	import api from '$lib/components/Legend.svelte?raw&sveld';

	import Chart, { Svg } from '$lib/components/Chart.svelte';
	import Legend from '$lib/components/Legend.svelte';
	import Pie from '$lib/components/Pie.svelte';

	import Preview from '$lib/docs/Preview.svelte';

	const data = [];
</script>

# Examples

## vertical (default)

<Preview>
	<div class="h-[300px] p-4 border rounded">
		<Chart
			{data}
			x="value"
			r="name"
			rScale={scaleOrdinal()}
			rDomain={['one', 'two', 'three']}
			rRange={['var(--color-blue-500)', 'var(--color-green-500)', 'var(--color-purple-500)']}
		>
			<Legend />
		</Chart>
	</div>
</Preview>

## horizontal

<Preview>
	<div class="h-[300px] p-4 border rounded">
		<Chart
			{data}
			x="value"
			r="name"
			rScale={scaleOrdinal()}
			rDomain={['one', 'two', 'three']}
			rRange={['var(--color-blue-500)', 'var(--color-green-500)', 'var(--color-purple-500)']}
		>
			<Legend class="inline-flex gap-2" />
		</Chart>
	</div>
</Preview>

## position (bottom right)

<Preview>
	<div class="h-[300px] p-4 border rounded">
		<Chart
			{data}
			x="value"
			r="name"
			rScale={scaleOrdinal()}
			rDomain={['one', 'two', 'three']}
			rRange={['var(--color-blue-500)', 'var(--color-green-500)', 'var(--color-purple-500)']}
		>
			<Legend class="absolute bottom-0 right-0" />
		</Chart>
	</div>
</Preview>

## position (center right)

<Preview>
	<div class="h-[300px] p-4 border rounded">
		<Chart
			{data}
			x="value"
			r="name"
			rScale={scaleOrdinal()}
			rDomain={['one', 'two', 'three']}
			rRange={['var(--color-blue-500)', 'var(--color-green-500)', 'var(--color-purple-500)']}
		>
			<Legend class="absolute top-1/2 right-0 -translate-y-1/2" />
		</Chart>
	</div>
</Preview>

## slot rendering

<Preview>
	<div class="h-[300px] p-4 border rounded">
		<Chart
			{data}
			x="value"
			r="name"
			rScale={scaleOrdinal()}
			rDomain={['one', 'two', 'three']}
			rRange={['var(--color-blue-500)', 'var(--color-green-500)', 'var(--color-purple-500)']}
		>
			<Legend let:items>
				<div class="inline-flex flex-col gap-2">
					{#each items as { label, color }}
						<div class="flex items-center gap-1">
							<div class="h-8 w-8 text-md" style:background-color={color} />
							{label}
						</div>
					{/each}
				</div>
			</Legend>
		</Chart>
	</div>
</Preview>

## custom items

<Preview>
	<div class="h-[300px] p-4 border rounded">
		<Chart
			{data}
			x="value"
		>
			<Legend items={[
				{ label: 'uno', color: 'var(--color-red-500)' },
				{ label: 'dos', color: 'var(--color-orange-500)' },
				{ label: 'tres', color: 'var(--color-yellow-500)' }
			]} />
		</Chart>
	</div>
</Preview>

# API

<ApiDocs {api} />
