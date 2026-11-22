/**
 * The picture shown when a page is shared: `/og` followed by the page's path, like
 * `/og/docs/components/AreaChart/basic`.  `$lib/og` builds these addresses for the layout's meta tags.
 *
 * Drawn with satori (layout to SVG) and resvg (SVG to PNG), both from `@cf-wasm`.  Their `workerd`
 * builds import their WebAssembly as modules - the only way a Worker may load it, since compiling
 * WebAssembly from bytes at runtime is refused - which `vite-plugin-worker-wasm` copies into the
 * build.  Under `vite dev`, which runs on Node, their Node builds are used instead.
 */
import { dev } from '$app/environment';
import { read } from '$app/server';
import type { Font } from '@cf-wasm/satori';
import { allComponents, allGuides, allReleases, allUtils } from 'content-collections';
import type { ComponentCatalog } from '@layerstack/docs/catalog';

import inter400 from '@fontsource/inter/files/inter-latin-400-normal.woff?url';
import inter600 from '@fontsource/inter/files/inter-latin-600-normal.woff?url';
import inter700 from '@fontsource/inter/files/inter-latin-700-normal.woff?url';

import { OG_VERSION } from '$lib/og';
import { releaseDate, releaseName } from '$lib/releases';
import { metadata as examplesPage } from '../../docs/examples/metadata';
import type { RequestHandler } from './$types';
import { card, type CardContent } from './cards';
import { HEIGHT, WIDTH } from './draw';
import { screenshot } from './screenshot';

const catalogs = import.meta.glob<ComponentCatalog>('/src/examples/catalog/**/*.json', {
	import: 'default'
});

/**
 * The fonts, once read.  Held as the loaded value and never as a promise, as a promise started by
 * one request and awaited by another can be cancelled as hung on Workers.
 */
let fonts: Font[] | undefined;

async function loadFonts() {
	if (fonts) return fonts;
	const load = async (url: string, weight: Font['weight']): Promise<Font> => ({
		name: 'Inter',
		weight,
		style: 'normal',
		data: await read(url).arrayBuffer()
	});
	fonts = await Promise.all([load(inter400, 400), load(inter600, 600), load(inter700, 700)]);
	return fonts;
}

/**
 * satori and resvg, as the build for where this runs.  Chosen by name rather than by export
 * conditions, which would leave the build on whichever the bundler happens to pick.
 */
async function renderers() {
	const [{ satori }, { Resvg }] = dev
		? await Promise.all([import('@cf-wasm/satori/node'), import('@cf-wasm/resvg/node')])
		: await Promise.all([import('@cf-wasm/satori/workerd'), import('@cf-wasm/resvg/workerd')]);
	return { satori, Resvg };
}

/** `charts` → `Charts`, `axis-labels` → `Axis labels`, as the docs title examples */
function sentence(text: string) {
	const words = text.replaceAll('-', ' ');
	return words[0].toUpperCase() + words.slice(1);
}

async function catalogOf(slug: string) {
	const path = `/src/examples/catalog/${slug}.json`;
	return path in catalogs ? await catalogs[path]() : null;
}

/**
 * The first example a page shows (ex. `:example{ component="Bars" name="tween" }`), with `own` its
 * component when it has one: an example of `own` (`:example{ name="basic" }`) comes before any
 * other's, as a component's page may show other components alongside its own
 */
function firstExample(content: string, own?: string) {
	const shown = [...content.matchAll(/(?::example\{|<Example\s)([^}>]*)/g)].flatMap(
		([, attributes]) => {
			const name = attributes.match(/\bname="([^"]+)"/)?.[1];
			const component = attributes.match(/\bcomponent="([^"]+)"/)?.[1] ?? own;
			return name && component ? [{ component, name }] : [];
		}
	);
	return shown.find((e) => e.component === own) ?? shown[0] ?? null;
}

const gettingStarted = import.meta.glob<string>('/src/routes/docs/getting-started/+page.md', {
	query: '?raw',
	import: 'default'
});

/**
 * A screenshot of each kind of chart, for the examples gallery: two rows of three, whose charts are
 * about as wide in all (2.6 + 1.3 + 1.3 and 1.6 + 1.6 + 1.6, as width over height), so the rows
 * come out about as tall
 */
const GALLERY: [string, string][] = [
	['AreaChart', 'series-stack-gradient'],
	['GeoPath', 'choropleth'],
	['Pack', 'basic'],
	['Chord', 'basic'],
	['ScatterChart', 'zoomable-bubble'],
	['BarChart', 'company-race']
];

type Load = (path: string) => Promise<Response>;

