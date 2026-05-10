<script lang="ts">
	import { Axis, Chart, Layer, Rect } from 'layerchart';
	import { Field, MenuField, RangeField, ToggleGroup, ToggleOption } from 'svelte-ux';

	let valueMode = $state<'data' | 'pixel'>('pixel');
	let propsMode = $state<'position-size' | 'edges'>('position-size');
	let pixelPosition = $state({
		x: 80,
		y: 56,
		width: 240,
		height: 160
	});
	let dataPosition = $state({
		x: 20,
		y: 25,
		width: 240,
		height: 160
	});
	let pixelEdges = $state({
		x0: 80,
		y0: 56,
		x1: 320,
		y1: 216
	});
	let dataEdges = $state({
		x0: 18,
		y0: 18,
		x1: 82,
		y1: 78
	});
	let corners = $state({
		topLeft: 32,
		topRight: 8,
		bottomRight: 40,
		bottomLeft: 16
	});

	const propsOptions = [
		{ label: 'x / y / width / height', value: 'position-size' },
		{ label: 'x0 / y0 / x1 / y1', value: 'edges' }
	];

	const data = $derived([propsMode === 'position-size' ? dataPosition : dataEdges]);
	const x = $derived(propsMode === 'position-size' ? 'x' : ['x0', 'x1']);
	const y = $derived(propsMode === 'position-size' ? 'y' : ['y0', 'y1']);
	let context = $state<any>();
	let previousValueMode = valueMode;

	function toPixel(scale: any, value: number) {
		return Math.round(Number(scale?.(value) ?? value));
	}

	function toData(scale: any, value: number) {
		return Math.round(Number(scale?.invert?.(value) ?? value));
	}

	$effect(() => {
		const nextValueMode = valueMode;
		if (!context || nextValueMode === previousValueMode) return;

		if (nextValueMode === 'data') {
			if (propsMode === 'position-size') {
				dataPosition.x = toData(context.xScale, pixelPosition.x);
				dataPosition.y = toData(context.yScale, pixelPosition.y);
				dataPosition.width = pixelPosition.width;
				dataPosition.height = pixelPosition.height;
			} else {
				dataEdges.x0 = toData(context.xScale, pixelEdges.x0);
				dataEdges.y0 = toData(context.yScale, pixelEdges.y0);
				dataEdges.x1 = toData(context.xScale, pixelEdges.x1);
				dataEdges.y1 = toData(context.yScale, pixelEdges.y1);
			}
		} else if (propsMode === 'position-size') {
			pixelPosition.x = toPixel(context.xScale, dataPosition.x);
			pixelPosition.y = toPixel(context.yScale, dataPosition.y);
			pixelPosition.width = dataPosition.width;
			pixelPosition.height = dataPosition.height;
		} else {
			pixelEdges.x0 = toPixel(context.xScale, dataEdges.x0);
			pixelEdges.y0 = toPixel(context.yScale, dataEdges.y0);
			pixelEdges.x1 = toPixel(context.xScale, dataEdges.x1);
			pixelEdges.y1 = toPixel(context.yScale, dataEdges.y1);
		}

		previousValueMode = nextValueMode;
	});
</script>

<div class="grid grid-cols-2 gap-2 mb-2 screenshot-hidden">
	<Field label="Mode" classes={{ input: 'mt-[6px] mb-1' }}>
		<ToggleGroup bind:value={valueMode} variant="outline" size="sm" inset class="w-full">
			<ToggleOption value="data">data</ToggleOption>
			<ToggleOption value="pixel">pixel</ToggleOption>
		</ToggleGroup>
	</Field>

	<MenuField
		label="Props"
		options={propsOptions}
		bind:value={propsMode}
		stepper
		classes={{ menuIcon: 'hidden' }}
	/>
</div>

<div class="grid grid-cols-4 gap-2 mb-2 screenshot-hidden">
	{#if propsMode === 'position-size' && valueMode === 'pixel'}
		<RangeField label="x" bind:value={pixelPosition.x} min={0} max={360} />
		<RangeField label="y" bind:value={pixelPosition.y} min={0} max={220} />
		<RangeField label="width" bind:value={pixelPosition.width} min={20} max={360} />
		<RangeField label="height" bind:value={pixelPosition.height} min={20} max={240} />
	{:else if propsMode === 'position-size'}
		<RangeField label="x" bind:value={dataPosition.x} min={0} max={100} />
		<RangeField label="y" bind:value={dataPosition.y} min={0} max={100} />
		<RangeField label="width" bind:value={dataPosition.width} min={20} max={360} />
		<RangeField label="height" bind:value={dataPosition.height} min={20} max={240} />
	{:else if valueMode === 'pixel'}
		<RangeField label="x0" bind:value={pixelEdges.x0} min={0} max={400} />
		<RangeField label="y0" bind:value={pixelEdges.y0} min={0} max={260} />
		<RangeField label="x1" bind:value={pixelEdges.x1} min={0} max={400} />
		<RangeField label="y1" bind:value={pixelEdges.y1} min={0} max={260} />
	{:else}
		<RangeField label="x0" bind:value={dataEdges.x0} min={0} max={100} />
		<RangeField label="y0" bind:value={dataEdges.y0} min={0} max={100} />
		<RangeField label="x1" bind:value={dataEdges.x1} min={0} max={100} />
		<RangeField label="y1" bind:value={dataEdges.y1} min={0} max={100} />
	{/if}
</div>

<div class="grid grid-cols-4 gap-2 mb-2 screenshot-hidden">
	<RangeField label="topLeft" bind:value={corners.topLeft} min={0} max={80} />
	<RangeField label="topRight" bind:value={corners.topRight} min={0} max={80} />
	<RangeField label="bottomRight" bind:value={corners.bottomRight} min={0} max={80} />
	<RangeField label="bottomLeft" bind:value={corners.bottomLeft} min={0} max={80} />
</div>

<Chart
	{data}
	{x}
	{y}
	xDomain={[0, 100]}
	yDomain={[0, 100]}
	padding={{ top: 16, right: 16, bottom: 24, left: 28 }}
	height={340}
	bind:context
>
	<Layer>
		<Axis placement="bottom" rule />
		<Axis placement="left" rule />
		{#if propsMode === 'position-size' && valueMode === 'pixel'}
			<Rect {...pixelPosition} {corners} fill="var(--color-primary)" />
		{:else if propsMode === 'position-size'}
			<Rect x="x" y="y" width="width" height="height" {corners} fill="var(--color-primary)" />
		{:else if valueMode === 'pixel'}
			<Rect {...pixelEdges} {corners} fill="var(--color-primary)" />
		{:else}
			<Rect x0="x0" y0="y0" x1="x1" y1="y1" {corners} fill="var(--color-primary)" />
		{/if}
	</Layer>
</Chart>
