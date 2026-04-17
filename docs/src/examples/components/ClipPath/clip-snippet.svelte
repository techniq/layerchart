<script lang="ts">
	import { Chart, ClipPath, Frame, Layer, Pattern } from 'layerchart';
</script>

<Chart height={300}>
	<Layer>
		<Pattern size={6} lines={[{ rotate: 45 }, { rotate: -45 }]}>
			{#snippet children({ pattern })}
				<ClipPath>
					{#snippet clip()}
						<circle cx="120" cy="150" r="90" />
						<circle cx="240" cy="150" r="90" />
						<rect x="100" y="130" width="160" height="40" />
					{/snippet}
					<Frame fill={pattern} class="stroke-surface-content" />
				</ClipPath>
			{/snippet}
		</Pattern>
	</Layer>
</Chart>
