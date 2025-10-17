<script lang="ts">
	import { Chart, Layer, Pattern, Rect } from 'layerchart';
</script>

<Chart height={300}>
	<Layer>
		<Pattern size={4} circles={{ color: 'white', opacity: 0.25 }} background="hsl(20 100% 50%)">
			{#snippet children({ pattern })}
				<Rect x={120 * 0} y={0} width={100} height={300} rx={8} fill={pattern} />
			{/snippet}
		</Pattern>

		<Pattern size={8} circles={{ color: 'white', opacity: 0.6 }} background="hsl(150 100% 45%)">
			{#snippet children({ pattern })}
				<Rect x={120 * 1} y={0} width={100} height={300} rx={8} fill={pattern} />
			{/snippet}
		</Pattern>

		<Pattern
			size={8}
			circles={{ color: 'white', opacity: 0.6, stagger: true }}
			background="hsl(210 100% 50%)"
		>
			{#snippet children({ pattern })}
				<Rect x={120 * 2} y={0} width={100} height={300} rx={8} fill={pattern} />
			{/snippet}
		</Pattern>

		<Pattern
			size={8}
			circles={{ color: 'white', opacity: 0.6, stagger: true, radius: 2 }}
			background="hsl(260 100% 50%)"
		>
			{#snippet children({ pattern })}
				<Rect x={120 * 3} y={0} width={100} height={300} rx={8} fill={pattern} />
			{/snippet}
		</Pattern>

		<Pattern size={4} lines={{ color: 'white', opacity: 0.5 }} background="hsl(40 100% 50%)">
			{#snippet children({ pattern })}
				<Rect x={120 * 4} y={0} width={100} height={300} rx={8} fill={pattern} />
			{/snippet}
		</Pattern>

		<Pattern
			size={4}
			lines={[
				{ color: 'black', opacity: 0.1 },
				{ color: 'black', opacity: 0.1, rotate: 90 }
			]}
			background="hsl(360 100% 40%)"
		>
			{#snippet children({ pattern })}
				<Rect x={120 * 5} y={0} width={100} height={300} rx={8} fill={pattern} />
			{/snippet}
		</Pattern>
	</Layer>
</Chart>
