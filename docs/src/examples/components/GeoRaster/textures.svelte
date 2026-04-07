<script lang="ts">
	import { geoOrthographic } from 'd3-geo';

	import { Chart, GeoPath, GeoRaster, Graticule, Layer } from 'layerchart';
	import { SelectField } from 'svelte-ux';

	// Procedural textures — built on demand into an HTMLCanvasElement and handed
	// to GeoRaster. Shows that any readable canvas works as a source image.
	function buildTexture(
		label: string,
		draw: (ctx: CanvasRenderingContext2D, w: number, h: number) => void
	) {
		if (typeof document === 'undefined') return { label, value: null };
		const size = 1024;
		const canvas = document.createElement('canvas');
		canvas.width = size;
		canvas.height = size / 2;
		const ctx = canvas.getContext('2d');
		if (ctx) draw(ctx, canvas.width, canvas.height);
		return { label, value: canvas };
	}

	const textures: { label: string; value: HTMLCanvasElement | null }[] = [
		buildTexture('Checker', (ctx, w, h) => {
			const cells = 16;
			const cw = w / cells;
			const ch = h / (cells / 2);
			for (let y = 0; y < cells / 2; y++) {
				for (let x = 0; x < cells; x++) {
					ctx.fillStyle = (x + y) % 2 === 0 ? '#1e293b' : '#f8fafc';
					ctx.fillRect(x * cw, y * ch, cw, ch);
				}
			}
		}),
		buildTexture('Stripes', (ctx, w, h) => {
			const bands = 12;
			const bw = w / bands;
			for (let i = 0; i < bands; i++) {
				ctx.fillStyle = i % 2 === 0 ? '#0ea5e9' : '#f1f5f9';
				ctx.fillRect(i * bw, 0, bw, h);
			}
		}),
		buildTexture('Polka dots', (ctx, w, h) => {
			ctx.fillStyle = '#fef3c7';
			ctx.fillRect(0, 0, w, h);
			ctx.fillStyle = '#dc2626';
			const cols = 12;
			const rows = 6;
			const dx = w / cols;
			const dy = h / rows;
			const r = Math.min(dx, dy) * 0.3;
			for (let y = 0; y < rows; y++) {
				for (let x = 0; x < cols; x++) {
					ctx.beginPath();
					ctx.arc((x + 0.5) * dx, (y + 0.5) * dy, r, 0, Math.PI * 2);
					ctx.fill();
				}
			}
		}),
		buildTexture('Latitude bands', (ctx, w, h) => {
			const bands = 18;
			const bh = h / bands;
			for (let i = 0; i < bands; i++) {
				const t = i / (bands - 1);
				const hue = Math.round(t * 300);
				ctx.fillStyle = `hsl(${hue} 70% 55%)`;
				ctx.fillRect(0, i * bh, w, bh);
			}
		}),
		buildTexture('Grid', (ctx, w, h) => {
			ctx.fillStyle = '#020617';
			ctx.fillRect(0, 0, w, h);
			ctx.strokeStyle = '#22d3ee';
			ctx.lineWidth = 2;
			const step = w / 36;
			for (let x = 0; x <= w; x += step) {
				ctx.beginPath();
				ctx.moveTo(x, 0);
				ctx.lineTo(x, h);
				ctx.stroke();
			}
			for (let y = 0; y <= h; y += step) {
				ctx.beginPath();
				ctx.moveTo(0, y);
				ctx.lineTo(w, y);
				ctx.stroke();
			}
		}),
		buildTexture('Noise', (ctx, w, h) => {
			const img = ctx.createImageData(w, h);
			for (let i = 0; i < img.data.length; i += 4) {
				const v = (Math.random() * 255) | 0;
				img.data[i] = v;
				img.data[i + 1] = v;
				img.data[i + 2] = v;
				img.data[i + 3] = 255;
			}
			ctx.putImageData(img, 0, 0);
		}),
		buildTexture('Bricks', (ctx, w, h) => {
			ctx.fillStyle = '#78350f';
			ctx.fillRect(0, 0, w, h);
			ctx.fillStyle = '#b45309';
			const cols = 16;
			const rows = 12;
			const bw = w / cols;
			const bh = h / rows;
			const mortar = 2;
			for (let r = 0; r < rows; r++) {
				const offset = r % 2 === 0 ? 0 : bw / 2;
				for (let c = -1; c <= cols; c++) {
					ctx.fillRect(c * bw + offset + mortar, r * bh + mortar, bw - mortar * 2, bh - mortar * 2);
				}
			}
		}),
		buildTexture('Starfield', (ctx, w, h) => {
			ctx.fillStyle = '#020617';
			ctx.fillRect(0, 0, w, h);
			const stars = 2000;
			for (let i = 0; i < stars; i++) {
				const x = Math.random() * w;
				const y = Math.random() * h;
				const r = Math.random() * 1.5 + 0.2;
				const brightness = Math.random() * 0.8 + 0.2;
				ctx.fillStyle = `rgba(255, 255, 255, ${brightness})`;
				ctx.beginPath();
				ctx.arc(x, y, r, 0, Math.PI * 2);
				ctx.fill();
			}
		})
	];

	let texture = $state<HTMLCanvasElement | null>(textures[0].value);
</script>

<div class="mb-4 screenshot-hidden">
	<SelectField
		label="Texture"
		options={textures}
		bind:value={texture}
		clearable={false}
		toggleIcon={null}
		stepper
	/>
</div>

<Chart
	geo={{
		projection: geoOrthographic,
		fitGeojson: { type: 'Sphere' }
	}}
	transform={{
		mode: 'projection',
		constrain: ({ scale, translate }) => ({
			scale,
			translate: {
				x: translate.x,
				y: Math.max(-90, Math.min(90, translate.y))
			}
		})
	}}
	padding={{ top: 10, bottom: 10, left: 10, right: 10 }}
	height={500}
>
	<Layer type="canvas">
		{#if texture}
			<GeoRaster image={texture} interpolate="bilinear" />
		{/if}
	</Layer>
	<Layer type="svg">
		<GeoPath geojson={{ type: 'Sphere' }} class="fill-none stroke-surface-content/40" />
		<Graticule class="stroke-surface-content/10" />
	</Layer>
</Chart>
