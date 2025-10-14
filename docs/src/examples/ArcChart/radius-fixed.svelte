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
	outerRadius={80}
	innerRadius={60}
	trackOuterRadius={75}
	trackInnerRadius={65}
	cornerRadius={10}
	height={160}
/>
