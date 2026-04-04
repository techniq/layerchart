<script lang="ts">
	import { getChartContext, isScaleBand, Line } from 'layerchart';

	let {
		xTicks: xTicksProp,
		yTicks: yTicksProp,
		gridColor = 'rgba(0,0,0,0.08)',
		tickColor = 'rgba(0,0,0,0.4)',
		showXAxis = true,
		showYAxis = true,
		showGrid = true
	}: {
		xTicks?: number;
		yTicks?: number;
		gridColor?: string;
		tickColor?: string;
		showXAxis?: boolean;
		showYAxis?: boolean;
		showGrid?: boolean;
	} = $props();

	const ctx = getChartContext();

	const yTickValues = $derived.by(() => {
		if (isScaleBand(ctx.yScale)) {
			return ctx.yScale.domain();
		}
		return ctx.yScale.ticks?.(yTicksProp ?? 5) ?? [];
	});

	const xTickValues = $derived.by(() => {
		if (isScaleBand(ctx.xScale)) {
			return ctx.xScale.domain();
		}
		return ctx.xScale.ticks?.(xTicksProp ?? 5) ?? [];
	});

	function yPos(tick: any) {
		const val = ctx.yScale(tick);
		return isScaleBand(ctx.yScale) ? val + ctx.yScale.bandwidth() / 2 : val;
	}
</script>

<!-- Horizontal grid lines -->
{#if showGrid}
	{#each yTickValues as tick}
		<Line x1={0} y1={yPos(tick)} x2={ctx.width} y2={yPos(tick)} stroke={gridColor} strokeWidth={1} />
	{/each}
{/if}

<!-- X-axis baseline -->
{#if showXAxis}
	<Line x1={0} y1={ctx.height} x2={ctx.width} y2={ctx.height} stroke={tickColor} strokeWidth={1} />
{/if}

<!-- Y-axis baseline -->
{#if showYAxis}
	<Line x1={0} y1={0} x2={0} y2={ctx.height} stroke={tickColor} strokeWidth={1} />
{/if}

<!-- Y-axis tick marks -->
{#if showYAxis}
	{#each yTickValues as tick}
		<Line x1={-4} y1={yPos(tick)} x2={0} y2={yPos(tick)} stroke={tickColor} strokeWidth={1} />
	{/each}
{/if}

<!-- X-axis tick marks -->
{#if showXAxis}
	{#each xTickValues as tick}
		{@const val = ctx.xScale(tick)}
		{@const x = isScaleBand(ctx.xScale) ? val + ctx.xScale.bandwidth() / 2 : val}
		<Line x1={x} y1={ctx.height} x2={x} y2={ctx.height + 4} stroke={tickColor} strokeWidth={1} />
	{/each}
{/if}
