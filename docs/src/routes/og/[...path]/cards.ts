/**
 * One card per kind of page, all on the same grid so they read as a set: the text in a column on
 * the left, the chart (or charts) in a fixed region on the right, against its right edge, and the
 * wordmark in the bottom right corner below it.
 *
 * Chats print the page's title and description under the picture, so a card with a screenshot
 * spends its space on the chart, and names only what it is.
 */
import type { VNode } from '@cf-wasm/satori';

import {
	canvas,
	clamped,
	chart,
	fit,
	h,
	HEIGHT,
	MUTED,
	PADDING,
	type Screenshot,
	SUBTLE,
	titleSize,
	WIDTH,
	wordmark
} from './draw';

export type CardContent = {
	/** What kind of page, above the title (ex. a component's category, or `Guide`) */
	eyebrow?: string | null;
	title: string;
	description?: string | null;
	/** The chart to show, for a component or example */
	shot?: Screenshot | null;
	/** Several charts, for a page about many */
	shots?: Screenshot[];
};

/** The text column on the left */
const TEXT_WIDTH = 360;
const GAP = 40;
/** The wordmark's size, and its distance from the bottom edge */
const MARK = 28;
const MARK_BOTTOM = 40;
/** The region the chart is centered in: right of the text, and clear of the wordmark below it */
const REGION = {
	width: WIDTH - PADDING * 2 - TEXT_WIDTH - GAP,
	height: HEIGHT - PADDING - MARK_BOTTOM - Math.ceil(MARK * 1.3) - 28
};

export function card(content: CardContent): VNode {
	const { shot, shots } = content;
	if (shots?.length) return layout(text(content), mosaic(shots));
	if (shot) return layout(text(content), chart(shot, fit(shot, REGION.width, REGION.height)));
	return layout(text(content, { width: WIDTH - PADDING * 2, large: true }), null);
}

/** The text column and the chart region side by side, with the wordmark in the corner */
function layout(column: VNode, chart: VNode | null) {
	return canvas([
		h('div', { style: { display: 'flex', height: REGION.height, gap: GAP } }, [
			column,
			...(chart
				? [
						h(
							'div',
							{
								style: {
									display: 'flex',
									alignItems: 'center',
									// Against the right edge, in line with the wordmark below it
									justifyContent: 'flex-end',
									width: REGION.width,
									height: REGION.height
								}
							},
							[chart]
						)
					]
				: [])
		]),
		h(
			'div',
			{ style: { display: 'flex', position: 'absolute', right: PADDING, bottom: MARK_BOTTOM } },
			[wordmark(MARK)]
		)
	]);
}

/**
 * The eyebrow, title and description, centered beside the chart.  A title may wrap between words,
 * so it is sized by its longest word as well as by its length.
 */
function text(
	{ eyebrow, title, description }: CardContent,
	{ width = TEXT_WIDTH, large = false } = {}
) {
	const longest = title.split(/\s+/).reduce((a, b) => (b.length > a.length ? b : a), '');
	const max = large ? 96 : 72;
	const size = Math.min(
		titleSize(longest, width, { max }),
		titleSize(title, width * (large ? 2 : 3), { max })
	);

	return h(
		'div',
		{
			style: {
				display: 'flex',
				flexDirection: 'column',
				justifyContent: 'center',
				width,
				flexShrink: 0
			}
		},
		[
			...(eyebrow
				? [
						h(
							'div',
							{
								style: {
									display: 'flex',
									marginBottom: 12,
									fontSize: large ? 30 : 26,
									fontWeight: 600,
									color: MUTED
								}
							},
							eyebrow
						)
					]
				: []),
			clamped(
				title,
				{ fontSize: size, fontWeight: 700, letterSpacing: -1.5, lineHeight: 1.1 },
				large ? 2 : 3
			),
			...(description
				? [
						clamped(
							description,
							{
								marginTop: 20,
								fontSize: large ? 34 : 26,
								lineHeight: 1.4,
								color: SUBTLE,
								maxWidth: 1000
							},
							large ? 3 : 5
						)
					]
				: [])
		]
	);
}

/**
 * The charts in two justified rows: each row's charts share a height, at which the row fills the
 * region's width.  Rows whose charts are about as wide in all (see `GALLERY`) come out about as tall.
 */
function mosaic(shots: Screenshot[]) {
	const gap = 24;
	const shown = shots.slice(0, 6);
	const per = Math.ceil(shown.length / 2);
	const maxHeight = (REGION.height - gap) / 2;

	const rows = [shown.slice(0, per), shown.slice(per)]
		.filter((row) => row.length)
		.map((row) => {
			const aspects = row.reduce((sum, shot) => sum + shot.width / shot.height, 0);
			const room = REGION.width - gap * (row.length - 1);
			const height = Math.floor(Math.min(room / aspects, maxHeight));
			return h(
				'div',
				{ style: { display: 'flex', justifyContent: 'center', alignItems: 'center', gap } },
				row.map((shot) =>
					chart(shot, { width: Math.floor((shot.width / shot.height) * height), height })
				)
			);
		});

	return h('div', { style: { display: 'flex', flexDirection: 'column', gap } }, rows);
}
