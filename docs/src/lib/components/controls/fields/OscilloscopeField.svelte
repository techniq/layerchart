<script lang="ts">
	import { Button } from 'svelte-ux';

	import LucideCirclePlay from '~icons/lucide/circle-play';
	import LucideCircleStop from '~icons/lucide/circle-stop';

	interface Props {
		isListening: boolean;
		error: string;
		startMicrophone: () => void;
		stopMicrophone: () => void;
	}

	let {
		isListening = $bindable(),
		error = $bindable(),
		startMicrophone,
		stopMicrophone
	}: Props = $props();
</script>

<div class="mb-4 flex gap-2 items-center">
	{#if !isListening}
		<Button
			icon={LucideCirclePlay}
			on:click={startMicrophone}
			variant="fill-outline"
			color="primary"
			size="sm"
		>
			Start Microphone
		</Button>
	{:else}
		<Button
			icon={LucideCircleStop}
			on:click={stopMicrophone}
			variant="fill-outline"
			color="danger"
			size="sm"
		>
			Stop Microphone
		</Button>
	{/if}
	{#if error}
		<span class="text-danger">{error}</span>
	{/if}
</div>
