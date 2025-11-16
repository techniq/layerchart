<script lang="ts">
	import LucidePlay from '~icons/lucide/play';
	import LucideSquare from '~icons/lucide/square';
	import { Button, ButtonGroup } from 'svelte-ux';

	// <AnimatedGlobeControls {isPlaying} {selectedFeature} {play} {stop} />

	interface Props {
		isPlaying: boolean;
		selectedFeature: any;
		play: () => void;
		stop: () => void;
	}

	let { isPlaying, selectedFeature, play, stop }: Props = $props();
</script>

<div class="absolute top-0 right-0 z-10 flex items-center gap-3 screenshot-hidden">
	{#if isPlaying && selectedFeature}
		<span class="text-sm px-2 py-1 font-semibold text-primary bg-primary/5 rounded-full">
			{selectedFeature?.properties.name ?? ''}
		</span>
	{/if}
	<ButtonGroup variant="fill-light" color="primary" size="sm" class="outline rounded-full">
		<Button
			icon={LucidePlay}
			on:click={play}
			disabled={isPlaying}
			classes={{ icon: 'text-xs', root: 'px-2 py-1' }}
		/>
		<Button
			icon={LucideSquare}
			on:click={stop}
			disabled={!isPlaying}
			classes={{ icon: 'text-xs', root: 'px-2 py-1' }}
		/>
	</ButtonGroup>
</div>
