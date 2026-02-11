import { render } from 'svelte/server';
import satori from 'satori';
import { html } from 'satori-html';
import { Resvg } from '@resvg/resvg-js';

import InterRegular from '@fontsource/inter/files/inter-latin-400-normal.woff';
import InterSemibold from '@fontsource/inter/files/inter-latin-600-normal.woff';
import InterBold from '@fontsource/inter/files/inter-latin-700-normal.woff';

import { dev } from '$app/environment';
import { read } from '$app/server';
import type { RequestHandler } from './$types';

import Thumbnail from './Thumbnail.svelte';

const interRegular = read(InterRegular).arrayBuffer();
const interSemibold = read(InterSemibold).arrayBuffer();
const interBold = read(InterBold).arrayBuffer();

export const GET: RequestHandler = async ({ url }) => {
	const renderedComponent = render(Thumbnail, {
		props: {
			title: url.searchParams.get('title') ?? '',
			description: url.searchParams.get('description') ?? undefined,
			component: url.searchParams.get('component') ?? undefined
		}
	});

	const markup = html(`<style>${renderedComponent.head}</style>${renderedComponent.body}`);

	const svg = await satori(markup, {
		width: 1200,
		height: 630,
		fonts: [
			{
				name: 'Inter',
				data: await interRegular,
				weight: 400,
				style: 'normal'
			},
			{
				name: 'Inter',
				data: await interSemibold,
				weight: 600,
				style: 'normal'
			},
			{
				name: 'Inter',
				data: await interBold,
				weight: 700,
				style: 'normal'
			}
		]
	});

	const png = new Resvg(svg, {
		fitTo: {
			mode: 'original'
		}
	})
		.render()
		.asPng();

	const response = new Response(new Uint8Array(png), {
		headers: {
			'Content-Type': 'image/png'
		}
	});
	if (!dev) response.headers.append('Cache-Control', `max-age=${60 * 60 * 24 * 30}, immutable`);
	return response;
};
