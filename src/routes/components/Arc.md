---
title: ['Primatives', 'Arc']
---

<script lang="ts">
	import { mdiChevronLeft, mdiChevronRight } from '@mdi/js';

	import {
		Button,
		Field,
		SelectField,
		Switch
	} from 'svelte-ux';

	import Chart, { Svg } from '$lib/components/Chart.svelte';
	import Arc from '$lib/components/Arc.svelte';
	import Group from '$lib/components/Group.svelte';
	import LinearGradient from '$lib/components/LinearGradient.svelte';
	import Text from '$lib/components/Text.svelte';

	import Preview from '$lib/docs/Preview.svelte';

	let value = 50;
	// let value = 100;
	let domain = [0, 100];
	// let range = [-120, 120];
	let range = [0, 360];
	let innerRadius = 50;
	let outerRadius = 60;
	let cornerRadius = 5;
	let padAngle = 0;
	let padRadius = 0;

	let spring = true;

	const labelOptions = [
		{ name: 'None', value: undefined },
		{ name: 'SVG Center', value: 'svg-center'},
		{ name: 'Arc Center', value: 'arc-center'},
		{ name: 'Arc Bottom', value: 'arc-bottom'},
		{ name: 'Arc Centroid', value: 'arc-centroid'},
	]
	let label = 'svg-center';

	function prev(options, current) {
		const index = options.findIndex(x => x.value === current);
		if (index === 0) {
			return options[options.length - 1].value
		} else {
			return options[index - 1].value
		}
	}

	function next(options, current) {
		const index = options.findIndex(x => x.value === current);
		if (index === options.length - 1) {
			return options[0].value
		} else {
			return options[index + 1].value
		}
	}
</script>

