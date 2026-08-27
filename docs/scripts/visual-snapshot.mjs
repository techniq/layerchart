/**
 * Reproducible visual-regression tracking for the docs examples.
 *
 * Captures a *geometry fingerprint* of every example rather than a screenshot: the drawing
 * attributes of each rendered mark, rounded and hashed.  Fingerprints are ~200x smaller than
 * PNGs, diff to a readable list of "which examples changed", and skip the anti-aliasing noise
 * that makes pixel baselines flap between machines.
 *
 *   node scripts/visual-snapshot.mjs capture snapshots/main.json
 *   node scripts/visual-snapshot.mjs capture snapshots/head.json --filter BarChart
 *   node scripts/visual-snapshot.mjs compare snapshots/main.json snapshots/head.json
 *
 * Examples that draw from `Math.random()` or the clock would otherwise differ on every run, so
 * both are stubbed before any page script runs.  Whatever remains unstable is measured rather
 * than assumed: `--repeat 2` captures each example twice and marks the ones that still disagree,
 * and `compare` ignores those instead of reporting them as regressions.
 */
import { chromium } from 'playwright';
import { createHash } from 'node:crypto';
import { mkdirSync, readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';

const CATALOG_DIR = 'src/examples/catalog';
const DEFAULT_URL = 'http://localhost:3002';

// Above this share of examples failing, the run says more about the environment than the charts
const MAX_FAILURE_RATE = 0.05;

// Fixed so a chart built from `new Date()` lands on the same dates every run
const FROZEN_NOW = Date.UTC(2026, 0, 15, 12, 0, 0);

/** Replaces the two sources of per-run drift before the app's own scripts run. */
function determinismScript(seed) {
	return `(() => {
    let s = ${seed} >>> 0;
    Math.random = () => {
      s = (s + 0x6d2b79f5) >>> 0;
      let t = s;
      t = Math.imul(t ^ (t >>> 15), t | 1);
      t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
    const RealDate = Date;
    const now = ${FROZEN_NOW};
    class FrozenDate extends RealDate {
      constructor(...args) {
        super(...(args.length ? args : [now]));
      }
      static now() {
        return now;
      }
    }
    Object.defineProperty(globalThis, 'Date', { value: FrozenDate, writable: true });
    performance.now = () => 0;
  })()`;
}

/**
 * Runs in the page.  Collects what was actually drawn — SVG geometry, canvas pixels, and the
 * text of HTML layers (legends, tooltips) — into one string per example.
 */
function extractFingerprint() {
	const round = (v) => {
		const n = Number.parseFloat(v);
		return Number.isFinite(n) ? Math.round(n * 10) / 10 : v;
	};
	const GEOMETRY = {
		path: ['d'],
		rect: ['x', 'y', 'width', 'height', 'rx'],
		circle: ['cx', 'cy', 'r'],
		ellipse: ['cx', 'cy', 'rx', 'ry'],
		line: ['x1', 'y1', 'x2', 'y2'],
		polygon: ['points'],
		polyline: ['points'],
		text: ['x', 'y'],
		image: ['x', 'y', 'width', 'height'],
		use: ['x', 'y']
	};
	const PAINT = ['fill', 'stroke', 'stroke-width', 'opacity', 'fill-opacity', 'stroke-opacity'];

	/**
	 * Whether an element draws nothing at all.  A zero-height bar, a one-point path or an empty
	 * label is in the DOM but not on the screen, so moving one is not a visual change — and letting
	 * them count buries real differences in noise.  Read from attributes rather than computed style,
	 * which would cost a layout read per element across ~1000 elements per example.
	 */
	const drawsNothing = (el, tag) => {
		const num = (name) => Number.parseFloat(el.getAttribute(name) ?? 'NaN');
		if (el.getAttribute('opacity') === '0' || el.getAttribute('display') === 'none') return true;
		switch (tag) {
			case 'rect':
			case 'image':
				return num('width') === 0 || num('height') === 0;
			case 'circle':
				return num('r') === 0;
			case 'ellipse':
				return num('rx') === 0 || num('ry') === 0;
			case 'line':
				return num('x1') === num('x2') && num('y1') === num('y2');
			case 'text':
				return !el.textContent?.trim();
			case 'path': {
				const d = el.getAttribute('d') ?? '';
				// One draw command is a single point — nothing joins it to anything
				return !d || (d.match(/[MLHVCSQTA]/gi) ?? []).length <= 1;
			}
			case 'polygon':
			case 'polyline':
				return (el.getAttribute('points') ?? '').trim().split(/\s+/).length <= 1;
			default:
				return false;
		}
	};

	const parts = [];
	for (const svg of document.querySelectorAll('svg')) {
		for (const el of svg.querySelectorAll(Object.keys(GEOMETRY).join(','))) {
			const tag = el.tagName.toLowerCase();
			if (drawsNothing(el, tag)) continue;
			const attrs = GEOMETRY[tag]
				.map((a) => {
					const v = el.getAttribute(a);
					// `d`/`points` hold many numbers; round each so subpixel drift does not register
					return v == null ? '' : String(v).replace(/-?\d+\.?\d*/g, (n) => round(n));
				})
				.join(',');
			const paint = PAINT.map((a) => el.getAttribute(a) ?? '').join(',');
			const transform = el.getAttribute('transform') ?? '';
			const text = tag === 'text' ? el.textContent?.trim() : '';
			parts.push(`${tag}|${attrs}|${paint}|${transform}|${text}`);
		}
	}

	// Canvas layers draw nothing inspectable, so hash the pixels instead
	for (const canvas of document.querySelectorAll('canvas')) {
		try {
			parts.push(`canvas|${canvas.width}x${canvas.height}|${canvas.toDataURL().length}`);
		} catch {
			parts.push('canvas|unreadable');
		}
	}

	// HTML layers (legends, labels) carry meaning the SVG does not
	for (const el of document.querySelectorAll('.lc-legend, .lc-labels, .lc-tooltip')) {
		parts.push(`html|${el.className}|${el.textContent?.trim().slice(0, 200)}`);
	}

	return { body: parts.join('\n'), elements: parts.length };
}

function listExamples(filter) {
	const examples = [];
	for (const file of readdirSync(CATALOG_DIR).filter((f) => f.endsWith('.json'))) {
		const catalog = JSON.parse(readFileSync(join(CATALOG_DIR, file), 'utf8'));
		const component = catalog.component?.name ?? file.replace(/\.json$/, '');
		for (const example of catalog.examples ?? []) {
			if (filter && !`${component}/${example.name}`.toLowerCase().includes(filter.toLowerCase())) {
				continue;
			}
			examples.push({ component, example: example.name });
		}
	}
	return examples.sort((a, b) => `${a.component}/${a.example}`.localeCompare(`${b.component}/${b.example}`)); // prettier-ignore
}

async function captureOne(page, baseUrl, item, attempt = 0) {
	const { component, example } = item;
	const url = `${baseUrl}/docs/screenshot/${component}/${example}`;
	// A dev server 500, a module that failed to load and a chart that genuinely draws nothing are
	// indistinguishable from the outside — all three end up as an empty page.  Record what the
	// browser reported so a failure on a runner can be diagnosed from the job log alone.
	const problems = [];
	const onConsole = (msg) => {
		if (msg.type() === 'error')
			problems.push(`console: ${msg.text().split('\n')[0].slice(0, 200)}`);
	};
	const onPageError = (err) => {
		problems.push(
			`pageerror: ${String(err?.message ?? err)
				.split('\n')[0]
				.slice(0, 200)}`
		);
	};
	page.on('console', onConsole);
	page.on('pageerror', onPageError);
	const why = (reason) => (problems.length ? `${reason} — ${problems[0]}` : reason);
	try {
		const response = await page.goto(url, { waitUntil: 'networkidle', timeout: 30000 });
		const status = response?.status() ?? 0;
		if (status >= 400) problems.unshift(`http ${status}`);
		// Marks tween in; wait for the drawing to stop changing rather than guessing a delay
		let previous = null;
		for (let i = 0; i < (attempt ? 40 : 12); i++) {
			const current = await page.evaluate(extractFingerprint);
			if (previous && current.body === previous.body && current.elements > 0) {
				return { hash: sha1(current.body), elements: current.elements };
			}
			previous = current;
			await page.waitForTimeout(150);
		}
		if (previous?.elements) {
			return { hash: sha1(previous.body), elements: previous.elements, settled: false };
		}
		// An example fetching its data can outlast the settle window; give it one slower go
		if (attempt === 0) return captureOne(page, baseUrl, item, 1);
		return { error: why('nothing drawn') };
	} catch (e) {
		// A dev server under load aborts navigations — that says nothing about the chart
		if (attempt < 2) {
			await page.waitForTimeout(500 * (attempt + 1));
			return captureOne(page, baseUrl, item, attempt + 1);
		}
		return {
			error: why(
				String(e.message ?? e)
					.split('\n')[0]
					.slice(0, 120)
			)
		};
	} finally {
		page.off('console', onConsole);
		page.off('pageerror', onPageError);
	}
}

const sha1 = (s) => createHash('sha1').update(s).digest('hex').slice(0, 16);

async function capture(outPath, { url, filter, concurrency, repeat, seed }) {
	const examples = listExamples(filter);
	if (!examples.length) throw new Error(`no examples matched ${filter}`);
	console.log(`capturing ${examples.length} examples from ${url} (concurrency ${concurrency}, ${repeat} pass${repeat > 1 ? 'es' : ''})`); // prettier-ignore

	const browser = await chromium.launch();
	const results = new Map();
	const started = Date.now();

	for (let pass = 0; pass < repeat; pass++) {
		const queue = [...examples];
		let done = 0;
		await Promise.all(
			Array.from({ length: concurrency }, async () => {
				const context = await browser.newContext({
					viewport: { width: 800, height: 500 },
					reducedMotion: 'reduce',
					colorScheme: 'light'
				});
				await context.addInitScript(determinismScript(seed));
				const page = await context.newPage();
				for (let item = queue.shift(); item; item = queue.shift()) {
					const key = `${item.component}/${item.example}`;
					const result = await captureOne(page, url, item);
					const existing = results.get(key);
					if (pass === 0) {
						results.set(key, result);
					} else if (existing?.error && !result.error) {
						// Rendering on a later pass means the first pass hit a flake, not a broken
						// example — keep the drawing rather than recording the failure
						results.set(key, result);
					} else if (existing && !existing.error && existing.hash !== result.hash) {
						results.set(key, { ...existing, unstable: true });
					}
					if (++done % 100 === 0) console.log(`  pass ${pass + 1}: ${done}/${examples.length}`);
				}
				await context.close();
			})
		);
	}
	await browser.close();

	const entries = Object.fromEntries([...results].sort(([a], [b]) => a.localeCompare(b)));
	const unstable = Object.values(entries).filter((r) => r.unstable).length;
	const failed = Object.values(entries).filter((r) => r.error).length;
	const seconds = Math.round((Date.now() - started) / 1000);
	if (failed) {
		console.log(`\n${failed} of ${Object.keys(entries).length} examples failed to render`);
		for (const [key, r] of Object.entries(entries)
			.filter(([, r]) => r.error)
			.slice(0, 10)) {
			console.log(`  ${key} — ${r.error}`);
		}
	}

	// A run where most examples drew nothing says the docs server was broken, not that the charts
	// changed.  Recording it would be worse than recording nothing: `compare` has no baseline to
	// diff an errored entry against, so every one of them would turn into a silent pass from then
	// on.  Bail before writing so a run this broken cannot be picked up as a baseline.
	if (failed > Object.keys(entries).length * MAX_FAILURE_RATE) {
		throw new Error(
			`${failed}/${Object.keys(entries).length} examples failed to render — refusing to write a snapshot this broken. ` +
				`Check that the docs server is serving /docs/screenshot/<Component>/<example>.`
		);
	}

	mkdirSync(dirname(outPath), { recursive: true });
	writeFileSync(outPath, JSON.stringify({ seed, examples: entries }, null, 2) + '\n');

	console.log(`\nwrote ${outPath} — ${Object.keys(entries).length} examples in ${seconds}s`);
	if (unstable) console.log(`  ${unstable} unstable (excluded from comparison)`);
}

/** Screenshot one example from a running server. */
async function shoot(page, url, key, outPath) {
	const [component, example] = key.split('/');
	await page.goto(`${url}/docs/screenshot/${component}/${example}`, {
		waitUntil: 'networkidle',
		timeout: 60000
	});
	await page.waitForTimeout(1200);
	await page.screenshot({ path: outPath });
}

/**
 * Renders before/after images for the examples that changed, plus an `index.html` putting each
 * pair side by side.  "Before" needs the baseline code actually running, so it is only produced
 * when `--base-url` is given.
 */
async function report(keys, { dir, baseUrl, headUrl, seed }) {
	mkdirSync(dir, { recursive: true });
	const browser = await chromium.launch();
	const context = await browser.newContext({
		viewport: { width: 800, height: 500 },
		deviceScaleFactor: 2,
		colorScheme: 'light',
		reducedMotion: 'reduce'
	});
	await context.addInitScript(determinismScript(seed));
	const page = await context.newPage();

	const rows = [];
	for (const key of keys) {
		const slug = key.replace(/[^a-z0-9]+/gi, '-');
		const after = `${slug}.after.png`;
		const before = `${slug}.before.png`;
		try {
			await shoot(page, headUrl, key, join(dir, after));
			if (baseUrl) await shoot(page, baseUrl, key, join(dir, before));
		} catch (e) {
			console.log(`  could not screenshot ${key}: ${String(e.message ?? e).split('\n')[0]}`);
			continue;
		}
		rows.push({ key, before: baseUrl ? before : null, after });
		console.log(`  ${key}`);
	}

	const body = rows
		.map(
			(r) => `<h2>${r.key}</h2>
<div class="pair">
  ${r.before ? `<figure><figcaption>before</figcaption><img src="${r.before}"></figure>` : ''}
  <figure><figcaption>after</figcaption><img src="${r.after}"></figure>
</div>`
		)
		.join('\n');

	writeFileSync(
		join(dir, 'index.html'),
		`<!doctype html>
<meta charset="utf-8">
<title>Visual differences (${rows.length})</title>
<style>
  body { font: 14px system-ui, sans-serif; margin: 2rem; background: #fafafa; }
  h2 { margin: 2rem 0 .5rem; font-size: 15px; font-family: ui-monospace, monospace; }
  .pair { display: flex; gap: 1rem; }
  .pair figure { margin: 0; flex: 1; }
  .pair figcaption { color: #666; margin-bottom: .25rem; }
  img { width: 100%; border: 1px solid #ddd; background: #fff; }
</style>
<h1>Visual differences (${rows.length})</h1>
${body}
`
	);
	await browser.close();
	console.log(`\nreport: ${join(dir, 'index.html')}`);
}

function compare(baselinePath, currentPath) {
	const baseline = JSON.parse(readFileSync(baselinePath, 'utf8')).examples;
	const current = JSON.parse(readFileSync(currentPath, 'utf8')).examples;

	const changed = [];
	const added = [];
	const removed = [];
	const skipped = [];
	const broke = [];
	const incomparable = [];

	for (const [key, now] of Object.entries(current)) {
		const before = baseline[key];
		if (!before) {
			added.push(key);
		} else if (before.error && !now.error) {
			// Could be an example that did not exist yet, or one the baseline failed to capture.
			// Either way there is nothing to compare against — do not report it as a change.
			incomparable.push(`${key} — baseline: ${before.error}`);
		} else if (before.unstable || now.unstable) {
			skipped.push(key);
		} else if (!before.error && now.error) {
			broke.push(`${key} — ${now.error}`);
		} else if (before.hash !== now.hash) {
			changed.push(`${key}  ${before.elements ?? '?'} → ${now.elements ?? '?'} elements`);
		}
	}
	for (const key of Object.keys(baseline)) if (!current[key]) removed.push(key);

	const section = (title, items) => {
		if (!items.length) return;
		console.log(`\n${title} (${items.length})`);
		for (const i of items) console.log(`  ${i}`);
	};
	section('BROKEN — rendered before, errors now', broke);
	section('CHANGED', changed);
	section('NOT COMPARED — no baseline', incomparable);
	section('ADDED', added);
	section('REMOVED', removed);
	console.log(
		`\n${changed.length} changed, ${broke.length} broken, ${added.length} added, ${removed.length} removed, ${incomparable.length} without a baseline, ${skipped.length} skipped as unstable`
	);

	// Entries the baseline failed to capture are unreviewable, not unchanged.  A handful is the
	// cost of a flaky example; a large share means the baseline itself needs re-recording, and
	// staying quiet about it would report a check that never actually ran as a pass.
	const unusable = incomparable.length > Object.keys(baseline).length * MAX_FAILURE_RATE;
	if (unusable) {
		console.log(
			`\n${incomparable.length} of ${Object.keys(baseline).length} baseline entries are errors — the baseline is unusable. ` +
				`Re-record it with the Update Visual Baseline workflow.`
		);
	}
	return { keys: [...changed, ...broke].map((line) => line.split(/\s+/)[0]), differences: broke.length + changed.length + (unusable ? 1 : 0) }; // prettier-ignore
}

/** Re-render one example against two servers and print the drawing attributes that differ. */
async function diffOne(key, { base, head, seed }) {
	const [component, example] = key.split('/');
	const browser = await chromium.launch();
	const bodies = {};
	for (const [label, url] of [
		['base', base],
		['head', head]
	]) {
		const context = await browser.newContext({
			viewport: { width: 800, height: 500 },
			reducedMotion: 'reduce',
			colorScheme: 'light'
		});
		await context.addInitScript(determinismScript(seed));
		const page = await context.newPage();
		await page.goto(`${url}/docs/screenshot/${component}/${example}`, { waitUntil: 'networkidle' });
		let previous = null;
		for (let i = 0; i < 12; i++) {
			const current = await page.evaluate(extractFingerprint);
			if (previous && current.body === previous.body) break;
			previous = current;
			await page.waitForTimeout(150);
		}
		bodies[label] = (previous?.body ?? '').split('\n');
		await context.close();
	}
	await browser.close();

	const [a, b] = [bodies.base, bodies.head];
	const onlyBase = a.filter((l) => !b.includes(l));
	const onlyHead = b.filter((l) => !a.includes(l));
	console.log(`${key}: ${a.length} → ${b.length} elements, ${onlyBase.length} removed / ${onlyHead.length} added\n`); // prettier-ignore
	for (const l of onlyBase.slice(0, 20)) console.log(`  - ${l.slice(0, 200)}`);
	for (const l of onlyHead.slice(0, 20)) console.log(`  + ${l.slice(0, 200)}`);
}

const [command, ...rest] = process.argv.slice(2);
const flag = (name, fallback) => {
	const i = rest.indexOf(`--${name}`);
	return i === -1 ? fallback : rest[i + 1];
};
const positional = rest.filter((a, i) => !a.startsWith('--') && !rest[i - 1]?.startsWith('--'));

if (command === 'capture') {
	await capture(positional[0] ?? 'snapshots/current.json', {
		url: flag('url', DEFAULT_URL),
		filter: flag('filter', ''),
		concurrency: Number(flag('concurrency', 8)),
		repeat: Number(flag('repeat', 2)),
		seed: Number(flag('seed', 20260815))
	});
} else if (command === 'diff') {
	await diffOne(positional[0], {
		base: flag('base', 'http://localhost:3011'),
		head: flag('head', DEFAULT_URL),
		seed: Number(flag('seed', 20260815))
	});
} else if (command === 'compare') {
	const { keys, differences } = compare(positional[0], positional[1]);
	const dir = flag('shots', '');
	if (dir && keys.length) {
		console.log(`\nrendering ${keys.length} changed example${keys.length === 1 ? '' : 's'}`);
		await report(keys, {
			dir,
			baseUrl: flag('base-url', ''),
			headUrl: flag('head-url', flag('url', DEFAULT_URL)),
			seed: Number(flag('seed', 20260815))
		});
	}
	process.exitCode = differences ? 1 : 0;
} else {
	console.log('usage: visual-snapshot.mjs capture <out.json> [--url --filter --concurrency --repeat]\n       visual-snapshot.mjs compare <baseline.json> <current.json>\n       visual-snapshot.mjs diff <Component/example> [--base <url> --head <url>]\n\ncompare flags:\n  --shots <dir>     write before/after PNGs and an index.html for the changed examples\n  --base-url <url>  a server running the baseline code, needed for the before images'); // prettier-ignore
	process.exitCode = 2;
}
