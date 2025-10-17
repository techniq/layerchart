<script lang="ts">
	import { Chart, Layer, Pattern } from 'layerchart';

	const data = $derived([]);

	export { data };
</script>

<Chart height={400}>
	<Layer>
		<Pattern width={4} height={4}>
			{#snippet patternContent()}
				<line x2="100%" class="stroke-surface-content" />
			{/snippet}

			{#snippet children({ pattern })}
				<rect
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

		<Pattern width={4} height={4}>
			{#snippet patternContent()}
				<line y2="100%" class="stroke-surface-content" />
			{/snippet}

			{#snippet children({ pattern })}
				<rect
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

		<Pattern width={4} height={4}>
			{#snippet patternContent()}
				<line x2="100%" class="stroke-surface-content" />
				<line y2="100%" class="stroke-surface-content" />
			{/snippet}

			{#snippet children({ pattern })}
				<rect
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

		<Pattern width={8} height={8}>
			{#snippet patternContent()}
				<line x1={8} y2={8} class="stroke-surface-content" />
			{/snippet}

			{#snippet children({ pattern })}
				<rect
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

		<Pattern width={8} height={8}>
			{#snippet patternContent()}
				<line x2={8} y2={8} class="stroke-surface-content" />
			{/snippet}

			{#snippet children({ pattern })}
				<rect
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

		<Pattern width={8} height={8}>
			{#snippet patternContent()}
				<line x1={8} y2={8} class="stroke-surface-content" />
				<line x2={8} y2={8} class="stroke-surface-content" />
			{/snippet}

			{#snippet children({ pattern })}
				<rect
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
