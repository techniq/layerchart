<script lang="ts">
	import { ArcChart } from 'layerchart';

	const data = [{ key: 'Example', value: 70, color: 'var(--color-success)' }];
	export { data };
</script>

<ArcChart
	{data}
	key="key"
	value="value"
	maxValue={100}
	range={[-90, 90]}
	outerRadius={80}
	innerRadius={-20}
	cornerRadius={10}
	props={{
		group: { y: 40 }
	}}
	height={120}
/>
