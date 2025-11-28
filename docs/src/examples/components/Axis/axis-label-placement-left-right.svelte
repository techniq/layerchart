<script lang="ts">
	import { Axis, Chart, Layer } from 'layerchart';
</script>

<Chart yDomain={[0, 100]} padding={{ top: 24, bottom: 24, left: 40, right: 40 }} height={300}>
	<Layer>
		<Axis label="left start" placement="left" labelPlacement="start" rule />
		<Axis label="left middle" placement="left" labelPlacement="middle" rule />
		<Axis label="left end" placement="left" labelPlacement="end" rule />

		<Axis label="right start" placement="right" labelPlacement="start" rule />
		<Axis label="right middle" placement="right" labelPlacement="middle" rule />
		<Axis label="right end" placement="right" labelPlacement="end" rule />
	</Layer>
</Chart>
