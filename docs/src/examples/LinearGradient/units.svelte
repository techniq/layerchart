<script lang="ts">
	import { Chart, Layer, LinearGradient, Rect } from 'layerchart';
</script>

<Chart height={300}>
	<Layer>
		<LinearGradient class="from-green-500 to-blue-500" units="objectBoundingBox">
			{#snippet children({ gradient })}
				{#each { length: 6 } as _, i}
					<Rect x={0 + i * 120} y={0} width={100} height={140} rx={8} fill={gradient} />
				{/each}
			{/snippet}
		</LinearGradient>

		<LinearGradient class="from-green-500 to-blue-500" units="userSpaceOnUse">
			{#snippet children({ gradient })}
				{#each { length: 6 } as _, i}
					<Rect x={0 + i * 120} y={160} width={100} height={140} rx={8} fill={gradient} />
				{/each}
			{/snippet}
		</LinearGradient>
	</Layer>
</Chart>
