<script lang="ts">
	import { Area, Chart, Layer } from 'layerchart';
	import { scaleBand, scaleSequential } from 'd3-scale';
	import { interpolateTurbo } from 'd3-scale-chromatic';
	import { curveBasis } from 'd3-shape';
	import { Field, RangeField, Switch } from 'svelte-ux';
	import TransformContextControls from '$lib/components/controls/TransformContextControls.svelte';
	import OscilloscopeField from '$lib/components/controls/fields/OscilloscopeField.svelte';

	const FFT_SIZE = 512;
	const HISTORY_SIZE = 12;
	const UPDATE_INTERVAL = 6; // capture every N animation frames (~100ms at 60fps)

	type WaveFrame = { key: number; value: number }[];

	function makeMockFrame(seed: number): WaveFrame {
		const amp = 50 + 40 * Math.sin(seed * 0.5);
		return Array.from({ length: FFT_SIZE }, (_, i) => ({
			key: i,
			// Absolute deviation from center — creates organic ridge shapes
			value: Math.max(
				0,
				amp * Math.abs(Math.sin((i / FFT_SIZE) * Math.PI * 6 * (1 + seed * 0.05))) +
					15 * Math.random()
			)
		}));
	}

	const mockHistory: WaveFrame[] = Array.from({ length: HISTORY_SIZE }, (_, i) => makeMockFrame(i));

	let history: WaveFrame[] = $state([...mockHistory]);
	let audioContext: AudioContext | null = $state(null);
	let analyser: AnalyserNode | null = $state(null);
	let dataArray: Uint8Array<ArrayBuffer> | null = $state(null);
	let animationId: number | null = $state(null);
	let isListening = $state(false);
	let error = $state('');
	let frameCount = 0;

	// Turn it up for a quiet microphone
	let gain = $state(1);
	let opaque = $state(false);

	const N = HISTORY_SIZE;
	const colorScale = scaleSequential([0, N - 1], interpolateTurbo);

	// Every frame's samples, each tagged with its row — newest (0) at the front
	const rows = $derived(
		history.flatMap((frame, row) =>
			frame.map((d) => ({ key: d.key, row, value: Math.min(128, d.value * gain) }))
		)
	);

	async function startMicrophone() {
		try {
			error = '';
			const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
			audioContext = new AudioContext();
			analyser = audioContext.createAnalyser();
			analyser.fftSize = FFT_SIZE;
			const source = audioContext.createMediaStreamSource(stream);
			source.connect(analyser);
			dataArray = new Uint8Array(new ArrayBuffer(analyser.fftSize));
			isListening = true;
			frameCount = 0;
			updateData();
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
		history = [...mockHistory];
	}

	function updateData() {
		if (!analyser || !dataArray) return;

		frameCount++;
		if (frameCount % UPDATE_INTERVAL === 0) {
			analyser.getByteTimeDomainData(dataArray);
			// Absolute deviation from center (128) gives upward ridge shapes
			const frame: WaveFrame = Array.from(dataArray, (v, i) => ({
				key: i,
				value: Math.abs(v - 128)
			}));
			// Newest frame at front (top row), oldest dropped
			history = [frame, ...history.slice(0, HISTORY_SIZE - 1)];
		}

		animationId = requestAnimationFrame(updateData);
	}

	$effect(() => {
		return () => stopMicrophone();
	});

	export { history as data };
</script>

<div class="flex gap-4 mb-4">
	<RangeField label="Gain" bind:value={gain} min={1} max={16} step={0.5} />
	<Field label="Opaque" let:id>
		<Switch {id} bind:checked={opaque} size="md" />
	</Field>
</div>

<OscilloscopeField bind:isListening bind:error {startMicrophone} {stopMicrophone} />

<!-- Each frame a curtain standing in its own row, the newest at the front -->
<Chart
	data={rows}
	x="key"
	xDomain={[0, FFT_SIZE - 1]}
	y="row"
	yScale={scaleBand()}
	yDomain={Array.from({ length: N }, (_, i) => N - 1 - i)}
	z="value"
	zDomain={[0, 128]}
	zRange={({ height }) => [0, height * 0.6]}
	isometric={{ rotate: -20, tilt: 60, aspect: 1.6 }}
	transform={{ mode: 'canvas', drag: 'rotate', scrollMode: 'scale' }}
	padding={16}
	height={500}
	tooltipContext={{ mode: 'manual' }}
	clip
>
	{#snippet children({ context })}
		{@const m = context.isometricMatrix}
		<TransformContextControls />

		<Layer>
			<!-- Back to front: each curtain lies in its own row, so the farther rows go first -->
			{#each Array.from({ length: N }, (_, row) => row).sort( (a, b) => (m ? m.d * (context.yScale(a) - context.yScale(b)) : 0) ) as row}
				<Area
					data={rows.filter((d) => d.row === row)}
					curve={curveBasis}
					fill={opaque ? 'var(--color-surface-100)' : colorScale(row)}
					fillOpacity={opaque ? 1 : 0.15}
					line={{ stroke: colorScale(row), strokeWidth: 1.5 }}
				/>
			{/each}
		</Layer>
	{/snippet}
</Chart>
