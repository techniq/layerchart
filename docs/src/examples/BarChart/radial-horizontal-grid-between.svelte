<script lang="ts">
	import { BarChart } from 'layerchart';

	const data = [
		{ browser: 'chrome', visitors: 200 },
		{ browser: 'firefox', visitors: 150 },
		{ browser: 'safari', visitors: 120 },
		{ browser: 'edge', visitors: 100 },
		{ browser: 'other', visitors: 90 }
	];

	export { data };
</script>

<BarChart
	{data}
	x="visitors"
	y="browser"
	yRange={({ height }) => [height / 5, height / 2]}
	c="browser"
	cRange={[
		'var(--color-primary)',
		'var(--color-danger)',
		'var(--color-warning)',
		'var(--color-success)',
		'var(--color-secondary)'
	]}
	radial
	orientation="horizontal"
	grid={{ bandAlign: 'between' }}
	height={400}
/>
