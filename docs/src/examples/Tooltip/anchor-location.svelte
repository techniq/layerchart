<script lang="ts">
	import { Area, Axis, Chart, Layer, Highlight, Tooltip } from 'layerchart';
	import { createDateSeries } from '$lib/utils/data.js';
	import { Button, Field, Menu, MenuField, Toggle } from 'svelte-ux';
	import type { ComponentProps } from 'svelte';

	const data = createDateSeries({
		count: 30,
		min: 20,
		max: 100,
		value: 'integer',
		keys: ['value', 'baseline']
	});
	export { data };

	const anchorOptions = [
		'top-left',
		'top',
		'top-right',
		'left',
		'center',
		'right',
		'bottom-left',
		'bottom',
		'bottom-right'
	] as const;
	let anchor: ComponentProps<typeof Tooltip.Root>['anchor'] = $state('top-left');
	let snap: 'pointer' | 'data' = $state('pointer');
	let contained: ComponentProps<typeof Tooltip.Root>['contained'] = $state(false);
</script>

<div class="grid grid-cols-3 gap-2 mb-4">
	<Toggle let:on={open} let:toggle>
		<Field label="Anchor" class="cursor-pointer" on:click={toggle}>
			<span class="text-sm">
				{anchor}
			</span>
		</Field>

		<Menu {open} on:close={toggle} placement="bottom-start">
			<div class="grid grid-cols-3 gap-1 p-1">
				{#each anchorOptions as option}
					<Button
						variant="outline"
						color={option === anchor ? 'primary' : 'default'}
						on:click={() => (anchor = option)}
					>
						{option}
					</Button>
				{/each}
			</div>
		</Menu>
	</Toggle>
	<MenuField
		label="Snap"
		bind:value={snap}
		options={[
			{ label: 'pointer', value: 'pointer' },
			{ label: 'data', value: 'data' }
		]}
	/>

	<MenuField
		label="Contained"
		bind:value={contained}
		options={[
			{ label: 'none', value: false },
			{ label: 'container', value: 'container' },
			{ label: 'window', value: 'window' }
		]}
	/>
</div>

<Chart
	{data}
	x="date"
	y="value"
	yDomain={[0, null]}
	yNice
	padding={{ left: 16, bottom: 24 }}
	tooltip={{ mode: 'quadtree-x' }}
	height={300}
>
	<Layer>
		<Axis placement="left" grid rule />
		<Axis placement="bottom" rule />
		<Area class="fill-primary/30" line={{ class: 'stroke-primary stroke-2' }} />
		<Highlight points lines />
	</Layer>
	<Tooltip.Root
		{anchor}
		x={snap}
		xOffset={['top', 'center', 'bottom'].includes(anchor ?? '') ? 0 : 10}
		y={snap}
		yOffset={['left', 'center', 'right'].includes(anchor ?? '') ? 0 : 10}
		{contained}
	>
		{#snippet children({ data })}
			<Tooltip.Header value={data.date} format="day" />
			<Tooltip.List>
				<Tooltip.Item label="value" value={data.value} />
			</Tooltip.List>
		{/snippet}
	</Tooltip.Root>
</Chart>
