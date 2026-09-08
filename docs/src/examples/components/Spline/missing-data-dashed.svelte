<script lang="ts">
	import { timeDay } from 'd3-time';
	import { Axis, Chart, Layer, Legend, Spline, defaultChartPadding } from 'layerchart';
	import { Button } from 'svelte-ux';
	import LucideRefreshCw from '~icons/lucide/refresh-cw';

	const packages = ['@acme/core', '@acme/charts', '@acme/ui'];

	/**
	 * Daily downloads, with the days the registry never reported simply absent — the way a
	 * downloads API returns them.  `bridged` marks the point a gap *leaves* from, since a run
	 * takes its style from the point it starts at.
	 */
	function generate() {
		const today = timeDay.floor(new Date());

		return packages.flatMap((name, p) => {
			const reported: { date: Date; package: string; downloads: number }[] = [];
			let downloads = 400 + p * 260;

			for (let i = 59; i >= 0; i--) {
				downloads = Math.max(80, downloads + Math.round((Math.random() - 0.5) * 90));
				// A handful of days nobody reported.  Kept off both ends so every line has one.
				if (i < 55 && i > 4 && Math.random() < 0.07) continue;
				reported.push({ date: timeDay.offset(today, -i), package: name, downloads });
			}

			return reported.map((d, i, arr) => ({
				...d,
				bridged: i < arr.length - 1 && timeDay.count(d.date, arr[i + 1].date) > 1
			}));
		});
	}

	let data = $state(generate());

	export { data };
</script>

<Button
	variant="outline"
	size="sm"
	icon={LucideRefreshCw}
	class="mb-2"
	onclick={() => (data = generate())}
>
	Update data
</Button>

<!--
	One line per package (`c` names them, so it splits them too), each split again wherever the
	registry stopped reporting.  With no `stroke` of its own every run keeps its line's color, and
	each tweens to the next update's run of the same style — so the dashed stretches animate
	alongside the solid ones instead of redrawing.
-->
<Chart
	{data}
	x="date"
	y="downloads"
	yDomain={[0, null]}
	yNice
	c="package"
	cDomain={packages}
	cRange={['var(--color-primary)', 'var(--color-secondary)', 'var(--color-warning)']}
	padding={defaultChartPadding({ legend: true, left: 44, bottom: 24 })}
	height={300}
>
	<Layer>
		<Axis placement="left" grid rule format="metric" />
		<Axis placement="bottom" rule />
		<Spline
			motion="tween"
			class={(d) => (d.bridged ? 'stroke-2 [stroke-dasharray:4_4]' : 'stroke-2')}
		/>
	</Layer>

	<Legend placement="bottom" />
</Chart>
