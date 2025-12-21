<script lang="ts">
	import { Chart, Layer, Text } from 'layerchart';
</script>

<Chart height={60}>
	<Layer center>
		<Text
			style="fill: yellow;"
			value={'Inline Example Text'}
			textAnchor="middle"
			verticalAnchor="middle"
			class="text-4xl"
		/>
	</Layer>
</Chart>
