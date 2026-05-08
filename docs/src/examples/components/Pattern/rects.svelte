<script lang="ts">
	import { Chart, Layer, Pattern, Rect } from 'layerchart';
</script>

<Chart height={300}>
	<Layer>
		<!-- Solid filled tile (default inset 0) -->
		<Pattern size={8} rects>
			{#snippet children({ pattern })}
				<Rect
					x={120 * 0}
					y={0}
					width={100}
					height={300}
					rx={8}
					fill={pattern}
					stroke="var(--color-surface-content)"
				/>
			{/snippet}
		</Pattern>

		<!-- Cell grid: rects with inset for gaps -->
		<Pattern size={12} rects={{ inset: 1 }}>
			{#snippet children({ pattern })}
				<Rect
					x={120 * 1}
					y={0}
					width={100}
					height={300}
					rx={8}
					fill={pattern}
					stroke="var(--color-surface-content)"
				/>
			{/snippet}
		</Pattern>

		<!-- Rounded cells -->
		<Pattern size={14} rects={{ inset: 2, rx: 2, ry: 2 }}>
			{#snippet children({ pattern })}
				<Rect
					x={120 * 2}
					y={0}
					width={100}
					height={300}
					rx={8}
					fill={pattern}
					stroke="var(--color-surface-content)"
				/>
			{/snippet}
		</Pattern>

		<!-- Circular cells (rx="100%") -->
		<Pattern size={14} rects={{ inset: 2, rx: '100%', ry: '100%' }}>
			{#snippet children({ pattern })}
				<Rect
					x={120 * 3}
					y={0}
					width={100}
					height={300}
					rx={8}
					fill={pattern}
					stroke="var(--color-surface-content)"
				/>
			{/snippet}
		</Pattern>

		<!-- Custom color + opacity -->
		<Pattern size={14} rects={{ inset: 2, rx: 2, color: 'var(--color-primary)', opacity: 0.6 }}>
			{#snippet children({ pattern })}
				<Rect
					x={120 * 4}
					y={0}
					width={100}
					height={300}
					rx={8}
					fill={pattern}
					stroke="var(--color-surface-content)"
				/>
			{/snippet}
		</Pattern>

		<!-- Background + foreground rect (checkerboard-ish) -->
		<Pattern
			size={14}
			background="var(--color-surface-200)"
			rects={{ inset: 2, rx: 2, color: 'var(--color-info)' }}
		>
			{#snippet children({ pattern })}
				<Rect
					x={120 * 5}
					y={0}
					width={100}
					height={300}
					rx={8}
					fill={pattern}
					stroke="var(--color-surface-content)"
				/>
			{/snippet}
		</Pattern>
	</Layer>
</Chart>
