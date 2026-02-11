import { Resvg } from '@resvg/resvg-js';
import satori from 'satori';
import { html } from 'satori-html';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async ({ url, fetch }) => {
	const title = url.searchParams.get('title') ?? 'LayerChart';
	const description = url.searchParams.get('description') ?? '';
	const component = url.searchParams.get('component') ?? '';

	// Load font
	const interFont = await fetch(
		'https://cdn.jsdelivr.net/fontsource/fonts/inter@latest/latin-700-normal.woff'
	).then((res) => res.arrayBuffer());

	// Build component badge HTML
	const componentBadge = component
		? `<div style="display: flex; margin-left: 16px; padding: 6px 16px; background: rgba(255,255,255,0.15); border-radius: 20px; font-size: 18px; color: rgba(255,255,255,0.9);">${component}</div>`
		: '';

	// Build description HTML
	const descriptionHtml = description
		? `<div style="display: flex; font-size: 28px; color: rgba(255,255,255,0.8); line-height: 1.4; max-width: 900px;">${description}</div>`
		: '';

	const htmlString = `
		<div style="display: flex; flex-direction: column; width: 100%; height: 100%; background: linear-gradient(135deg, #1e1b4b, #312e81, #4338ca); padding: 60px;">
			<div style="display: flex; flex-direction: column; flex: 1;">
				<div style="display: flex; align-items: center; margin-bottom: 40px;">
					<div style="display: flex; font-size: 32px; font-weight: 700; color: white;">LayerChart</div>
					${componentBadge}
				</div>
				<div style="display: flex; font-size: 72px; font-weight: 700; color: white; margin-bottom: 24px;">${title}</div>
				${descriptionHtml}
				<div style="display: flex; flex: 1;"></div>
				<div style="display: flex; justify-content: space-between;">
					<div style="display: flex; font-size: 22px; color: rgba(255,255,255,0.6);">Composable Svelte visualization library</div>
					<div style="display: flex; font-size: 22px; color: rgba(255,255,255,0.6);">layerchart.com</div>
				</div>
			</div>
		</div>
	`;

	const markup = html(htmlString);

	const svg = await satori(markup, {
		width: 1200,
		height: 630,
		fonts: [
			{
				name: 'Inter',
				data: interFont,
				weight: 700,
				style: 'normal'
			}
		]
	});

	const resvg = new Resvg(svg, {
		fitTo: {
			mode: 'width',
			value: 1200
		}
	});

	const png = resvg.render().asPng();

	return new Response(png, {
		headers: {
			'Content-Type': 'image/png',
			'Cache-Control': 'public, max-age=31536000, immutable'
		}
	});
};
