<script module lang="ts">
	import { getCategoryBrands } from '$lib/data.remote.js';
	const allData = await getCategoryBrands();
</script>

<script lang="ts">
	import { Axis, Chart, Group, Image, Layer, Rect, Text } from 'layerchart';
	import { Button, RangeField } from 'svelte-ux';
	import LucidePlay from '~icons/lucide/play';
	import LucidePause from '~icons/lucide/pause';
	import { schemeTableau10 } from 'd3-scale-chromatic';
	import { pairs, rollup, ascending, max, rank } from 'd3-array';
	import { sortFunc } from '@layerstack/utils';



	const n = 12;
	const k = 10;
	const duration = 250;
	const barSize = 32;
	const barGap = 6;

	const topPadding = 20;
	const chartHeight = topPadding + (barSize + barGap) * n - barGap + 20;

	const tweenMotion = { type: 'tween' as const, duration, easing: (t: number) => t };

	function toIconName(name: string): string {
		return name
			.toLowerCase()
			.replace(/-benz/g, '')
			.replace(/[''.é]/g, '')
			.replace(/[\s\-/&]+/g, '');
	}

	// Brands not available in simple-icons
	const missingIcons = new Set([
		'ge',
		'disney',
		'att',
		'marlboro',
		'citi',
		'gillette',
		'compaq',
		'nescaf',
		'heinz',
		'budweiser',
		'xerox',
		'gap',
		'philips',
		'canon',
		'louisvuitton',
		'hm'
	]);

	function logoUrl(name: string): string | undefined {
		const icon = toIconName(name);
		if (missingIcons.has(icon)) return undefined;
		return `https://api.iconify.design/simple-icons/${icon}.svg?color=%23888`;
	}

	const logoSize = 20;

	// Category lookup for enriching frame items
	const categoryByName = $derived(new Map(allData.map((d) => [d.name, d.category])));

	// Build datevalues: [date, Map<name, value>][]
	const datevalues = $derived(
		Array.from(
			rollup(
				allData,
				([d]) => d.value,
				(d) => +d.date,
				(d) => d.name
			)
		)
			.map(([date, data]) => [new Date(date as number), data] as [Date, Map<string, number>])
			.sort(([a], [b]) => ascending(+a, +b))
	);

	const names = $derived(new Set(allData.map((d) => d.name)));

	type FrameItem = { name: string; value: number; rank: number; category: string };

	function computeRanked(allNames: Set<string>, valueFn: (name: string) => number): FrameItem[] {
		const data = Array.from(allNames, (name) => ({
			name,
			value: valueFn(name),
			category: categoryByName.get(name) ?? ''
		}));
		const ranks = rank(data, sortFunc('value', 'desc'));
		return data.map((d, i) => ({ ...d, rank: ranks[i] }));
	}

	// Generate interpolated keyframes (k intermediate frames per year)
	const keyframes = $derived.by(() => {
		if (!datevalues.length) return [];
		const frames: { date: Date; data: FrameItem[] }[] = [];

		for (const [[ka, a], [kb, b]] of pairs(datevalues)) {
			for (let i = 0; i < k; i++) {
				const t = i / k;
				frames.push({
					date: new Date(+ka * (1 - t) + +kb * t),
					data: computeRanked(
						names,
						(name) => (a.get(name) || 0) * (1 - t) + (b.get(name) || 0) * t
					)
				});
			}
		}
		const lastDv = datevalues[datevalues.length - 1];
		frames.push({
			date: lastDv[0],
			data: computeRanked(names, (name) => lastDv[1].get(name) || 0)
		});

		// Collect all brand names that ever appear in top n
		const namesInChart = [
			...new Set(frames.flatMap((f) => f.data.filter((d) => d.rank < n).map((d) => d.name)))
		];

		// Normalize: every frame has same brands in same fixed order
		return frames.map((f) => {
			const dataMap = new Map(f.data.map((d) => [d.name, d]));
			return {
				date: f.date,
				data: namesInChart.map((name) => dataMap.get(name)!)
			};
		});
	});

	let frameIndex = $state(0);
	let isPlaying = $state(false);

	const currentFrame = $derived(keyframes[frameIndex]);
	const currentData = $derived(currentFrame?.data ?? []);
	const currentMax = $derived(max(currentData, (d) => d.value) ?? 1);
	const xDomain = $derived([0, currentMax] as [number, number]);
	const currentDate = $derived(currentFrame?.date);

	$effect(() => {
		if (!isPlaying || !keyframes.length) return;
		const id = setInterval(() => {
			if (frameIndex < keyframes.length - 1) {
				frameIndex++;
			} else {
				isPlaying = false;
			}
		}, duration);
		return () => clearInterval(id);
	});

	function togglePlay() {
		if (isPlaying) {
			isPlaying = false;
		} else {
			if (frameIndex >= keyframes.length - 1) frameIndex = 0;
			isPlaying = true;
		}
	}

	const yPos = (rank: number) => barGap + rank * (barSize + barGap);

	export { allData as data };
