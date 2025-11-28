<script lang="ts">
	import { LineChart } from 'layerchart';
	import { ticks } from 'd3-array';

	let data = $state(ticks(-2, 2, 200).map(Math.sin));
	export { data };
</script>

<!-- svelte-ignore a11y_no_static_element_interactions -->
<div
	onmousemove={(e) => {
		const x = e.clientX;
		const y = e.clientY;
		data = data.slice(-200).concat(Math.atan2(x, y));
	}}
>
	<LineChart
		data={data.map((d, i) => ({ x: i, y: d }))}
		x="x"
		y="y"
		yBaseline={undefined}
		tooltip={false}
		props={{
			yAxis: { motion: 'tween' },
			grid: { motion: 'tween' }
			// spline: {
			//   draw: {
			//     // easing function to only draw the last data point
			//     easing: (t) => {
			//       const totalDataPoints = data.length;
			//       const percentage = (totalDataPoints - 10) / totalDataPoints;
			//       const minT = 1 * percentage;
			//       return minT + t * (1 - minT);
			//     },
			//     duration: 300,
			//   },
			// },
		}}
		height={300}
	/>
</div>
