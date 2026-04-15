<script lang="ts">
	import { Chart, ClipPath, Frame, Layer, Pattern, Polygon } from 'layerchart';
</script>

<Chart height={300}>
	{#snippet children({ context })}
		<Layer>
			<!-- Render the polygon once as a visible outline (and to define the shape by id) -->
			<Polygon
				id="star-shape"
				cx={context.width / 2}
				cy={context.height / 2}
				r={120}
				points={10}
				inset={0.5}
				class="fill-none stroke-2 stroke-surface-content"
			/>

			<!-- Reference the same shape as a clip region via `useId` -->
			<Pattern size={6} lines={[{ rotate: 45 }, { rotate: -45 }]}>
				{#snippet children({ pattern })}
					<ClipPath useId="star-shape">
						<Frame fill={pattern} class="stroke-surface-content" />
					</ClipPath>
				{/snippet}
			</Pattern>
		</Layer>
	{/snippet}
</Chart>
