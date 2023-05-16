<script lang="ts">
	import { ApiDocs } from 'svelte-ux';

	import api from '$lib/components/Text.svelte?raw&sveld';

	import Text from '$lib/components/Text.svelte';

	let value = 'This is really long text';
	let x = 0;
	let y = 0;
	let width = 224;
	let textAnchor = 'start';
	let verticalAnchor = 'start';
	let lineHeight = '1em';
	let rotate = 0;
	let scaleToFit = false;
	let showAnchor = true;
	let resizeSvg = true;
</script>

<h1>Examples</h1>

<h2>Playground</h2>

<div class="flex items-center justify-between bg-white p-4">
	<svg width={resizeSvg ? width : 224} class="h-56 border">
		<Text
			{value}
			{x}
			{y}
			{width}
			{textAnchor}
			{verticalAnchor}
			{lineHeight}
			{rotate}
			{scaleToFit}
		/>

		{#if showAnchor}
			<circle cx={x} cy={y} r="2" fill="red" />
		{/if}
	</svg>

	<div>
		<label class="block">
			value:
			<input type="text" bind:value class="border" />
		</label>

		<label class="block">
			x:
			<input type="range" max={224} bind:value={x} />
			<input type="text" bind:value={x} class="border w-12" />
		</label>

		<label class="block">
			y:
			<input type="range" max={224} bind:value={y} />
			<input type="text" bind:value={y} class="border w-12" />
		</label>

		<label class="block">
			width:
			<input type="range" max={224} bind:value={width} />
		</label>

		<div class="block">
			textAnchor:
			<label
				><input type="radio" bind:group={textAnchor} value="start" />
				start
			</label>
			<label>
				<input type="radio" bind:group={textAnchor} value="middle" />
				middle
			</label>
			<label>
				<input type="radio" bind:group={textAnchor} value="end" />
				end
			</label>
		</div>

		<div class="block">
			verticalAnchor:
			<label>
				<input type="radio" bind:group={verticalAnchor} value="start" />
				start
			</label>
			<label>
				<input type="radio" bind:group={verticalAnchor} value="middle" />
				middle
			</label>
			<label>
				<input type="radio" bind:group={verticalAnchor} value="end" />
				end
			</label>
		</div>

		<label class="block">
			lineHeight:
			<input type="text" bind:value={lineHeight} class="border" />
		</label>

		<label class="block">
			rotate:
			<input type="range" max={360} bind:value={rotate} />
		</label>

		<label class="block">
			scaletoFit:
			<input type="checkbox" bind:checked={scaleToFit} />
		</label>

		<label class="block">
			show anchor:
			<input type="checkbox" bind:checked={showAnchor} />
		</label>

		<label class="block">
			resize svg (container):
			<input type="checkbox" bind:checked={resizeSvg} />
		</label>
	</div>
</div>

<h1>API</h1>

<ApiDocs {api} />
