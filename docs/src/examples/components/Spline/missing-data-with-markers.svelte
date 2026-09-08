<script lang="ts">
	import { timeDay } from 'd3-time';
	import { Axis, Chart, Circle, Layer, Spline, Text } from 'layerchart';

	const start = new Date('2024-06-01T00:00:00');

	// Downloads by day offset — days 5-7 and day 11 never came back from the registry, so they are
	// absent rather than zero
	const reported: [offset: number, downloads: number][] = [
		[0, 420],
		[1, 465],
		[2, 430],
		[3, 510],
		[4, 495],
		[8, 620],
		[9, 640],
		[10, 590],
		[12, 705],
		[13, 760],
		[14, 720],
		[15, 810]
	];

	const rows = reported.map(([offset, downloads]) => ({
		date: timeDay.offset(start, offset),
		downloads
	}));

	// A run takes its style from the point it starts at, so the flag marks the day a gap leaves
	// from — not the days that are missing, which aren't in the data at all
	const data = rows.map((d, i) => ({
		...d,
		bridged: i < rows.length - 1 && timeDay.count(d.date, rows[i + 1].date) > 1
	}));

	export { data };
</script>

<!--
	The dashes split this one line into five paths, but its ends are still its own: `endContent`
	renders once, at the last reported day, and the seams between runs take `markerMid` like the
	interior points they are.  The dots pick up the line's color from `context-stroke`, which the
	runs inherit from the series rather than each having to name it.
-->
<Chart
	{data}
	x="date"
	y="downloads"
	yDomain={[0, null]}
	yNice
	series={[{ key: 'downloads', color: 'var(--color-primary)' }]}
	padding={{ top: 8, right: 72, bottom: 24, left: 44 }}
	height={300}
>
	<Layer>
		<Axis placement="left" grid rule format="metric" />
		<Axis placement="bottom" rule />
		<Spline
			seriesKey="downloads"
			class={(d) => (d.bridged ? 'stroke-2 [stroke-dasharray:4_4]' : 'stroke-2')}
			markerMid={{ type: 'circle', size: 6 }}
		>
			{#snippet endContent()}
				<Circle r={4} class="fill-primary" />
				<Text
					value={data.at(-1)?.downloads}
					format="metric"
					verticalAnchor="middle"
					dx={8}
					class="text-xs fill-primary"
				/>
			{/snippet}
		</Spline>
	</Layer>
</Chart>
