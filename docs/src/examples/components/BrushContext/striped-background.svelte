<script module lang="ts">
	import { getAppleStock } from '$lib/data.remote';
	const data = await getAppleStock();
</script>

<script lang="ts">
	import { Area, Chart, Layer } from 'layerchart';

	export { data };
</script>

<Chart {data} x="date" y="value" brush={{ classes: { range: 'striped-background' } }} height={40}>
	<Layer>
		<Area line={{ class: 'stroke-2 stroke-primary' }} class="fill-primary/20" />
	</Layer>
</Chart>

<style>
	:global(.striped-background) {
		outline: 1px solid color-mix(in lch, var(--color-secondary) 50%, transparent);
		background: repeating-linear-gradient(
			135deg,
			color-mix(in lch, var(--color-secondary) 30%, transparent) 0 1px,
			color-mix(in lch, var(--color-secondary) 10%, transparent) 0 6px
		);
	}
</style>
