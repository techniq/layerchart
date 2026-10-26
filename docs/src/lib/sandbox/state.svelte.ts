import { mount, settled, unmount, untrack } from 'svelte';
import type { Attachment } from 'svelte/attachments';
import { normalizeSource } from '$lib/utils/exampleSource';
import type { Diagnostic } from './compile';

type SandboxModule = typeof import('./lazy');

/**
 * Everything `Example` needs to turn a read-only example into an editable one.
 *
 * Must be called during component initialisation — it registers effects.
 */
export function createSandbox(
	getSource: () => string,
	{
		transform,
		base
	}: {
		/** Applied to the source before compiling only — never shown in the editor. */
		transform?: (source: string) => string;
		/** The example's directory (`/src/examples/components/GeoPath/`), for relative imports. */
		base?: () => string | undefined;
	} = {}
) {
	let module = $state<SandboxModule | null>(null);
	let pending = $state(false);
	let loadError = $state<string | null>(null);

	let mode = $state<'view' | 'edit'>('view');
	let live = $state(false);

	/**
	 * `Example` resolves its source asynchronously, so these are seeded when a non-empty
	 * source arrives rather than at construction. Normalised so the editor starts from
	 * exactly the text `Code` displays — otherwise Edit shows a trailing blank line View
	 * doesn't have.
	 */
	const seed = () => normalizeSource(getSource());
	const initial = untrack(seed);
	let original = $state(initial);
	let editorValue = $state(initial);
	let debounced = $state(initial);

	let diagnostics = $state<Diagnostic[]>([]);
	let runtimeError = $state<string | null>(null);
	/**
	 * `$state.raw` — `mount()` returns an exports object whose properties are getters onto
	 * the component's reactive state. Wrapping that in a `$state` proxy breaks them, so
	 * `instance.data` reads back `undefined` and the Data dialog vanishes after an edit.
	 */
	let instance = $state.raw<Record<string, any> | null>(null);

	/**
	 * A different source is a different example: SvelteKit keeps the same `Example` when
	 * navigating between examples, so start over rather than keep showing (and running)
	 * the previous one. Edits never change `getSource()`, so typing can't land here.
	 */
	$effect(() => {
		const next = seed();
		untrack(() => {
			if (!next || next === original) return;
			original = editorValue = debounced = next;
			live = false;
			build = null;
			diagnostics = [];
			runtimeError = null;
			instance = null;
		});
	});

	/**
	 * The real example keeps rendering until the source actually changes. Compiling on
	 * activation instead would remount the chart the moment the editor opens, and examples
	 * built on `createDateSeries` and friends draw fresh `Math.random()` data every mount —
	 * so merely looking at the source would appear to redraw the chart. Latched, because
	 * toggling back on undo would reshuffle again.
	 */
	$effect(() => {
		if (editorValue !== untrack(() => original)) live = true;
	});

	$effect(() => {
		const next = editorValue;
		const timer = setTimeout(() => (debounced = next), 120);
		return () => clearTimeout(timer);
	});

	/**
	 * Returns the in-flight promise rather than bailing out when a fetch is already running:
	 * a click landing mid-prefetch has to await the *same* load, otherwise it resolves
	 * immediately and switches to a mode whose editor doesn't exist yet.
	 */
	let inFlight: Promise<void> | null = null;
	function load() {
		// Constant per build, so the server build drops the editor chunk entirely. It only
		// ever loads on a click, and server-side it would pull the compiler, CodeMirror and
		// every package an edit can import into the Cloudflare Worker.
		if (import.meta.env.SSR) return Promise.resolve();
		if (module) return Promise.resolve();
		inFlight ??= import('./lazy')
			.then((m) => {
				module = m;
			})
			.catch((err) => {
				loadError = err instanceof Error ? err.message : String(err);
			});
		return inFlight;
	}

	async function setMode(next: 'view' | 'edit') {
		if (next === 'edit' && !module) {
			// Only for a load the user asked for: the hover prefetch shows no progress, since
			// a spinner for a fetch nobody requested is just noise.
			pending = true;
			await load();
			pending = false;
		}
		mode = next;
	}

	/**
	 * Compiling and mounting are deliberately separate.
	 *
	 * Compiling on every keystroke but only publishing *successful* builds means a broken
	 * edit leaves the last good render on screen instead of blanking the preview — you can
	 * still see what you were working on while you fix the typo, which is the whole point
	 * of a live editor.
	 */
	let build = $state<string | null>(null);

	$effect(() => {
		const sb = module;
		const src = debounced;
		if (!sb || !live) return;

		// Compiling is async (imports load on demand), so a slow build can finish after a
		// newer one — drop it rather than let it replace what the user typed since.
		let stale = false;
		sb.compileSource(transform ? transform(src) : src, { base: base?.() }).then((result) => {
			if (stale) {
				if (result.url) URL.revokeObjectURL(result.url);
				return;
			}
			diagnostics = result.diagnostics;
			if (result.url) {
				build = result.url;
				runtimeError = null;
			}
		});
		return () => {
			stale = true;
		};
	});

	/** Whether an edited build is on screen. Until then `Example` keeps the real example up. */
	let showing = $state(false);

	/**
	 * Mounts each successful build without blanking the preview.
	 *
	 * Unmounting the old component and then mounting the new one leaves the preview empty
	 * for a frame or more (the module import is async, and charts draw only after
	 * measuring their container), and the collapsed height makes the page jump. Instead
	 * the new component mounts into a hidden layer the preview's width, gets time to
	 * finish (async data, then a couple of frames to measure and draw), and replaces
	 * what's on screen in one step. A build that throws while mounting leaves the last
	 * one up.
	 */
	const preview: Attachment<HTMLElement> = (el) => {
		let current: Mounted | null = null;

		$effect(() => {
			const url = build;
			if (!url) return;
			let superseded = false;

			(async () => {
				const layer = document.createElement('div');
				layer.style.cssText = HIDDEN_LAYER;
				let next: Mounted | null = null;
				try {
					const mod = await import(/* @vite-ignore */ url);
					if (superseded) return;
					el.append(layer);
					next = { layer, component: mount(mod.default, { target: layer }) };
					await Promise.race([settled(), delay(1000)]);
					await frames(2);
				} catch (err) {
					dispose(next);
					layer.remove();
					if (!superseded) runtimeError = err instanceof Error ? err.message : String(err);
					return;
				} finally {
					URL.revokeObjectURL(url);
				}
				if (superseded) return dispose(next);

				dispose(current);
				layer.style.cssText = '';
				current = next;
				instance = next.component;
				runtimeError = null;
				showing = true;
			})();

			return () => {
				superseded = true;
			};
		});

		return () => {
			dispose(current);
			current = null;
			instance = null;
			showing = false;
		};
	};

	const errors = $derived(diagnostics.filter((d) => d.severity === 'error'));

	/**
	 * The one thing worth surfacing over the preview, or `null` when the build is good. A
	 * compile error wins: it's about the source as typed now, while a runtime error belongs
	 * to the last build that compiled.
	 */
	const error = $derived.by(() => {
		const first = errors[0];
		if (first) {
			return {
				kind: 'compile' as const,
				message: first.message,
				line: first.line,
				column: first.column
			};
		}
		return runtimeError ? { kind: 'runtime' as const, message: runtimeError } : null;
	});

	return {
		preview,
		load,
		setMode,
		reset: () => (editorValue = original),

		get module() {
			return module;
		},
		get mode() {
			return mode;
		},
		get live() {
			return live;
		},
		get pending() {
			return pending;
		},
		get loadError() {
			return loadError;
		},
		get diagnostics() {
			return diagnostics;
		},
		get instance() {
			return instance;
		},
		get showing() {
			return showing;
		},
		get dirty() {
			return editorValue !== original;
		},
		get source() {
			return editorValue;
		},
		set source(next: string) {
			editorValue = next;
		},
		get error() {
			return error;
		}
	};
}

export type Sandbox = ReturnType<typeof createSandbox>;

type Mounted = { layer: HTMLElement; component: Record<string, any> };

/** Laid out at the preview's width so charts measure correctly, but not seen or hit. */
const HIDDEN_LAYER = 'position:absolute;inset-inline:0;top:0;visibility:hidden;pointer-events:none';

function dispose(mounted: Mounted | null) {
	if (!mounted) return;
	unmount(mounted.component);
	mounted.layer.remove();
}

const delay = (ms: number) => new Promise((done) => setTimeout(done, ms));

function frames(count: number) {
	return new Promise<void>((done) => {
		const step = (left: number) => (left ? requestAnimationFrame(() => step(left - 1)) : done());
		step(count);
	});
}
