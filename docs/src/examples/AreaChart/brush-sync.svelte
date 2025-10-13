<script lang="ts">
	import { AreaChart } from 'layerchart';
	import type { DomainType } from 'layerchart/utils/scales.svelte';
	import { randomWalk } from '$lib/utils/data.js';
	import { timeDay } from 'd3-time';

	const now = new Date();
	const data1 = randomWalk({ count: 1000 }).map((value, i) => ({
		date: timeDay.offset(now, i),
		value: 10 + value
	}));
	const data2 = randomWalk({ count: 1000 }).map((value, i) => ({
		date: timeDay.offset(now, i),
		value: 10 + value
	}));
	const data = $derived({ data: { data1, data2 } });
	export { data };

	let xDomain: DomainType | undefined = $state();
</script>

<div class="grid xl:grid-cols-2 gap-3">
	<div class="p-4 border rounded-sm">
		<AreaChart
			data={data1}
			x="date"
			y="value"
			{xDomain}
			brush={{ onBrushEnd: (e) => (xDomain = e.xDomain) }}
			props={{
				area: { motion: { type: 'tween', duration: 200 } },
				xAxis: {
					motion: { type: 'tween', duration: 200 },
					tickMultiline: true
				}
			}}
			height={300}
		/>
	</div>

	<div class="p-4 border rounded-sm">
		<AreaChart
			data={data2}
			x="date"
			y="value"
			{xDomain}
			brush={{ onBrushEnd: (e) => (xDomain = e.xDomain) }}
			props={{
				area: { motion: { type: 'tween', duration: 200 } },
				xAxis: {
					motion: { type: 'tween', duration: 200 },
					tickMultiline: true
				}
			}}
			height={300}
		/>
	</div>
</div>
