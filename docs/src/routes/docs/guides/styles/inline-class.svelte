<script lang="ts">
	import { Chart, Layer, Text } from 'layerchart';
</script>

<Chart height={60}>
	<Layer center>
		<Text
			value={'Inline Example Text'}
			textAnchor="middle"
			verticalAnchor="middle"
			class="text-red-500 text-4xl"
		/>
	</Layer>
</Chart>
