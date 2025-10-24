<script lang="ts">
	import { onMount } from 'svelte';
	import { LineChart } from 'layerchart';

	// Simplified oscilloscope example with mock data
	let timeData: { key: number; value: number }[] = $state([]);

	onMount(() => {
		// Generate mock time domain data for demonstration
		const mockData = Array.from({ length: 512 }, (_, i) => ({
			key: i,
			value: 128 + 64 * Math.sin((i / 512) * Math.PI * 8) + 32 * Math.sin((i / 512) * Math.PI * 16)
		}));
		timeData = mockData;
	});

	const data = timeData;
	export { data };
</script>

<LineChart
	data={timeData}
	x="key"
	y="value"
	yDomain={[0, 256]}
	axis={false}
	grid={false}
	props={{ spline: { class: 'stroke-surface-content' } }}
	tooltip={{ mode: 'manual' }}
	height={100}
/>
