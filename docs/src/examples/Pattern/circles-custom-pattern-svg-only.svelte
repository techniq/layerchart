<script lang="ts">
	import { Chart, Layer, Pattern } from 'layerchart';

	const data = $derived([]);

	export { data };
</script>

<Chart height={400}>
	<Layer>
		<Pattern id="circle-pattern-1" width={4} height={4}>
			{#snippet patternContent()}
				<circle cx={2} cy={2} r={1} class="fill-surface-content" />
			{/snippet}
		</Pattern>

		<Pattern id="circle-pattern-2" width={8} height={8}>
			{#snippet patternContent()}
				<circle cx={4} cy={4} r={1} class="fill-surface-content" />
			{/snippet}
		</Pattern>

		<Pattern id="circle-pattern-3" width={8} height={8}>
			{#snippet patternContent()}
				<circle cx={4} cy={4} r={2} class="fill-surface-content" />
			{/snippet}
		</Pattern>

		<Pattern id="circle-pattern-4" width={8} height={8}>
			{#snippet patternContent()}
				<circle cx={4} cy={4} r={2} class="fill-surface-content" />
				<circle cx={0} cy={0} r={2} class="fill-surface-content" />
				<circle cx={0} cy={8} r={2} class="fill-surface-content" />
				<circle cx={8} cy={0} r={2} class="fill-surface-content" />
				<circle cx={8} cy={8} r={2} class="fill-surface-content" />
			{/snippet}
		</Pattern>

		<Pattern id="circle-pattern-5" width={8} height={8}>
			{#snippet patternContent()}
				<circle cx={4} cy={4} r={1} class="fill-surface-content" />
				<circle cx={0} cy={0} r={1} class="fill-surface-content" />
				<circle cx={0} cy={8} r={1} class="fill-surface-content" />
				<circle cx={8} cy={0} r={1} class="fill-surface-content" />
				<circle cx={8} cy={8} r={1} class="fill-surface-content" />
			{/snippet}
		</Pattern>

		<Pattern id="circle-pattern-6" width={8} height={8}>
			{#snippet patternContent()}
				<circle cx={4} cy={4} r={2} class="fill-surface-content/30" />
			{/snippet}
		</Pattern>

		{#each { length: 6 } as _, i}
			<rect
				x={0 + i * 120}
				y={0}
				width={100}
				height={300}
				rx={8}
				fill="url(#circle-pattern-{i + 1})"
				class="stroke-surface-content"
			/>
		{/each}
	</Layer>
</Chart>
