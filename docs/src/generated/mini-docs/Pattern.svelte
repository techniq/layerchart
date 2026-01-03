
<!--
	@component
	## Pattern

	## Description

	Fill component which provides a line or circle-based fill pattern for chart elements.

	## Category

	[[Fill](/Users/sjr/dev/Svelte/layerchart/docs/src/content/components/Fill.md)]

	## Layers

	[SVG](/docs/components/svg), [Canvas](/docs/components/canvas)

	Full Documentation: [Pattern](/docs/components/Pattern)

	## API Properties

	* id:<string> - The id of the pattern 
	* size:<number> - The size of the pattern (sets `width` and `height` as same value). 
	* width:<number> - The width of the pattern for custom patterns (set by `lines`, etc) 
	* height:<number> - The height of the pattern for custom patterns (set by `lines`, etc) 
	* lines:<boolean | PatternLineDef | PatternLineDef[]> - The number of lines to render 
	* circles:<boolean | PatternCircleDef | PatternCircleDef[]> - The number of circles to render 
	* background:<string> - The background color of the pattern 
	* patternContent:<Snippet> - Render as a child of the pattern 
	* children:<Snippet<[ { id: string; pattern: string; } ]>> - undefined 

	## Related

	[LinearGradient](/docs/components/LinearGradient)
	[RadialGradient](/docs/components/RadialGradient)

	@example
	```svelte
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
	```
-->
