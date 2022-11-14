<script lang="ts">
	import { getContext } from 'svelte';
	import { spring } from 'svelte/motion';
	import { fade } from 'svelte/transition';
	import { writable } from 'svelte/store';

	import { tooltipContext } from './Tooltip.svelte';
	import { Html } from 'layercake';

	export let topOffset = 10;
	export let leftOffset = 10;
	export let contained: 'container' | false = 'container'; // TODO: Support 'window' using getBoundingClientRect()
	export let animate = true;

	export let header: (data: any) => any = undefined;

	const { width, height, padding } = getContext('LayerCake');
	const tooltip = tooltipContext();

	let tooltipWidth = 0;
	let tooltipHeight = 0;

	let top = animate ? spring($tooltip.top) : writable($tooltip.top);
	$: if ($tooltip) {
		const containerHeight = $height + $padding.bottom;

		if (contained === 'container' && $tooltip.top + topOffset + tooltipHeight > containerHeight) {
			// change side
			$top = $tooltip.top - (topOffset + tooltipHeight);
		} else {
			$top = $tooltip.top + topOffset;
		}
	}

	let left = animate ? spring($tooltip.left) : writable($tooltip.left);
	$: if ($tooltip) {
		const containerWidth = $width + $padding.right;

		if (contained === 'container' && $tooltip.left + leftOffset + tooltipWidth > containerWidth) {
			// change side
			$left = $tooltip.left - (leftOffset + tooltipWidth);
		} else {
			$left = $tooltip.left + leftOffset;
		}
	}
</script>

<Html>
	{#if $tooltip.data}
		<div
			class="absolute pointer-events-none z-50"
			style="
		top: {$top}px;
		left: {$left}px;
		max-width: {$width / 2}px;
	"
			transition:fade={{ duration: 100 }}
			bind:clientWidth={tooltipWidth}
			bind:clientHeight={tooltipHeight}
		>
			<!-- <slot data={tooltip?.data} /> -->

			<div
				class="bg-gray-900/90 backdrop-filter backdrop-blur-[2px] text-white rounded elevation-1 px-2 py-1"
			>
				{#if header || $$slots.header}
					<div class="text-center font-semibold pb-1 whitespace-nowrap">
						<slot name="header">
							{header($tooltip.data)}
						</slot>
					</div>
				{/if}

				<div class="grid grid-cols-[1fr,auto] gap-x-2 gap-y-1 items-center">
					<slot data={$tooltip.data} />
				</div>
			</div>
		</div>
	{/if}
</Html>
