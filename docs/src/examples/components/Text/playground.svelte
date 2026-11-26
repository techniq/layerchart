<script lang="ts">
	// `@layerchart/webgl`'s `Layer` draws any of the four, and its marks in each
	import { Chart, Layer, Text, Circle } from '@layerchart/webgl';
	import type { ComponentProps } from 'svelte';
	import TextPlaygroundControls from '$lib/components/controls/TextPlaygroundControls.svelte';
	import { toTitleCase } from '@layerstack/utils';

	type TruncateOptions = Exclude<ComponentProps<typeof Text>['truncate'], undefined | boolean>;
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
		resizeSvg: true,
		truncate: false,
		truncateOptions: {
			maxChars: 22,
			minChars: 0,
			ellipsis: '…',
			position: 'end'
		} as TruncateOptions
	});

	const data = undefined;
	export { data };
</script>

<TextPlaygroundControls bind:config />

<div class="grid grid-cols-2">
	{#each ['svg', 'canvas', 'html', 'webgl'] as const as type}
		<div>
			<h2 class="text-center">{type === 'webgl' ? 'WebGL' : toTitleCase(type)}</h2>
			<div class="flex items-center justify-center bg-surface-100 p-4">
				<div
					class="h-56 border border-surface-content/10"
					style:width="{config.resizeSvg ? config.width : 300}px"
				>
					<Chart height={224}>
						<Layer {type}>
							<Text {...config} truncate={config.truncate ? config.truncateOptions : false} />
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
