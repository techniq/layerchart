<script lang="ts">
	import { Chart, ClipPath, Frame, Layer, Pattern } from 'layerchart';

	const cx = 150;
	const cy = 150;
	const r = 100;
	const path = `M${cx - r},${cy} a${r},${r} 0 1,0 ${2 * r},0 a${r},${r} 0 1,0 ${-2 * r},0 Z`;
</script>

<Chart height={300}>
	<Layer>
		<Pattern size={6} lines={[{ rotate: 45 }, { rotate: -45 }]}>
			{#snippet children({ pattern })}
				<ClipPath {path} invert>
					<Frame fill={pattern} class="stroke-surface-content" />
				</ClipPath>
			{/snippet}
		</Pattern>
	</Layer>
</Chart>
