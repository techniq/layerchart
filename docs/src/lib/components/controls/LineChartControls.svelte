<script lang="ts">
	import { Button } from 'svelte-ux';
	import LucideCirclePlay from '~icons/lucide/circle-play';
	import LucideCircleStop from '~icons/lucide/circle-stop';

	export interface LineChartConfig {
		isListening: boolean;
		error: string;
	}

	interface Props {
		config: LineChartConfig;
		onStart: () => void;
		onStop: () => void;
	}

	let { config = $bindable(), onStart, onStop }: Props = $props();
</script>

<div class="mb-4 flex gap-2 items-center">
	{#if !config.isListening}
		<Button
			icon={LucideCirclePlay}
			on:click={onStart}
			variant="fill-outline"
			color="primary"
			size="sm"
		>
			Start Microphone
		</Button>
	{:else}
		<Button
			icon={LucideCircleStop}
			on:click={onStop}
			variant="fill-outline"
			color="danger"
			size="sm"
		>
			Stop Microphone
		</Button>
	{/if}
	{#if config.error}
		<span class="text-danger">{config.error}</span>
	{/if}
</div>
