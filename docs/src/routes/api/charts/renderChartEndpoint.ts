import { createCanvas, Path2D } from '@napi-rs/canvas';
import { renderChart } from 'layerchart/server';
import type { CanvasFactory } from 'layerchart/server';
import type { Component } from 'svelte';

// Register Path2D globally for canvas rendering
if (typeof globalThis.Path2D === 'undefined') {
	(globalThis as any).Path2D = Path2D;
}

const createNodeCanvas: CanvasFactory = (canvasWidth, canvasHeight) =>
	createCanvas(canvasWidth, canvasHeight) as unknown as ReturnType<CanvasFactory>;

type RenderChartResponseOptions = {
	component: Component<any>;
	props: Record<string, any>;
	url: URL;
};

export function renderChartResponse({ component, props, url }: RenderChartResponseOptions): Response {
	const width = Number(url.searchParams.get('width') ?? 800);
	const height = Number(url.searchParams.get('height') ?? 400);
	const format = url.searchParams.get('format') === 'jpeg' ? 'jpeg' : 'png';

	const buffer = renderChart(component, {
		width,
		height,
		format,
		props,
		createCanvas: createNodeCanvas
	});

	return new Response(buffer as any, {
		headers: {
			'Content-Type': `image/${format}`,
			'Cache-Control': 'public, max-age=3600'
		}
	});
}