<div class="grid grid-cols-[1fr,1fr,1fr,1fr] gap-2 sticky top-0 z-10">
	<Field label="Value" let:id class="col-span-3">
		<Button icon={mdiChevronLeft} on:click={() => value -= 1} class="mr-2" />
		<input type="range" bind:value={value} min={domain[0]} max={domain[1]} {id} class="h-6 w-full" /> <span class="ml-4 text-sm text-black/50">{value}</span>
		<Button icon={mdiChevronRight} on:click={() => value += 1} class="ml-2" />
	</Field>
	<!--  -->
	<Field label="Use spring" let:id>
		<Switch bind:checked={spring} {id} />
	</Field>
	<!--  -->
	<!-- <Field label="Label" let:id>
		<Button icon={mdiChevronLeft} on:click={() => label = prev(labelOptions, label)} class="mr-2" />
		<select bind:value={label} class="w-full outline-none appearance-none text-sm" {id}>
			{#each labelOptions as option}
				<option value={option.value}>{option.name}</option>
			{/each}
		</select>
		<Button icon={mdiChevronRight} on:click={() => label = next(labelOptions, label)} class="ml-2" />
	</Field> -->
	<!--  -->
	<Field label="Domain Min" let:id>
		<Button icon={mdiChevronLeft} on:click={() => domain[0] -= 1} class="mr-2" />
		<input type="range" bind:value={domain[0]} min={0} max={domain[1]} {id} class="h-6 w-full" /> <span class="ml-4 text-sm text-black/50">{domain[0]}</span>
		<Button icon={mdiChevronRight} on:click={() => domain[0] += 1} class="ml-2" />
	</Field>
	<!--  -->
	<Field label="Domain Max" let:id>
		<Button icon={mdiChevronLeft} on:click={() => domain[1] -= 1} class="mr-2" />
		<input type="range" bind:value={domain[1]} min={0} max={1000} {id} class="h-6 w-full" /> <span class="ml-4 text-sm text-black/50">{domain[1]}</span>
		<Button icon={mdiChevronRight} on:click={() => domain[1] += 1} class="ml-2" />
	</Field>
	<!--  -->
	<Field label="Range Min (degrees)" let:id>
		<Button icon={mdiChevronLeft} on:click={() => range[0] -= 1} class="mr-2" />
		<input type="range" bind:value={range[0]} min={-360} max={360} {id} class="h-6 w-full" /> <span class="ml-4 text-sm text-black/50">{range[0]}</span>
		<Button icon={mdiChevronRight} on:click={() => range[0] += 1} class="ml-2" />
	</Field>
	<!--  -->
	<Field label="Range Max (degrees)" let:id>
		<Button icon={mdiChevronLeft} on:click={() => range[1] -= 1} class="mr-2" />
		<input type="range" bind:value={range[1]} min={-360} max={360} {id} class="h-6 w-full" /> <span class="ml-4 text-sm text-black/50">{range[1]}</span>
		<Button icon={mdiChevronRight} on:click={() => range[1] += 1} class="ml-2" />
	</Field>
	<!--  -->
	<Field label="Inner radius" let:id>
		<Button icon={mdiChevronLeft} on:click={() => innerRadius -= 1} class="mr-2" />
		<input type="range" bind:value={innerRadius} min={0} max={outerRadius} {id} class="h-6 w-full" /> <span class="ml-4 text-sm text-black/50">{innerRadius}</span>
		<Button icon={mdiChevronRight} on:click={() => innerRadius += 1} class="ml-2" />
	</Field>
	<!--  -->
	<Field label="Outer radius" let:id>
		<Button icon={mdiChevronLeft} on:click={() => outerRadius -= 1} class="mr-2" />
		<input type="range" bind:value={outerRadius} min={innerRadius} max={200} {id} class="h-6 w-full" /> <span class="ml-4 text-sm text-black/50">{outerRadius}</span>
		<Button icon={mdiChevronRight} on:click={() => outerRadius += 1} class="ml-2" />
	</Field>
	<!--  -->
	<Field label="Corner radius" let:id>
		<Button icon={mdiChevronLeft} on:click={() => cornerRadius -= 1} class="mr-2" />
		<input type="range" bind:value={cornerRadius} min={0} max={(outerRadius - innerRadius) / 2} {id} class="h-6 w-full" /> <span class="ml-4 text-sm text-black/50">{cornerRadius}</span>
		<Button icon={mdiChevronRight} on:click={() => cornerRadius += 1} class="ml-2" />
	</Field>
	<!--  -->
	<Field label="Pad angle" let:id>
		<Button icon={mdiChevronLeft} on:click={() => padAngle -= 0.1} class="mr-2" />
		<input type="range" bind:value={padAngle} min={0} max={2} step={0.1} {id} class="h-6 w-full" /> <span class="ml-4 text-sm text-black/50">{padAngle}</span>
		<Button icon={mdiChevronRight} on:click={() => padAngle += 0.1} class="ml-2" />
	</Field>
	<!--  -->
	<!-- <Field label="Pad radius" let:id>
		<Button icon={mdiChevronLeft} on:click={() => padRadius -= 0.1} class="mr-2" />
		<input type="range" bind:value={padRadius} min={0} max={2} step={0.1} {id} class="h-6 w-full" /> <span class="ml-4 text-sm text-black/50">{padRadius}</span>
		<Button icon={mdiChevronRight} on:click={() => padRadius += 0.1} class="ml-2" />
	</Field> -->
</div>

## Playground

<Preview>
	<div class="h-[200px] p-4 border rounded">
		<Chart>
<Svg>
      <LinearGradient
        id="arcGradient"
        from="hsl(60 100% 50%)"
        to="hsl(140 100% 50%)"
        vertical
      />
      <Group center>
        {#key spring}
          <Arc
            {value}
            {domain}
            {range}
            {innerRadius}
            {outerRadius}
            {cornerRadius}
            {padAngle}
            {label}
            {spring}
            let:value
            let:boundingBox
            fill="url(#arcGradient)"
            track={{ fill: 'hsl(0 0% 0% / 6% )' }}
          >
            <Text
              value={Math.round(value)}
              textAnchor="middle"
              verticalAnchor="middle"
              style="font-size: 2.25em"
              dy={8}
            />
          </Arc>
        {/key}
      </Group>
    </Svg>
		</Chart>
	</div>
</Preview>

## Partial Arc

<Preview>
	<div class="h-[200px] p-4 border rounded">
		<Chart>
			<Svg>
				<LinearGradient id="arcGradient2" from="hsl(80 100% 50%)" to="hsl(200 100% 50%)" />
				<Group center>
					<Arc
						{value}
						{domain}
						range={[-120, 120]}
						{innerRadius}
						{outerRadius}
						{cornerRadius}
						{padAngle}
						{label}
						spring
						let:value
						fill="url(#arcGradient2)"
						track={{ fill: 'none', stroke: 'hsl(0 0% 0% / 10%)' }}
					>
						<Text
							value={Math.round(value)}
							textAnchor="middle"
							verticalAnchor="middle"
							style="font-size: 2.25em"
						/>
					</Arc>
				</Group>
			</Svg>
		</Chart>
	</div>
</Preview>

## Label location

<!-- {#if label === 'svg-center'}
	<text dy={16}>
		{Math.round($tweened_value)}
	</text>
{/if} -->

<!-- {#if label === 'arc-center'}
	<text x={labelArcCenterOffset.x} y={labelArcCenterOffset.y} dy={16}>
		{Math.round($tweened_value)}
	</text>
{/if} -->

<!-- {#if label === 'arc-bottom'}
	<text x={labelArcBottomOffset.x} y={labelArcBottomOffset.y} dy={0}>
		{Math.round($tweened_value)}
	</text>
{/if} -->

<!-- {#if label === 'arc-centroid'}
	<text x={trackArcCentroid[0]} y={trackArcCentroid[1]} dy={16}>
		{Math.round($tweened_value)}
	</text>
{/if} -->

<Preview>
	<div class="h-[200px] p-4 border rounded">
		<Chart>
			<Svg>
				<Group center>
					<LinearGradient id="arcGradient3" from="hsl(80, 100%, 50%)" to="hsl(200, 100%, 50%)" vertical />
					<Arc {value} {domain} {range} {innerRadius} {outerRadius} {cornerRadius} {padAngle} {label} let:boundingBox fill="url(#arcGradient3)">
						<!-- svg center -->
						<!-- <Text
							value={Math.round(value)}
							textAnchor="middle"
							verticalAnchor="middle"
							style="font-size: 2.25em"
							dy={8}
						/> -->
						<!-- arc center -->
						<Text
							value={Math.round(value)}
							textAnchor="middle"
							verticalAnchor="middle"
							style="font-size: 2.25em"
							x={outerRadius - boundingBox.width / 2}
							y={(outerRadius - boundingBox.height / 2) * -1}
							dy={8}
						/>
						<!-- <Text {value} textAnchor="middle" verticalAnchor="middle" class="text-4xl" capHeight="1.5rem" /> -->
						<!-- <Text {value} textAnchor="middle" verticalAnchor="middle" style="font-size: 4.5em" capHeight="3.1em" /> -->
					</Arc>
				</Group>
			</Svg>
		</Chart>
	</div>
</Preview>
