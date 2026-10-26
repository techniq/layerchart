<script lang="ts">
	import { Bin, type BinShape, Chart, Layer } from 'layerchart';
	import { Button, Field, RangeField, SelectField, ToggleGroup, ToggleOption } from 'svelte-ux';
	import LucideUpload from '~icons/lucide/upload';

	type Pixel = { x: number; y: number; r: number; g: number; b: number };

	// Public domain paintings, via Wikimedia Commons
	let images = $state([
		{ label: 'The Great Wave off Kanagawa', value: '/images/paintings/great-wave.jpg' },
		{ label: 'The Starry Night', value: '/images/paintings/starry-night.jpg' },
		{ label: 'Mona Lisa', value: '/images/paintings/mona-lisa.jpg' },
		{ label: 'Girl with a Pearl Earring', value: '/images/paintings/pearl-earring.jpg' },
		{ label: 'The Scream', value: '/images/paintings/the-scream.jpg' }
	]);

	let image = $state('/images/paintings/great-wave.jpg');
	let shape = $state<BinShape>('hexagon');
	let size = $state(10);

	// Pixels sampled across the image's longer side, enough for several in the smallest cells
	const resolution = 200;

	let width = $state(0);
	let height = $state(0);
	let data = $state<Pixel[]>([]);

	/** The image's pixels, scaled down to `resolution`, as points carrying their color */
	async function loadPixels(src: string) {
		const img = new Image();
		img.src = src;
		await img.decode();

		const k = resolution / Math.max(img.naturalWidth, img.naturalHeight);
		const w = Math.round(img.naturalWidth * k);
		const h = Math.round(img.naturalHeight * k);

		const canvas = document.createElement('canvas');
		canvas.width = w;
		canvas.height = h;
		const context = canvas.getContext('2d', { willReadFrequently: true })!;
		context.drawImage(img, 0, 0, w, h);
		const rgba = context.getImageData(0, 0, w, h).data;

		const pixels: Pixel[] = [];
		for (let i = 0; i < w * h; i++) {
			// Centered in its pixel
			pixels.push({
				x: (i % w) + 0.5,
				y: Math.floor(i / w) + 0.5,
				r: rgba[i * 4],
				g: rgba[i * 4 + 1],
				b: rgba[i * 4 + 2]
			});
		}
		return { width: w, height: h, pixels };
	}

	$effect(() => {
		let stale = false;
		loadPixels(image).then((result) => {
			if (stale) return;
			width = result.width;
			height = result.height;
			data = result.pixels;
		});
		return () => {
			stale = true;
		};
	});

	/** A cell's color, the mean of its pixels' */
	function meanColor(cell: { data: Pixel[] }) {
		let r = 0;
		let g = 0;
		let b = 0;
		for (const d of cell.data) {
			r += d.r;
			g += d.g;
			b += d.b;
		}
		const n = cell.data.length;
		return `rgb(${Math.round(r / n)} ${Math.round(g / n)} ${Math.round(b / n)})`;
	}

	let fileInput = $state<HTMLInputElement>();

	function upload(e: Event) {
		const file = (e.currentTarget as HTMLInputElement).files?.[0];
		if (!file) return;
		const value = URL.createObjectURL(file);
		images.push({ label: file.name, value });
		image = value;
	}
</script>

<div class="grid grid-cols-[1fr_auto] gap-2 mb-2 items-end">
	<SelectField
		label="Image"
		options={images}
		bind:value={image}
		clearable={false}
		toggleIcon={null}
		stepper
	/>
	<Button icon={LucideUpload} variant="outline" onclick={() => fileInput?.click()}>Upload</Button>
	<input bind:this={fileInput} type="file" accept="image/*" class="hidden" onchange={upload} />
</div>

<div class="grid grid-cols-[auto_1fr] gap-2 mb-4">
	<Field label="Shape">
		<ToggleGroup bind:value={shape} variant="outline">
			<ToggleOption value="hexagon">Hexagon</ToggleOption>
			<ToggleOption value="square">Square</ToggleOption>
			<ToggleOption value="triangle">Triangle</ToggleOption>
		</ToggleGroup>
	</Field>
	<RangeField label="Size" bind:value={size} min={6} max={40} step={1} />
</div>

<!-- Sized to the image's aspect, and clipped, as the cells at the edges reach past it -->
<div
	class="mx-auto"
	style:width="min(100%, {(560 * width) / (height || 1)}px)"
	style:aspect-ratio="{width} / {height}"
>
	{#if data.length}
		<Chart {data} x="x" y="y" xDomain={[0, width]} yDomain={[height, 0]} clip>
			<Layer>
				<!-- Stroked in its own color, closing the hairline seams anti-aliasing leaves between cells -->
				<Bin {shape} {size} fill={meanColor} stroke={meanColor} />
			</Layer>
		</Chart>
	{/if}
</div>
