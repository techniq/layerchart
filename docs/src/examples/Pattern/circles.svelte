<script lang="ts">
	import { Chart, Layer, Pattern, Rect } from 'layerchart';
</script>

<Chart height={300}>
	<Layer>
		<Pattern size={4} circles>
			{#snippet children({ pattern })}
				<Rect
					x={120 * 0}
					y={0}
					width={100}
					height={300}
					rx={8}
					fill={pattern}
					class="stroke-surface-content"
				/>
			{/snippet}
		</Pattern>

		<Pattern size={8} circles>
			{#snippet children({ pattern })}
				<Rect
					x={120 * 1}
					y={0}
					width={100}
					height={300}
					rx={8}
					fill={pattern}
					class="stroke-surface-content"
				/>
			{/snippet}
		</Pattern>

		<Pattern size={8} circles={{ stagger: true }}>
			{#snippet children({ pattern })}
				<Rect
					x={120 * 2}
					y={0}
					width={100}
					height={300}
					rx={8}
					fill={pattern}
					class="stroke-surface-content"
				/>
			{/snippet}
		</Pattern>

		<Pattern size={8} circles={{ radius: 2 }}>
			{#snippet children({ pattern })}
				<Rect
					x={120 * 3}
					y={0}
					width={100}
					height={300}
					rx={8}
					fill={pattern}
					class="stroke-surface-content"
				/>
			{/snippet}
		</Pattern>

		<Pattern size={8} circles={{ radius: 2, stagger: true }}>
			{#snippet children({ pattern })}
				<Rect
					x={120 * 4}
					y={0}
					width={100}
					height={300}
					rx={8}
					fill={pattern}
					class="stroke-surface-content"
				/>
			{/snippet}
		</Pattern>

		<Pattern size={8} circles={{ radius: 2, opacity: 0.3 }}>
			{#snippet children({ pattern })}
				<Rect
					x={120 * 5}
					y={0}
					width={100}
					height={300}
					rx={8}
					fill={pattern}
					class="stroke-surface-content"
				/>
			{/snippet}
		</Pattern>
	</Layer>
</Chart>