</script>

<div class="grid grid-cols-[100px_1fr] items-center gap-3 mb-2">
	{#key isPlaying}
		<Button
			icon={isPlaying ? LucidePause : LucidePlay}
			variant="outline"
			size="sm"
			on:click={togglePlay}
		>
			{isPlaying ? 'Pause' : 'Play'}
		</Button>
	{/key}
	<RangeField
		label={String(currentDate?.getFullYear() ?? '')}
		bind:value={frameIndex}
		min={0}
		max={Math.max(0, keyframes.length - 1)}
		class="flex-1"
	/>
</div>

<Chart
	data={currentData}
	x="value"
	{xDomain}
	c="category"
	cRange={schemeTableau10}
	padding={{ left: 0, right: 80, top: 20, bottom: 0 }}
	height={chartHeight}
>
	{#snippet children({ context })}
		<Layer>
			{#each currentData as d (d.name)}
				{@const barWidth = Math.max(0, context.xScale(d.value))}
				{@const visible = d.rank < n}
				{@const logo = logoUrl(d.name)}
				<Group x={0} y={yPos(d.rank)} opacity={visible ? 0.8 : 0} motion={tweenMotion}>
					<Rect
						x={0}
						y={0}
						width={barWidth}
						height={barSize}
						fill={context.cGet(d)}
						rx={2}
						motion={{ width: tweenMotion }}
					/>
					{#if logo}
						<Image
							href={logo}
							x={barWidth + logoSize / 2 + 4}
							y={barSize / 2}
							width={logoSize}
							height={logoSize}
							preserveAspectRatio="xMidYMid meet"
							motion={{ x: tweenMotion }}
						/>
					{/if}
					<Text
						x={barWidth - 6}
						y={barSize / 2 - 6}
						textAnchor="end"
						verticalAnchor="middle"
						value={d.name}
						class="text-xs font-semibold fill-white text-shadow-md"
						motion={tweenMotion}
					/>
					<Text
						x={barWidth - 6}
						y={barSize / 2 + 7}
						textAnchor="end"
						verticalAnchor="middle"
						value={d.value}
						format="integer"
						class="text-[10px] fill-white/70 tabular-nums text-shadow-md"
						motion={tweenMotion}
					/>
				</Group>
			{/each}

			<Axis
				placement="top"
				grid={{ class: 'stroke-surface-content/10' }}
				format="metric"
				tickSpacing={100}
				motion={tweenMotion}
			/>

			<Text
				x={context.xRange[1]}
				y={chartHeight - 40}
				textAnchor="end"
				value={String(currentDate?.getFullYear() ?? '')}
				class="text-6xl font-bold tabular-nums fill-surface-content/10"
			/>
		</Layer>
	{/snippet}
</Chart>
