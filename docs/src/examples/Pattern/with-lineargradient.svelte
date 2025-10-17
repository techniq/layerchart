<script lang="ts">
	import { Chart, Layer, LinearGradient, Pattern, Rect } from 'layerchart';
</script>

<Chart height={300}>
	<Layer>
		<LinearGradient stops={['hsl(60 100% 50%)', 'hsl(30 100% 40%)']}>
			{#snippet children({ gradient })}
				<Rect x={120 * 0} y={0} width={100} height={300} rx={8} fill={gradient} />

				<Pattern size={4} circles={{ color: 'white', opacity: 0.5 }}>
					{#snippet children({ pattern })}
						<Rect x={120 * 0} y={0} width={100} height={300} rx={8} fill={pattern} />
					{/snippet}
				</Pattern>
			{/snippet}
		</LinearGradient>

		<LinearGradient stops={['hsl(60 100% 50%)', 'hsl(140 100% 40%)']} rotate={45}>
			{#snippet children({ gradient })}
				<Rect x={120 * 1} y={0} width={100} height={300} rx={8} fill={gradient} />

				<Pattern size={8} circles={{ color: 'white', opacity: 0.5 }}>
					{#snippet children({ pattern })}
						<Rect x={120 * 1} y={0} width={100} height={300} rx={8} fill={pattern} />
					{/snippet}
				</Pattern>
			{/snippet}
		</LinearGradient>

		<LinearGradient stops={['hsl(195 100% 50%)', 'hsl(270 100% 30%)']} vertical>
			{#snippet children({ gradient })}
				<Rect x={120 * 2} y={0} width={100} height={300} rx={8} fill={gradient} />

				<Pattern size={8} circles={{ color: 'white', opacity: 0.5, stagger: true }}>
					{#snippet children({ pattern })}
						<Rect x={120 * 2} y={0} width={100} height={300} rx={8} fill={pattern} />
					{/snippet}
				</Pattern>
			{/snippet}
		</LinearGradient>

		<LinearGradient stops={['hsl(60 100% 50%)', 'hsl(30 100% 40%)']}>
			{#snippet children({ gradient })}
				<Rect x={120 * 3} y={0} width={100} height={300} rx={8} fill={gradient} />

				<Pattern size={8} circles={{ color: 'white', opacity: 0.5, stagger: true, radius: 2 }}>
					{#snippet children({ pattern })}
						<Rect x={120 * 3} y={0} width={100} height={300} rx={8} fill={pattern} />
					{/snippet}
				</Pattern>
			{/snippet}
		</LinearGradient>

		<LinearGradient stops={['hsl(60 100% 50%)', 'hsl(140 100% 40%)']} rotate={45}>
			{#snippet children({ gradient })}
				<Rect x={120 * 4} y={0} width={100} height={300} rx={8} fill={gradient} />

				<Pattern size={4} lines={{ color: 'white', opacity: 0.5 }}>
					{#snippet children({ pattern })}
						<Rect x={120 * 4} y={0} width={100} height={300} rx={8} fill={pattern} />
					{/snippet}
				</Pattern>
			{/snippet}
		</LinearGradient>

		<LinearGradient stops={['hsl(195 100% 50%)', 'hsl(270 100% 30%)']} vertical>
			{#snippet children({ gradient })}
				<Rect x={120 * 5} y={0} width={100} height={300} rx={8} fill={gradient} />

				<Pattern
					size={4}
					lines={[
						{ color: 'black', opacity: 0.1 },
						{ color: 'black', opacity: 0.1, rotate: 90 }
					]}
				>
					{#snippet children({ pattern })}
						<Rect x={120 * 5} y={0} width={100} height={300} rx={8} fill={pattern} />
					{/snippet}
				</Pattern>
			{/snippet}
		</LinearGradient>
	</Layer>
</Chart>
