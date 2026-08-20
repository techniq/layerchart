<script lang="ts">
	import { LineChart, type ChartState } from 'layerchart';
	import { format } from '@layerstack/utils';
	import { Button, ButtonGroup } from 'svelte-ux';
	import { createDateSeries } from '$lib/utils/data.js';

	const data = createDateSeries({ count: 30, min: 400, max: 900, value: 'integer' });

	let context = $state<ChartState<(typeof data)[number]>>();

	const dates = data.map((d) => d.date);
	const tooltipData = $derived(context?.tooltip.data);
	const activeIndex = $derived(tooltipData ? dates.findIndex((d) => +d === +tooltipData.date) : -1);

	function step(delta: number) {
		// start at the beginning when nothing is shown
		const next = activeIndex === -1 ? 0 : activeIndex + delta;
		if (next < 0 || next >= dates.length) return;

		// `show({ value })` resolves the nearest point to a domain value, so anything that knows an
		// `x` can drive the tooltip — a button, a keypress, a selection made elsewhere
		context?.tooltip.show({ value: { x: dates[next] } });
	}

	// Built as a single string so the announced text has real separators — CSS margin between
	// elements is invisible to a screen reader
	const statusText = $derived(
		activeIndex >= 0
			? `${format(dates[activeIndex], 'day')} — ${data[activeIndex].value}`
			: 'No day selected'
	);

	function onkeydown(e: KeyboardEvent) {
		// don't hijack keys while the user is typing elsewhere on the page
		const target = e.target as HTMLElement | null;
		if (
			target?.isContentEditable ||
			['INPUT', 'TEXTAREA', 'SELECT'].includes(target?.tagName ?? '')
		)
			return;

		const actions: Record<string, () => void> = {
			ArrowRight: () => step(1),
			ArrowLeft: () => step(-1),
			Escape: () => context?.tooltip.hide()
		};
		const action = actions[e.key];
		if (action) {
			e.preventDefault();
			action();
		}
	}

	export { data };
</script>

<svelte:window {onkeydown} />

<div class="grid gap-2">
	<div class="flex items-center gap-2">
		<ButtonGroup variant="fill-light" size="sm">
			<Button onclick={() => step(-1)}>← Prev</Button>
			<Button onclick={() => step(1)}>Next →</Button>
		</ButtonGroup>
		<Button variant="fill-light" size="sm" onclick={() => context?.tooltip.hide()}>Clear</Button>
	</div>

	<div class="text-sm text-surface-content/70" aria-live="polite">{statusText}</div>

	<LineChart
		bind:context
		{data}
		x="date"
		y="value"
		height={200}
		padding={{ left: 40, bottom: 20 }}
	/>
</div>
