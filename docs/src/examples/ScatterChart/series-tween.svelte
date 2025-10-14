<script lang="ts">
	import { ScatterChart } from 'layerchart';
	import { getPenguins } from '$lib/data.remote';
	import { flatGroup } from 'd3-array';

	const data = $derived(
		flatGroup(
			(await getPenguins()).filter(
				(d) => d.flipper_length_mm !== 'NA' && d.bill_length_mm !== 'NA'
			),
			(d) => d.species
		)
	);
	export { data };
</script>

<ScatterChart
	x="flipper_length_mm"
	y="bill_length_mm"
	series={data.map(([species, data], i) => {
		const color = ['var(--color-primary)', 'var(--color-secondary)', 'var(--color-success)'][i];
		return {
			key: species,
			data,
			color,
			props: {
				stroke: color,
				fillOpacity: 0.3
			}
		};
	})}
	height={400}
	legend
	props={{
		xAxis: { motion: { type: 'tween', duration: 200 } },
		yAxis: { motion: { type: 'tween', duration: 200 } },
		grid: { motion: { type: 'tween', duration: 200 } },
		points: { motion: { type: 'tween', duration: 200 } }
	}}
/>
