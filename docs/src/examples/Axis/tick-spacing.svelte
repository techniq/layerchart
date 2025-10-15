<script lang="ts">
	import { Axis, Chart, Layer } from 'layerchart';
</script>

<Chart xDomain={[0, 2]} padding={{ bottom: 24 }} height={48}>
	<Layer>
		<Axis placement="bottom" rule tickSpacing={200} />
	</Layer>
</Chart>
