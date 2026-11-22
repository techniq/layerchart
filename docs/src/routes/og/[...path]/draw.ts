/**
 * What every share card is drawn from: its size and colors, the background, the wordmark, and the
 * screenshots.
 *
 * Satori lays out a small subset of CSS with flexbox only - every `div` with more than one child
 * needs `display: flex` - and anything it cannot draw (the logo, the grid) goes in as an SVG image.
 */
import type { VNode } from '@cf-wasm/satori';

import logoSvg from '$static/favicon.svg?raw';

export const WIDTH = 1200;
export const HEIGHT = 630;
/** The space around the content */
export const PADDING = 56;

/**
 * Dark, as `static/images/og-image.png` (the home page's card) is, and because a link preview sits
 * in a feed, where a white card is the brightest thing on screen in a dark app.  The screenshots
 * are the docs' dark theme ones, drawn on a transparent background, so they need a dark page too.
 */
export const SURFACE = '#161a22';
export const TEXT = '#e5e7eb';
export const SUBTLE = '#a8adb7';
export const MUTED = '#7c828d';
/** `og-image.png`'s gradient, of which the backdrop's glow is the violet end */
export const BRAND = ['#8b80f8', '#f050dc'];

/** A satori element */
export function h(
	type: string,
	props: Record<string, unknown> & { style?: Record<string, unknown> },
	children?: VNode['props']['children']
): VNode {
	return { type, props: { ...props, children } };
}

/**
 * Base64 without `Buffer`, which a Worker only has under `nodejs_compat`.  Chunked, since spreading
 * a whole image into `fromCharCode` overflows the call stack.
 */
export function base64(bytes: Uint8Array) {
	let binary = '';
	for (let i = 0; i < bytes.length; i += 0x8000) {
		binary += String.fromCharCode(...bytes.subarray(i, i + 0x8000));
	}
	return btoa(binary);
}

export function svgDataUri(svg: string) {
	return `data:image/svg+xml;base64,${base64(new TextEncoder().encode(svg))}`;
}

const LOGO = svgDataUri(logoSvg);

/**
 * The mark and name, as in the docs' header.  Plain rather than in `og-image.png`'s gradient, so it
 * signs the card without competing with the chart.
 */
export function wordmark(size: number): VNode {
	return h('div', { style: { display: 'flex', alignItems: 'center', gap: size * 0.4 } }, [
		h('img', { src: LOGO, width: size * 1.3, height: size * 1.22 }),
		h(
			'div',
			{
				style: {
					fontSize: size,
					fontWeight: 700,
					letterSpacing: -0.5,
					color: TEXT
				}
			},
			'LayerChart'
		)
	]);
}

/** Cut short with an ellipsis.  Satori clamps only a block that hides its overflow. */
export function clamped(text: string, style: Record<string, unknown>, lines = 1): VNode {
	return h(
		'div',
		{ style: { display: 'block', overflow: 'hidden', lineClamp: lines, ...style } },
		text
	);
}

/** As large as a title can be and still fit on one line */
export function titleSize(text: string, room: number, { min = 44, max = 84 } = {}) {
	// Inter averages a little over half an em per character at these weights
	return Math.max(min, Math.min(max, Math.floor(room / (text.length * 0.58))));
}

/**
 * The page's grid, after `og-image.png`'s: faint lines that fade out from the top left, under a
 * glow of the brand's violet.  An SVG image, since satori draws neither patterns nor masks.
 */
const BACKDROP = (() => {
	const step = 48;
	const lines: string[] = [];
	for (let x = step; x < WIDTH; x += step) lines.push(`M${x} 0V${HEIGHT}`);
	for (let y = step; y < HEIGHT; y += step) lines.push(`M0 ${y}H${WIDTH}`);
	return svgDataUri(`<svg xmlns="http://www.w3.org/2000/svg" width="${WIDTH}" height="${HEIGHT}">
		<defs>
			<radialGradient id="fade" cx="0.15" cy="0" r="1.1">
				<stop offset="0" stop-color="#fff" stop-opacity="1"/>
				<stop offset="1" stop-color="#fff" stop-opacity="0"/>
			</radialGradient>
			<radialGradient id="glow" cx="1" cy="0" r="0.9">
				<stop offset="0" stop-color="${BRAND[0]}" stop-opacity="0.16"/>
				<stop offset="1" stop-color="${BRAND[0]}" stop-opacity="0"/>
			</radialGradient>
			<mask id="mask"><rect width="${WIDTH}" height="${HEIGHT}" fill="url(#fade)"/></mask>
		</defs>
		<rect width="${WIDTH}" height="${HEIGHT}" fill="url(#glow)"/>
		<path d="${lines.join('')}" stroke="#ffffff" stroke-opacity="0.06" stroke-width="1" mask="url(#mask)"/>
	</svg>`);
})();

/** The whole card edge to edge */
export function canvas(children: VNode[], style: Record<string, unknown> = {}): VNode {
	return h(
		'div',
		{
			style: {
				display: 'flex',
				flexDirection: 'column',
				width: '100%',
				height: '100%',
				padding: PADDING,
				backgroundColor: SURFACE,
				fontFamily: 'Inter',
				color: TEXT,
				...style
			}
		},
		[
			h('img', {
				src: BACKDROP,
				width: WIDTH,
				height: HEIGHT,
				style: { position: 'absolute', left: 0, top: 0 }
			}),
			...children
		]
	);
}

export type Screenshot = { src: string; width: number; height: number };

/** A screenshot's size scaled to fit in `width` x `height` */
export function fit(shot: Screenshot, width: number, height: number) {
	const scale = Math.min(width / shot.width, height / shot.height);
	return { width: Math.round(shot.width * scale), height: Math.round(shot.height * scale) };
}

/**
 * A screenshot drawn straight onto the card, at `width` x `height`.  They are on a transparent
 * background, so the chart sits on the card's own; the backdrop's grid is faint enough not to show
 * through.
 */
export function chart(shot: Screenshot, { width, height }: { width: number; height: number }) {
	return h('img', { src: shot.src, width, height, style: { flexShrink: 0 } });
}
