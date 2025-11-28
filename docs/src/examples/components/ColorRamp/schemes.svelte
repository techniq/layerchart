<script lang="ts">
	import * as d3chromatic from 'd3-scale-chromatic';
	import { scaleQuantize } from 'd3-scale';

	import { ColorRamp } from 'layerchart';

	let width = $state('100%');
	let height = $state(20);

	const schemes = Object.entries(d3chromatic).filter(([key, value]) =>
		key.startsWith('scheme')
	) as unknown as Array<[name: string, scheme: string[]]>;
</script>

<div class="grid gap-4 h-100">
	{#each schemes as [name, scheme]}
		{#if typeof scheme[0] === 'string'}
			<div>
				<div class="text-sm">{name}</div>
				<svg {width} {height}>
					<ColorRamp
						interpolator={scaleQuantize([0, 1], scheme)}
						{width}
						{height}
						class="[image-rendering:pixelated]"
					/>
				</svg>
			</div>
		{:else}
			{#each scheme as s, i}
				{#if Array.isArray(s)}
					<div>
						<div class="text-sm">{name}[{i}]</div>
						<svg {width} {height}>
							<ColorRamp
								interpolator={scaleQuantize([0, 1], s)}
								{width}
								{height}
								class="[image-rendering:pixelated]"
							/>
						</svg>
					</div>
				{/if}
			{/each}
		{/if}
	{/each}
</div>
