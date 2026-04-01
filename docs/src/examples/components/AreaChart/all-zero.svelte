<script lang="ts">
	import { AreaChart } from 'layerchart';

	const data = Array.from({ length: 30 }, (_, i) => ({
		date: new Date(2025, 7, 17 + i),
		value: 0,
	}));
	export { data };
</script>

<AreaChart {data} x="date" y="value" height={300} />
