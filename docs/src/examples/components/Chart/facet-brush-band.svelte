<script lang="ts">
	import { BarChart, type BrushState } from 'layerchart';

	const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']; // prettier-ignore
	const regions = ['North', 'South', 'West'];

	const data = regions.flatMap((region, r) =>
		months.map((month, m) => ({
			region,
			month,
			value: Math.round(140 + 60 * Math.sin(m / 2 + r) + 8 * m)
		}))
	);
	export { data };

	let selection = $state<string[] | null>(null);

	/**
	 * Categories are selected by position rather than by value: `brush.x` holds the first and last
	 * month of the selection, and the months between them are the ones the domain puts between
	 * them — not the ones that sort between them, which would be `Apr` through `Jan`.
	 */
	function selectedMonths(brush: BrushState) {
		if (!brush.active) return null;
		const [first, last] = brush.x.map((month) => months.indexOf(month as string));
		return months.slice(Math.min(first, last), Math.max(first, last) + 1);
	}
</script>

<!--
	Brushing a band scale snaps to whole categories, and the run of months it selects is the same
	run in every panel — so the comparison the facets were drawn for holds while you narrow it.

	`zoomOnBrush` is on by default for a simplified chart; turning it off keeps the selection a
	selection.
-->
<BarChart
	{data}
	x="month"
	y="value"
	fx="region"
	xDomain={months}
	grid
	brush={{
		axis: 'x',
		zoomOnBrush: false,
		onChange: (e) => (selection = selectedMonths(e.brush))
	}}
	props={{
		bars: {
			opacity: (d: { month: string }) =>
				selection == null || selection.includes(d.month) ? 1 : 0.25,
			motion: 'spring'
		},
		xAxis: { tickSpacing: 30, tickLabelProps: { class: 'text-[10px]' } }
	}}
	padding={{ left: 40, bottom: 32, top: 24, right: 8 }}
	height={280}
/>
