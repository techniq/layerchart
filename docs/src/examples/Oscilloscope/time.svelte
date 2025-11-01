<script lang="ts">
	import { LineChart } from 'layerchart';
	import { Button } from 'svelte-ux';

	import LucideCirclePlay from '~icons/lucide/circle-play';
	import LucideCircleStop from '~icons/lucide/circle-stop';

	const FFT_SIZE = 2048;

	// Generate mock time domain data for demonstration
	const mockData = Array.from({ length: 512 }, (_, i) => ({
		key: i,
		value: 128 + 256 * Math.sin((i / 512) * Math.PI * 8) + 128 * Math.sin((i / 512) * Math.PI * 16)
	}));

	let timeData: { key: number; value: number }[] = $state([]);
	let audioContext: AudioContext | null = $state(null);
	let analyser: AnalyserNode | null = $state(null);
	let dataArray: Uint8Array<ArrayBuffer> | null = $state(null);
	let animationId: number | null = $state(null);
	let isListening = $state(false);
	let error = $state('');

	$effect(() => {
		if (!isListening) {
			timeData = mockData;
		}
	});

	async function startMicrophone() {
		try {
			error = '';
			const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

			audioContext = new AudioContext();
			analyser = audioContext.createAnalyser();
			analyser.fftSize = FFT_SIZE;

			const source = audioContext.createMediaStreamSource(stream);
			source.connect(analyser);

			const bufferLength = analyser.fftSize;
			dataArray = new Uint8Array(new ArrayBuffer(bufferLength));

			isListening = true;
			updateTimeData();
		} catch (err) {
			error = err instanceof Error ? err.message : 'Failed to access microphone';
			console.error('Error accessing microphone:', err);
		}
	}

	function stopMicrophone() {
		if (animationId !== null) {
			cancelAnimationFrame(animationId);
			animationId = null;
		}

		if (audioContext) {
			audioContext.close();
			audioContext = null;
		}

		analyser = null;
		dataArray = null;
		isListening = false;
		timeData = [];
	}

	function updateTimeData() {
		if (!analyser || !dataArray) return;

		analyser.getByteTimeDomainData(dataArray);

		const amplification = 3;
		const centerValue = 128;

		timeData = Array.from(dataArray, (value, i) => ({
			key: i,
			value: centerValue + (value - centerValue) * amplification
		}));

		animationId = requestAnimationFrame(updateTimeData);
	}

	$effect(() => {
		return () => {
			stopMicrophone();
		};
	});

	const data = $derived(timeData);
	export { data };
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

<LineChart
	data={timeData}
	x="key"
	y="value"
	yDomain={[-256, 512]}
	axis={false}
	grid={false}
	props={{ spline: { class: 'stroke-surface-content' } }}
	tooltip={{ mode: 'manual' }}
	height={200}
/>
