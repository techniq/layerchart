import { createCanvas, Path2D } from '@napi-rs/canvas';
import { render } from 'svelte/server';
import { renderCapturedChart } from 'layerchart/server';
import type { CanvasFactory, CaptureTarget, CapturedChart } from 'layerchart/server';
import type { RequestHandler } from './$types';

import DemoChart from './DemoChart.svelte';

// Register Path2D globally for canvas rendering
if (typeof globalThis.Path2D === 'undefined') {
	(globalThis as any).Path2D = Path2D;
}

// Sample data: a simple sine-wave-like dataset
const data = Array.from({ length: 50 }, (_, i) => ({
	date: i,
	value: 50 + 30 * Math.sin(i / 5) + 10 * Math.cos(i / 3)
}));

function isCapturedChart(capture: CaptureTarget | null): capture is CapturedChart {
	return Boolean(capture?.chartState && capture?.rootNode);
}

const createNodeCanvas: CanvasFactory = (canvasWidth, canvasHeight) =>
	createCanvas(canvasWidth, canvasHeight) as unknown as ReturnType<CanvasFactory>;

export const GET: RequestHandler = async ({ url }) => {
	const width = Number(url.searchParams.get('width') ?? 800);
	const height = Number(url.searchParams.get('height') ?? 400);
	const format = url.searchParams.get('format') === 'jpeg' ? 'jpeg' : 'png';
	const captureTarget: CaptureTarget = {};

	const rendered = render(DemoChart, {
		props: { data, width, height, capture: captureTarget }
	});
	void rendered.body;

	const capture = captureTarget;

	if (!isCapturedChart(capture)) {
		return new Response('Failed to render chart', { status: 500 });
	}

	const buffer = renderCapturedChart(capture, {
		width,
		height,
		format,
		createCanvas: createNodeCanvas
	});

	return new Response(buffer as any, {
		headers: {
			'Content-Type': `image/${format}`,
			'Cache-Control': 'public, max-age=3600'
		}
	});
};
