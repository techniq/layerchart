<script lang="ts">
	import { Chart, Layer, LinearGradient, Pattern, Rect } from 'layerchart';

	const data = $derived([]);

	export { data };
</script>

<Chart height={400}>
	<Layer>
		<LinearGradient stops={['hsl(60 100% 50%)', 'hsl(30 100% 40%)']}>
			{#snippet children({ gradient })}
				<Pattern size={4} background={gradient}>
					{#snippet children({ pattern })}
						<Rect x={120 * 0} y={0} width={100} height={300} rx={8} fill={pattern} />
					{/snippet}
				</Pattern>
			{/snippet}
		</LinearGradient>

		<LinearGradient stops={['hsl(60 100% 50%)', 'hsl(140 100% 40%)']} rotate={45}>
			{#snippet children({ gradient })}
				<Pattern size={4} background={gradient}>
					{#snippet children({ pattern })}
						<Rect x={120 * 1} y={0} width={100} height={300} rx={8} fill={pattern} />
					{/snippet}
				</Pattern>
			{/snippet}
		</LinearGradient>

		<LinearGradient stops={['hsl(195 100% 50%)', 'hsl(270 100% 30%)']} vertical>
			{#snippet children({ gradient })}
				<Pattern size={4} background={gradient}>
					{#snippet children({ pattern })}
						<Rect x={120 * 2} y={0} width={100} height={300} rx={8} fill={pattern} />
					{/snippet}
				</Pattern>
			{/snippet}
		</LinearGradient>

		<LinearGradient stops={['hsl(60 100% 50%)', 'hsl(30 100% 40%)']}>
			{#snippet children({ gradient })}
				<Pattern size={8} background={gradient}>
					{#snippet children({ pattern })}
						<Rect x={120 * 3} y={0} width={100} height={300} rx={8} fill={pattern} />
					{/snippet}
				</Pattern>
			{/snippet}
		</LinearGradient>

		<LinearGradient stops={['hsl(60 100% 50%)', 'hsl(140 100% 40%)']} rotate={45}>
			{#snippet children({ gradient })}
				<Pattern size={8} background={gradient}>
					{#snippet children({ pattern })}
						<Rect x={120 * 4} y={0} width={100} height={300} rx={8} fill={pattern} />
					{/snippet}
				</Pattern>
			{/snippet}
		</LinearGradient>
	</Layer>
</Chart>
