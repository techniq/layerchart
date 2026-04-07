import { describe, it, expect, beforeAll } from 'vitest';
import { render } from 'svelte/server';
import { createCanvas, Path2D } from '@napi-rs/canvas';
import {
	renderChart,
	renderCapturedChart,
	createCaptureCallback,
	type CaptureTarget,
	type CapturedChart,
	type CanvasFactory,
} from './index.js';

import TestLineChart from './TestLineChart.svelte';
import TestBarChart from './TestBarChart.svelte';

// Register Path2D globally for canvas rendering
beforeAll(() => {
	if (typeof globalThis.Path2D === 'undefined') {
		(globalThis as any).Path2D = Path2D;
	}
});

const createNodeCanvas: CanvasFactory = (w, h) =>
	createCanvas(w, h) as unknown as ReturnType<CanvasFactory>;

const lineData = Array.from({ length: 20 }, (_, i) => ({
	date: i,
	value: 50 + 30 * Math.sin(i / 5),
}));

const barData = [
	{ category: 'A', value: 28 },
	{ category: 'B', value: 55 },
	{ category: 'C', value: 43 },
	{ category: 'D', value: 91 },
];

describe('renderChart', () => {
	it('renders a line chart to PNG buffer', () => {
		const buffer = renderChart(TestLineChart, {
			width: 400,
			height: 200,
			props: { data: lineData },
			createCanvas: createNodeCanvas,
		});

		expect(buffer).toBeInstanceOf(Buffer);
		expect(buffer.length).toBeGreaterThan(0);
		// PNG magic bytes
		expect(buffer[0]).toBe(0x89);
		expect(buffer[1]).toBe(0x50); // P
		expect(buffer[2]).toBe(0x4e); // N
		expect(buffer[3]).toBe(0x47); // G
	});

	it('renders a bar chart to PNG buffer', () => {
		const buffer = renderChart(TestBarChart, {
			width: 400,
			height: 200,
			props: { data: barData },
			createCanvas: createNodeCanvas,
		});

		expect(buffer).toBeInstanceOf(Buffer);
		expect(buffer.length).toBeGreaterThan(0);
		// PNG magic bytes
		expect(buffer[0]).toBe(0x89);
	});

	it('renders to JPEG format', () => {
		const buffer = renderChart(TestLineChart, {
			width: 400,
			height: 200,
			format: 'jpeg',
			props: { data: lineData },
			createCanvas: createNodeCanvas,
		});

		expect(buffer).toBeInstanceOf(Buffer);
		// JPEG magic bytes (SOI marker)
		expect(buffer[0]).toBe(0xff);
		expect(buffer[1]).toBe(0xd8);
	});

	it('respects custom dimensions', () => {
		const buffer1 = renderChart(TestLineChart, {
			width: 200,
			height: 100,
			props: { data: lineData },
			createCanvas: createNodeCanvas,
		});

		const buffer2 = renderChart(TestLineChart, {
			width: 800,
			height: 600,
			props: { data: lineData },
			createCanvas: createNodeCanvas,
		});

		// Larger image should produce a larger buffer
		expect(buffer2.length).toBeGreaterThan(buffer1.length);
	});

	it('supports devicePixelRatio', () => {
		const buffer1x = renderChart(TestLineChart, {
			width: 400,
			height: 200,
			devicePixelRatio: 1,
			props: { data: lineData },
			createCanvas: createNodeCanvas,
		});

		const buffer2x = renderChart(TestLineChart, {
			width: 400,
			height: 200,
			devicePixelRatio: 2,
			props: { data: lineData },
			createCanvas: createNodeCanvas,
		});

		// 2x DPI should produce a larger buffer (more pixels)
		expect(buffer2x.length).toBeGreaterThan(buffer1x.length);
	});

	it('supports background color', () => {
		const transparentBuffer = renderChart(TestLineChart, {
			width: 400,
			height: 200,
			props: { data: lineData },
			createCanvas: createNodeCanvas,
		});

		const whiteBuffer = renderChart(TestLineChart, {
			width: 400,
			height: 200,
			background: 'white',
			props: { data: lineData },
			createCanvas: createNodeCanvas,
		});

		// Both should be valid PNGs but different content
		expect(transparentBuffer[0]).toBe(0x89);
		expect(whiteBuffer[0]).toBe(0x89);
		expect(Buffer.compare(transparentBuffer, whiteBuffer)).not.toBe(0);
	});

	it('throws on missing ServerChart', () => {
		// A bare component that doesn't use ServerChart should fail
		expect(() =>
			renderChart(
				// Use a dummy component-like object
				(() => {}) as any,
				{
					width: 400,
					height: 200,
					createCanvas: createNodeCanvas,
				}
			)
		).toThrow('Failed to capture chart state');
	});
});

