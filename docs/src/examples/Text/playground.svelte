<script lang="ts">
	import { Chart, Layer, Text, Circle } from 'layerchart';
	import type { ComponentProps } from 'svelte';
	import TextPlaygroundControls from '$lib/components/TextPlaygroundControls.svelte';
	import { toTitleCase } from '@layerstack/utils';

	let config = $state({
		x: 0,
		y: 0,
		value: 'This is really long text',
		width: 300,
		textAnchor: 'start' as ComponentProps<typeof Text>['textAnchor'],
		verticalAnchor: 'start' as ComponentProps<typeof Text>['verticalAnchor'],
		lineHeight: '1em',
		rotate: 0,
		scaleToFit: false,
		showAnchor: true,
		resizeSvg: true
	});

	let truncate = $state(false);

	type TruncateOptions = Exclude<ComponentProps<typeof Text>['truncate'], undefined | boolean>;
	const truncateOptions = $state<TruncateOptions>({
		maxChars: 22,
		ellipsis: '…',
		position: 'end'
	});

	const data = undefined;
	export { data };
</script>

<TextPlaygroundControls bind:config />
<div class="grid grid-cols-3">
	{#each ['svg', 'canvas', 'html'] as const as type}
		<div>
			<h2 class="text-center">{toTitleCase(type)}</h2>
			<div class="flex items-center justify-center bg-surface-100 p-4">
				<div
					class="h-56 border border-surface-content/10"
					style:width="{config.resizeSvg ? config.width : 300}px"
				>
					<Chart height={224}>
						<Layer {type}>
							<Text {...config} truncate={truncate ? truncateOptions : false} />
							{#if config.showAnchor}
								<Circle cx={config.x} cy={config.y} r={2} fill="red" />
							{/if}
						</Layer>
					</Chart>
				</div>
			</div>
		</div>
	{/each}
</div>
