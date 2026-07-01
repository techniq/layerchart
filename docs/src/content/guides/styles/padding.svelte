<script lang="ts">
	import { ScatterChart, defaultChartPadding } from 'layerchart';
	import { Icon, Radio, RangeField, Switch, Button } from 'svelte-ux';
	import { flatGroup } from 'd3-array';
	import circleCheck from '~icons/lucide/circle-check';
	import circleX from '~icons/lucide/circle-x';
	import { Code } from '@layerstack/docs/components';
	import { getPenguins } from '$lib/data.remote';
	import { schemeTableau10 } from 'd3-scale-chromatic';

	const colors = schemeTableau10;
	const data = $derived(
		flatGroup(
			(await getPenguins()).filter(
				(d) => d.flipper_length_mm !== 'NA' && d.bill_length_mm !== 'NA'
			),
			(d) => d.species
		)
	);

	const maxPadding = 70;
	let legend = $state(true);
	let axis = $state(true);
	let xNice = $state(true);
	let paddingOption = $state(0);
	let paddingAll = $state(20);
	const defaultPadding = defaultChartPadding() ?? {
		top: 4,
		left: 20,
		bottom: 20,
		right: 4
	};

	let statePadding = $state(defaultPadding);

	// Handle custom padding changes
	function handlePaddingOptionChange() {
		if (paddingOption === 0) {
			statePadding = {
				left: statePadding.left,
				right: statePadding.right,
				bottom: statePadding.bottom,
				top: statePadding.top
			};
		} else if (paddingOption === 1) {
			statePadding = {
				left: paddingAll,
				right: paddingAll,
				bottom: paddingAll,
				top: paddingAll
			};
		}
	}

	// Handle paddingAll changes when in symmetric mode
	function handlePaddingAll() {
		if (paddingOption === 1) {
			statePadding = {
				left: paddingAll,
				right: paddingAll,
				bottom: paddingAll,
				top: paddingAll
			};
		}
	}

	let paddingPseudoCode = $derived.by(() => {
		let code = [];
		let padding = '';
		if (!axis) code.push('axis={false}');
		if (legend) code.push('legend');
		if (!xNice) code.push('xNice');
		if (paddingOption === 0) {
			let pad = [];
			if (statePadding.left !== defaultPadding.left) pad.push(`left: ${statePadding.left}`);
			if (statePadding.right !== defaultPadding.right) pad.push(`right: ${statePadding.right}`);
			if (statePadding.bottom !== defaultPadding.bottom) pad.push(`bottom: ${statePadding.bottom}`);
			if (statePadding.top !== defaultPadding.top) pad.push(`top: ${statePadding.top}`);
			let padding = pad.length ? `${pad.join(',\n\t')}` : '';
			if (padding) code.push(`padding: {{\n\t${padding}\n}}`);
		} else if (paddingOption === 1) code.push(`padding: {${paddingAll}}`);
		return `<ScatterChart ${code.join('\n\t')} />`;
	});

	function resetPadding() {
		statePadding.left = defaultPadding.left;
		statePadding.right = defaultPadding.right;
		statePadding.bottom = defaultPadding.bottom;
		statePadding.top = defaultPadding.top;
		paddingOption = 0;
	}
</script>

<div class="grid grid-cols-[auto_1fr] gap-6">
	<!-- Options -->
	<div class="flex flex-col gap-2">
		<Radio name="padding" value={0} bind:group={paddingOption} on:change={handlePaddingOptionChange}
			>Customize Padding</Radio
		>
		<Radio name="padding" value={1} bind:group={paddingOption} on:change={handlePaddingOptionChange}
			>Symmetric Padding</Radio
		>
		<div class="flex flex-col gap-2">
			<label class="flex gap-2 items-center text-sm">
				<Switch bind:checked={legend}>
					{#if legend}
						<Icon data={circleCheck} class="text-primary" size=".8em" />
					{:else}
						<Icon data={circleX} class="text-surface-content" size=".8em" />
					{/if}
				</Switch>
				<span>Legend</span>
			</label>
			<label class="flex gap-2 items-center text-sm">
				<Switch bind:checked={axis}>
					{#if axis}
						<Icon data={circleCheck} class="text-primary" size=".8em" />
					{:else}
						<Icon data={circleX} class="text-surface-content" size=".8em" />
					{/if}
				</Switch>
				<span>Axis</span>
			</label>
			<label class="flex gap-2 items-center text-sm">
				<Switch bind:checked={xNice}>
					{#if xNice}
						<Icon data={circleCheck} class="text-primary" size=".8em" />
					{:else}
						<Icon data={circleX} class="text-surface-content" size=".8em" />
					{/if}
				</Switch>
				<span>xNice</span>
			</label>
		</div>
	</div>
	<!-- Controls -->
	{#if paddingOption === 1}
		<div class="col-span-2">
			<RangeField
				label="All Sides"
				disabled={false}
				min={0}
				max={maxPadding}
				step={1}
				bind:value={paddingAll}
				on:change={handlePaddingAll}
			/>
		</div>
	{:else}
		<div class="grid grid-cols-[1fr_1fr] gap-2">
			<RangeField
				label="Top"
				min={0}
				max={maxPadding}
				bind:value={statePadding.top}
				on:change={handlePaddingOptionChange}
			/>
			<RangeField label="Bottom" min={0} max={maxPadding} bind:value={statePadding.bottom} />
			<RangeField label="Left" min={0} max={maxPadding} bind:value={statePadding.left} />
			<RangeField label="Right" min={0} max={maxPadding} bind:value={statePadding.right} />
		</div>
	{/if}

	<!-- Code -->
	<div class="col-span-3 relative">
		<Code source={paddingPseudoCode} language="svelte" copyButton={false} />
		<Button
			variant="fill-light"
			color="primary"
			class="absolute top-3 right-3"
			size="sm"
			onclick={resetPadding}>Reset</Button
		>
	</div>
	<ScatterChart
		class="col-span-3"
		{legend}
		{axis}
		{xNice}
		x="flipper_length_mm"
		y="bill_length_mm"
		series={data.map(([species, data], i) => {
			const color = colors[i];
			return {
				label: species + ' 🐧',
				key: species,
				data,
				color,
				props: {
					stroke: color,
					fillOpacity: 0.3
				}
			};
		})}
		props={{
			xAxis: {
				rule: true,
				label: 'Flipper Length (mm)',
				labelProps: {
					dy: -(statePadding.bottom + 5)
				}
			},
			yAxis: {
				rule: true,
				label: 'Bill Length (mm)',
				labelProps: {
					dx: statePadding.left + 5
				}
			}
		}}
		padding={defaultChartPadding({
			axis: axis,
			legend: legend,
			left: statePadding.left,
			right: statePadding.right,
			bottom: statePadding.bottom,
			top: statePadding.top
		})}
		height={400}
	/>
</div>
