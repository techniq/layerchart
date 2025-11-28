<script lang="ts">
	import { Chart, Layer, Pattern, Rect } from 'layerchart';
</script>

<Chart height={300}>
	<Layer>
		<Pattern size={4} lines>
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

		<Pattern size={4} lines={{ rotate: 90 }}>
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

		<Pattern size={5} lines={[{ rotate: 0 }, { rotate: 90 }]}>
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

		<Pattern size={5} lines={{ rotate: -45 }}>
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

		<Pattern size={5} lines={{ rotate: 45 }}>
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

		<Pattern size={6} lines={[{ rotate: 45 }, { rotate: -45 }]}>
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
