<script lang="ts">
	import { cubicInOut } from 'svelte/easing';
	import { Arc, Chart, Layer } from 'layerchart';
	import { Field, Switch } from 'svelte-ux';

	let show = $state(true);
	const data = {
		arcs: [
			{ initialValue: 0, value: 40, fillClass: 'fill-red-500', trackClass: 'fill-red-500/10' },
			{ initialValue: 0, value: 60, fillClass: 'fill-lime-400', trackClass: 'fill-lime-400/10' },
			{ initialValue: 0, value: 80, fillClass: 'fill-cyan-400', trackClass: 'fill-cyan-500/10' }
		]
	};

	export { data };
</script>

<div class="grid grid-cols-[auto_1fr] gap-2 mb-2">
	<Field label="Show" let:id>
		<Switch checked={show} on:change={() => (show = !show)} {id} size="md" />
	</Field>
</div>

<Chart height={200}>
	<Layer center>
		{#if show}
			<Arc
				initialValue={0}
				value={40}
				innerRadius={-20}
				cornerRadius={10}
				class="fill-red-500"
				track={{ class: 'fill-red-500/10' }}
				motion={{ type: 'tween', duration: 1000, easing: cubicInOut }}
			/>
			<Arc
				initialValue={0}
				value={60}
				outerRadius={-25}
				innerRadius={-20}
				cornerRadius={10}
				class="fill-lime-400"
				track={{ class: 'fill-lime-400/10' }}
				motion={{ type: 'tween', duration: 1000, easing: cubicInOut }}
			/>
			<Arc
				initialValue={0}
				value={80}
				outerRadius={-50}
				innerRadius={-20}
				cornerRadius={10}
				class="fill-cyan-400"
				track={{ class: 'fill-cyan-500/10' }}
				motion={{ type: 'tween', duration: 1000, easing: cubicInOut }}
			/>
		{/if}
	</Layer>
</Chart>
