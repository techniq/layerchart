<script lang="ts">
	import { Chart, Layer, LinearGradient, Rect } from 'layerchart';
</script>

<Chart height={300}>
	<Layer>
		<LinearGradient stops={['hsl(60 100% 50%)', 'hsl(30 100% 40%)']}>
			{#snippet children({ gradient })}
				<Rect x={120 * 0} y={0} width={100} height={300} rx={8} fill={gradient} />
			{/snippet}
		</LinearGradient>

		<LinearGradient stops={['hsl(60 100% 50%)', 'hsl(140 100% 40%)']} rotate={45}>
			{#snippet children({ gradient })}
				<Rect x={120 * 1} y={0} width={100} height={300} rx={8} fill={gradient} />
			{/snippet}
		</LinearGradient>

		<LinearGradient stops={['hsl(195 100% 50%)', 'hsl(270 100% 30%)']} vertical>
			{#snippet children({ gradient })}
				<Rect x={120 * 2} y={0} width={100} height={300} rx={8} fill={gradient} />
			{/snippet}
		</LinearGradient>
	</Layer>
</Chart>
