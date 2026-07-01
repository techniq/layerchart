<script lang="ts">
	import { LinearGradient, LineChart, Highlight, Spline, Tooltip } from 'layerchart';
	import OscilloscopeField from '$lib/components/controls/fields/OscilloscopeField.svelte';
	import { extent, ticks } from 'd3-array';
	import { format } from '@layerstack/utils';
	import { scaleSequential } from 'd3-scale';
	import { interpolateRainbow } from 'd3-scale-chromatic';

	const FFT_SIZE = 1024;

	// Generate mock time domain data for demonstration
	const mockData = Array.from({ length: 512 }, (_, i) => ({
		key: i,
		value: 128 + 256 * Math.sin((i / 512) * Math.PI * 8) + 128 * Math.sin((i / 512) * Math.PI * 16)
	}));

	let data: { key: number; value: number }[] = $state([]);
	let audioContext: AudioContext | null = $state(null);
	let analyser: AnalyserNode | null = $state(null);
	let dataArray: Uint8Array<ArrayBuffer> | null = $state(null);
	let animationId: number | null = $state(null);
	let isListening = $state(false);
	let error = $state('');

	const valueColor = $derived(
		scaleSequential(extent(data, (d) => d.value as number) as [number, number], interpolateRainbow)
	);

	$effect(() => {
		if (!isListening) {
			data = mockData;
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
		data = [];
	}

	function updateTimeData() {
		if (!analyser || !dataArray) return;

		analyser.getByteTimeDomainData(dataArray);

		const amplification = 8;
		const centerValue = 128;

		data = Array.from(dataArray, (value, i) => ({
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

	export { data };
</script>

<OscilloscopeField bind:isListening bind:error {startMicrophone} {stopMicrophone} />

<LineChart {data} x="key" y="value" yDomain={[-256, 512]} axis="y" grid={false} height={200}>
	{#snippet marks()}
		<LinearGradient stops={ticks(1, 0, 10).map(valueColor.interpolator())} vertical>
			{#snippet children({ gradient })}
				<Spline stroke={gradient} />
			{/snippet}
		</LinearGradient>
	{/snippet}

	{#snippet highlight({ context })}
		{#if context.tooltip.data}
			<Highlight lines points={{ fill: valueColor(context.y(context.tooltip.data)) }} />
		{/if}
	{/snippet}

	{#snippet tooltip({ context })}
		<Tooltip.Root>
			{#snippet children({ data })}
				{@const value = context.y(data)}
				<Tooltip.Header>{format(context.x(data))}</Tooltip.Header>
				<Tooltip.List>
					<Tooltip.Item label="value" {value} color={valueColor(value)} />
				</Tooltip.List>
			{/snippet}
		</Tooltip.Root>
	{/snippet}
</LineChart>