async function draw(path: string, load: Load): Promise<CardContent | null> {
	const [root, section, ...rest] = path.split('/');
	if (root !== 'docs') return null;

	const shotOf = async (example: { component: string; name: string } | null) =>
		example ? await screenshot(example.component, example.name, load) : null;

	if (section === 'components') {
		// `webgl/Points` is `@layerchart/webgl`'s, whose names repeat LayerChart's
		const webgl = rest[0] === 'webgl';
		const [name, example] = webgl ? rest.slice(1) : rest;
		const slug = webgl ? `webgl/${name}` : name;
		const component = allComponents.find((c) => c.slug === slug);
		if (!component) return null;

		const catalog = await catalogOf(slug);
		const title = component.name ?? name;

		if (example && example !== 'examples') {
			if (!catalog?.examples.some((e) => e.name === example)) return null;
			return {
				eyebrow: `${webgl ? 'WebGL ' : ''}${title} example`,
				title: sentence(example),
				shot: await screenshot(slug, example, load)
			};
		}

		const category = sentence(component.category ?? 'Component');
		const label = webgl ? `WebGL · ${category}` : category;
		const lead =
			firstExample(component.content, slug) ??
			(catalog?.examples[0] ? { component: slug, name: catalog.examples[0].name } : null);
		return {
			eyebrow: example === 'examples' ? `${label} · Examples` : label,
			title,
			description: component.description,
			shot: await shotOf(lead)
		};
	}

	if (section === 'utils') {
		const util = allUtils.find((u) => u.slug === rest[0]);
		if (!util) return null;
		return {
			eyebrow: 'Utilities',
			title: util.name ?? util.slug,
			description: util.description,
			shot: await shotOf(firstExample(util.content, util.slug))
		};
	}

	if (section === 'guides') {
		const guide = allGuides.find((g) => g.slug === rest.join('/'));
		if (!guide) return null;
		return {
			eyebrow: 'Guide',
			title: guide.title,
			description: guide.description,
			shot: await shotOf(firstExample(guide.content))
		};
	}

	if (section === 'releases') {
		if (!rest.length) {
			return {
				eyebrow: 'Releases',
				title: 'Release notes',
				description: 'What changed in each version of LayerChart'
			};
		}
		const release = allReleases.find((r) => r.slug === rest[0]);
		if (!release) return null;
		return { eyebrow: `Release · ${releaseDate(release)}`, title: releaseName(release) };
	}

	if (section === 'getting-started') {
		const [markdown] = await Promise.all(Object.values(gettingStarted).map((load) => load()));
		return {
			eyebrow: 'Docs',
			title: 'Getting started',
			description: 'Install LayerChart and build your first chart with Svelte',
			shot: markdown ? await shotOf(firstExample(markdown)) : null
		};
	}

	if (section === 'examples') {
		const shots = await Promise.all(
			GALLERY.map(([component, name]) => screenshot(component, name, load, 400))
		);
		return {
			eyebrow: 'Docs',
			title: 'Examples',
			description: examplesPage.description,
			shots: shots.filter((shot) => shot != null)
		};
	}

	if (section === 'showcase') {
		return {
			eyebrow: 'Docs',
			title: 'Showcase',
			description: 'Sites and apps built with LayerChart'
		};
	}

	return null;
}

/** How long a card is kept.  Cards change only with a deploy, which bumps `OG_VERSION` when it changes them. */
const TTL = 60 * 60 * 24 * 7;

/** What `adapter-cloudflare` passes as `platform`, which the app does not declare in `App.Platform` */
type CloudflarePlatform = {
	env?: { ASSETS?: { fetch: typeof globalThis.fetch } };
	context?: { waitUntil(promise: Promise<unknown>): void };
};

export const GET: RequestHandler = async ({ params, url, platform }) => {
	const path = params.path.replace(/\/+$/, '');

	/*
		Filed under the path and the cards' version, and nothing else in the query, so it cannot be
		used to draw the same card over and over.
	*/
	const key = new URL(`/og/${path}`, url.origin);
	key.searchParams.set('v', OG_VERSION);
	const cacheKey = new Request(key);

	const cache = (globalThis as { caches?: { default?: Cache } }).caches?.default;
	const cached = await cache?.match(cacheKey);
	if (cached) return cached;

	/*
		A static file, from the Worker's assets directly rather than over the network.  Under `vite
		dev` the emulated binding serves the last build's output (or nothing), and SvelteKit's own
		`fetch` does not serve `static/`, so it goes to the dev server.
	*/
	const assets = (platform as CloudflarePlatform | undefined)?.env?.ASSETS;
	const load: Load = (file) =>
		(dev || !assets ? globalThis : assets).fetch(new URL(file, url.origin));

	const content = await draw(path, load);
	// Anything else - a page that has gone, or no page at all - gets the home page's card
	if (!content) return Response.redirect(new URL('/images/og-image.png', url.origin), 302);

	const { satori, Resvg } = await renderers();
	const svg = await satori(card(content), {
		width: WIDTH,
		height: HEIGHT,
		fonts: await loadFonts()
	});
	const png = (await Resvg.async(svg)).render().asPng() as Uint8Array<ArrayBuffer>;

	const response = new Response(png, {
		headers: {
			'content-type': 'image/png',
			'cache-control': `public, max-age=${TTL}`
		}
	});

	if (cache) {
		(platform as CloudflarePlatform | undefined)?.context?.waitUntil(
			cache.put(cacheKey, response.clone())
		);
	}
	return response;
};
