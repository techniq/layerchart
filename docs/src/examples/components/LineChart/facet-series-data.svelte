<script lang="ts">
	import { LineChart } from 'layerchart';
	import { createDateSeries } from '$lib/utils/data.js';

	const stores = ['North', 'South', 'East'];

	// Each series carries its own rows, with every store's rows mixed together
	function sales(min: number, max: number) {
		return stores.flatMap((store) =>
			createDateSeries({ count: 30, min, max, value: 'integer' }).map((d) => ({ ...d, store }))
		);
	}
	const online = sales(20, 60);
	const inStore = sales(50, 100);
	export { online as data };
</script>

<LineChart
	x="date"
	y="value"
	fx="store"
	series={[
		{ key: 'online', label: 'Online', data: online, color: 'var(--color-primary)' },
		{ key: 'inStore', label: 'In store', data: inStore, color: 'var(--color-secondary)' }
	]}
	legend
	padding={{ left: 44, bottom: 56, top: 24, right: 8 }}
	height={300}
/>
