<script lang="ts">
	import { ScatterChart, defaultChartPadding } from 'layerchart';
	import { Icon, Radio, RangeField, Switch } from 'svelte-ux';
	import { flatGroup } from 'd3-array';
	import circleCheck from '~icons/lucide/circle-check';
	import circleX from '~icons/lucide/circle-x';
	import Code from '$lib/components/Code.svelte';
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

	// Individual padding state variables
	const defaults = defaultChartPadding() ?? { left: 20, right: 4, bottom: 20, top: 4 };
	let leftState = $state(defaults.left);
	let rightState = $state(defaults.right);
	let bottomState = $state(defaults.bottom);
	let topState = $state(defaults.top);

	// Derived padding values - use paddingAll when in symmetric mode
	let left = $derived(paddingOption === 2 ? paddingAll : leftState);
	let right = $derived(paddingOption === 2 ? paddingAll : rightState);
	let bottom = $derived(paddingOption === 2 ? paddingAll : bottomState);
	let top = $derived(paddingOption === 2 ? paddingAll : topState);

	// Handle padding option changes (paddingOption is already updated by bind:group)
	function handlePaddingOptionChange() {
		const defaults = defaultChartPadding() ?? { left: 20, right: 4, bottom: 20, top: 4 };

		if (paddingOption !== 2) {
			leftState = defaults.left;
			rightState = defaults.right;
			bottomState = defaults.bottom;
			topState = defaults.top;
		}
		// For paddingOption === 1 (Customize), we keep the current values
	}

	let paddingCode = $derived.by(() => {
		if (paddingOption === 0 /* Default Padding */) {
			return `<ScatterChart ${!xNice ? 'xNice={false}  ' : ' '}/>`;
		} else if (paddingOption === 1 /* Customize Default Padding */) {
			return `<ScatterChart
	padding={{
		...defaultChartPadding(${!axis ? 'axis={false}' : ''}${!axis && !legend ? ', ' : ''}${!legend ? 'legend={false}' : ''}),
		left: ${left},
		right: ${right},
		bottom: ${bottom},
		top: ${top},
	}}
/>`;
		} else if (paddingOption === 2 /* Symmetric Padding */) {
			return `<ScatterChart padding={${paddingAll}} />`;
		} else if (paddingOption === 3 /* Nice Padding */) {
			return `<ScatterChart xNice={${xNice}} />`;
		}
		return `<ScatterChart />`; // Default fallback
	});
</script>

<div class="grid grid-cols-[auto_200px_1fr] gap-4">
	<!-- Options -->
	<div class="options flex flex-col gap-2">
		<Radio name="padding" value={0} bind:group={paddingOption} on:change={handlePaddingOptionChange}
			>Default Padding</Radio
		>
		<Radio name="padding" value={1} bind:group={paddingOption} on:change={handlePaddingOptionChange}
			>Customize Default Padding</Radio
		>
		<Radio name="padding" value={2} bind:group={paddingOption} on:change={handlePaddingOptionChange}
			>Symmetric Padding</Radio
		>
		<hr class="my-2" />
		<label class="flex gap-2 items-center text-sm pl-6">
			<span class="w-14 text-right">Legend</span>
			<Switch bind:checked={legend}>
				{#if legend}
					<Icon data={circleCheck} class="text-primary" size=".8em" />
				{:else}
					<Icon data={circleX} class="text-surface-content" size=".8em" />
				{/if}
			</Switch>
		</label>
		<label class="flex gap-2 items-center text-sm pl-6">
			<span class="w-14 text-right">Axis</span>
			<Switch bind:checked={axis}>
				{#if axis}
					<Icon data={circleCheck} class="text-primary" size=".8em" />
				{:else}
					<Icon data={circleX} class="text-surface-content" size=".8em" />
				{/if}
			</Switch>
		</label>
		<label class="flex gap-2 items-center text-sm pl-6 text-right">
			<span class="w-14 text-right">xNice</span>
			<Switch bind:checked={xNice}>
				{#if xNice}
					<Icon data={circleCheck} class="text-primary" size=".8em" />
				{:else}
					<Icon data={circleX} class="text-surface-content" size=".8em" />
				{/if}
			</Switch>
		</label>
	</div>
	<!-- Controls -->
	<div class="h-[200px]">
		{#if paddingOption === 2}
			<RangeField
				label="All Sides"
				disabled={false}
				min={0}
				max={maxPadding}
				step={1}
				bind:value={paddingAll}
			/>
		{:else}
			<RangeField
				label="Top"
				disabled={paddingOption === 0}
				min={defaultChartPadding()?.top}
				max={maxPadding}
				bind:value={topState}
			/>
			<RangeField
				label="Right"
				disabled={paddingOption === 0}
				min={defaultChartPadding()?.right}
				max={maxPadding}
				bind:value={rightState}
			/>
			<RangeField
				label="Bottom"
				disabled={paddingOption === 0}
				min={defaultChartPadding()?.bottom}
				max={maxPadding}
				bind:value={bottomState}
			/>
			<RangeField
				label="Left"
				disabled={paddingOption === 0}
				min={defaultChartPadding()?.left}
				max={maxPadding}
				bind:value={leftState}
			/>
		{/if}
	</div>
	<!-- Code -->
	<div>
		<Code source={paddingCode} language="svelte" copyButton={false} />
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
					dy: -(bottom + 5)
				}
			},
			yAxis: {
				rule: true,
				label: 'Bill Length (mm)',
				labelProps: {
					dx: left + 5
				}
			}
		}}
		padding={{ ...defaultChartPadding(axis, legend), left, right, bottom, top }}
		height={400}
	/>
</div>
