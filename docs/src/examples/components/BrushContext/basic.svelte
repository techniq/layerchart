<script module lang="ts">
	import { getAppleStock } from '$lib/data.remote';
	const data = await getAppleStock();
</script>

<script lang="ts">
	import { Area, Chart, Layer } from 'layerchart';


	export { data };
</script>

<Chart {data} x="date" y="value" brush height={40}>
	<Layer>
		<Area line={{ class: 'stroke-2 stroke-primary' }} class="fill-primary/20" />
	</Layer>
</Chart>
