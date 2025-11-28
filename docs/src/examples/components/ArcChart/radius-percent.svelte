<script lang="ts">
	import { ArcChart } from 'layerchart';

	const data = [{ key: 'Example', value: 70 }];
	export { data };
</script>

<ArcChart
	{data}
	key="key"
	value="value"
	maxValue={100}
	innerRadius={0.8}
	trackOuterRadius={0.95}
	trackInnerRadius={0.9}
	cornerRadius={10}
	height={160}
/>
