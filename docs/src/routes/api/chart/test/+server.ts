import { render } from 'svelte/server';
import { createCaptureCallback } from 'layerchart/server';
import type { CaptureTarget } from 'layerchart/server';
import type { RequestHandler } from './$types';
import DemoChart from '../DemoChart.svelte';

const data = Array.from({ length: 50 }, (_, i) => ({
	date: i,
	value: 50 + 30 * Math.sin(i / 5) + 10 * Math.cos(i / 3)
}));

export const GET: RequestHandler = async () => {
	const { onCapture, getCapture } = createCaptureCallback();
	const captureTarget: CaptureTarget = {};

	const rendered = render(DemoChart, {
		props: { data, width: 800, height: 400, capture: captureTarget, _onCapture: onCapture }
	});

	const capture = getCapture();
	const typedCapture = capture as CaptureTarget | null;

	return new Response(
		JSON.stringify({
			htmlLength: rendered.body.length,
			canvasCount: (rendered.body.match(/<canvas/gi) ?? []).length,
			hasRootContainer: rendered.body.includes('lc-root-container'),
			bodyPreview: rendered.body.slice(0, 300),
			captured: Boolean(typedCapture?.rootNode),
			captureObjectHasRoot: Boolean(captureTarget.rootNode),
			captureObjectHasChartState: Boolean(captureTarget.chartState),
			rootKind: typedCapture?.rootNode?.kind ?? null,
			childCount: typedCapture?.rootNode?.children.length ?? 0,
			hasChartState: Boolean(typedCapture?.chartState),
			hasPadding: Boolean(typedCapture?.chartState?.padding)
		}),
		{
			headers: { 'Content-Type': 'application/json' }
		}
	);
};
