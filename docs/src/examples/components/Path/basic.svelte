<script lang="ts">
	import { Chart, Path, Layer } from 'layerchart';
</script>

<Chart height={300}>
	<Layer>
		<Path pathData="M10 80 C 40 10, 65 10, 95 80 S 150 150, 180 80" strokeWidth={2} />
	</Layer>
</Chart>