describe('renderCapturedChart', () => {
	it('renders a captured chart tree to a buffer', () => {
		const captureTarget: CaptureTarget = {};

		const rendered = render(TestLineChart, {
			props: { data: lineData, width: 400, height: 200, capture: captureTarget },
		});
		void rendered.body;

		expect(captureTarget.chartState).toBeDefined();
		expect(captureTarget.rootNode).toBeDefined();

		const buffer = renderCapturedChart(captureTarget as CapturedChart, {
			width: 400,
			height: 200,
			createCanvas: createNodeCanvas,
		});

		expect(buffer).toBeInstanceOf(Buffer);
		expect(buffer[0]).toBe(0x89); // PNG
	});
});

describe('createCaptureCallback', () => {
	it('captures chart state via callback', () => {
		const { onCapture, getCapture } = createCaptureCallback();

		const rendered = render(TestLineChart, {
			props: { data: lineData, width: 400, height: 200, onCapture },
		});
		void rendered.body;

		const capture = getCapture();
		expect(capture).not.toBeNull();
		expect(capture?.chartState).toBeDefined();
		expect(capture?.rootNode).toBeDefined();
	});

	it('returns null before render', () => {
		const { getCapture } = createCaptureCallback();
		expect(getCapture()).toBeNull();
	});
});

describe('ServerChart capture prop', () => {
	it('populates capture target via prop', () => {
		const captureTarget: CaptureTarget = {};

		const rendered = render(TestLineChart, {
			props: { data: lineData, width: 400, height: 200, capture: captureTarget },
		});
		void rendered.body;

		expect(captureTarget.chartState).toBeDefined();
		expect(captureTarget.rootNode).toBeDefined();
		expect(captureTarget.rootNode!.children.length).toBeGreaterThan(0);
	});

	it('captures chart state with correct padding', () => {
		const captureTarget: CaptureTarget = {};

		const rendered = render(TestLineChart, {
			props: { data: lineData, width: 800, height: 400, capture: captureTarget },
		});
		void rendered.body;

		const state = captureTarget.chartState!;
		expect(state.padding).toEqual({ top: 20, right: 20, bottom: 20, left: 20 });
	});

	it('captures component tree with children', () => {
		const captureTarget: CaptureTarget = {};

		const rendered = render(TestLineChart, {
			props: { data: lineData, width: 400, height: 200, capture: captureTarget },
		});
		void rendered.body;

		// Root node (Canvas) should have children
		const root = captureTarget.rootNode!;
		expect(root.kind).toBe('group');
		expect(root.children.length).toBeGreaterThan(0);

		// Count all marks in the tree (may be nested in composite-marks)
		function countMarks(node: typeof root): number {
			let count = node.kind === 'mark' ? 1 : 0;
			for (const child of node.children) {
				count += countMarks(child);
			}
			return count;
		}
		// Should have at least 2 marks (Area and Spline)
		expect(countMarks(root)).toBeGreaterThanOrEqual(2);
	});
});
