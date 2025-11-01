<script lang="ts">
	import { range, ticks } from 'd3-array';
	import { scaleLinear, scaleSequential } from 'd3-scale';
	import { interpolateTurbo } from 'd3-scale-chromatic';
	import { BarChart, Bars, LinearGradient } from 'layerchart';
	import { Button } from 'svelte-ux';

	import LucideCirclePlay from '~icons/lucide/circle-play';
	import LucideCircleStop from '~icons/lucide/circle-stop';

	const FFT_SIZE = 256;

	// Generate mock frequency domain data for demonstration
	const mockData = Array.from({ length: 128 }, (_, i) => ({
		key: i,
		value: Math.max(0, 160 - i * 2 + 40 * Math.random())
	}));

	let data: { key: number; value: number }[] = $state([]);
	let audioContext: AudioContext | null = $state(null);
	let analyser: AnalyserNode | null = $state(null);
	let dataArray: Uint8Array<ArrayBuffer> | null = $state(null);
	let animationId: number | null = $state(null);
	let isListening = $state(false);
	let error = $state('');

	$effect(() => {
		if (!isListening) {
			data = mockData;
		}
	});

	const decibels = scaleLinear().domain([0, 255]).range([-100, -30]);
	const colorScale = scaleSequential([0, 256], interpolateTurbo);

	async function startMicrophone() {
		try {
			error = '';
			const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

			audioContext = new AudioContext();
			analyser = audioContext.createAnalyser();
			analyser.fftSize = FFT_SIZE;

			const source = audioContext.createMediaStreamSource(stream);
			source.connect(analyser);

			const bufferLength = analyser.frequencyBinCount;
			dataArray = new Uint8Array(new ArrayBuffer(bufferLength));

			isListening = true;
			updateFrequencyData();
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
		data = [];
	}

	function updateFrequencyData() {
		if (!analyser || !dataArray) return;

		analyser.getByteFrequencyData(dataArray);

		data = Array.from(dataArray, (value, i) => ({
			key: i,
			value
		}));

		animationId = requestAnimationFrame(updateFrequencyData);
	}

	$effect(() => {
		return () => {
			stopMicrophone();
		};
	});

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

<BarChart
	{data}
	x="key"
	xDomain={range(0, FFT_SIZE / 2)}
	y="value"
	yDomain={[0, 256]}
	bandPadding={0.2}
	padding={{ left: 24 }}
	rule={false}
	axis="y"
	tooltip={{ mode: 'manual' }}
	props={{
		yAxis: { format: (d) => decibels(d)?.toFixed(1) }
	}}
	height={200}
>
	{#snippet marks()}
		<LinearGradient
			stops={ticks(1, 0, 10).map(colorScale.interpolator())}
			vertical
			units="userSpaceOnUse"
		>
			{#snippet children({ gradient })}
				<Bars radius={1} fill={gradient} />
			{/snippet}
		</LinearGradient>
	{/snippet}
</BarChart>
