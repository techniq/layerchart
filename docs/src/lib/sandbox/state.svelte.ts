import { mount, unmount, untrack } from 'svelte';
import type { Attachment } from 'svelte/attachments';
import { normalizeSource } from '$lib/utils/exampleSource';
import type { Diagnostic } from './compile';

type SandboxModule = typeof import('./lazy');

/**
 * Everything needed to turn a read-only example into an editable one, shared by
 * `Example` (stacked, code behind a disclosure) and `LiveExample` (side-by-side).
 *
 * Must be called during component initialisation — it registers effects.
 */
export function createSandbox(
	getSource: () => string,
	/** Applied to the source before compiling only — never shown in the editor. */
	transform?: (source: string) => string
) {
	let module = $state<SandboxModule | null>(null);
	let loading = $state(false);
	let pending = $state(false);
	let loadError = $state<string | null>(null);

	let mode = $state<'view' | 'edit'>('view');
	let live = $state(false);

	/**
	 * `Example` resolves its source asynchronously, so these are seeded on first sight of a
	 * non-empty source rather than at construction. Normalised so the editor starts from
	 * exactly the text `Code` displays — otherwise Edit shows a trailing blank line View
	 * doesn't have.
	 */
	const seed = () => normalizeSource(getSource());
	let original = $state(untrack(seed));
	let editorValue = $state(untrack(seed));
	let debounced = $state(untrack(seed));

	let diagnostics = $state<Diagnostic[]>([]);
	let elapsed = $state(0);
	let runtimeError = $state<string | null>(null);
	/**
	 * `$state.raw` — `mount()` returns an exports object whose properties are getters onto
	 * the component's reactive state. Wrapping that in a `$state` proxy breaks them, so
	 * `instance.data` reads back `undefined` and the Data dialog vanishes after an edit.
	 */
	let instance = $state.raw<Record<string, any> | null>(null);

	$effect(() => {
		const next = seed();
		untrack(() => {
			if (next && !original) {
				original = next;
				editorValue = next;
				debounced = next;
			}
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
		if (module) return Promise.resolve();
		if (!inFlight) {
			loading = true;
			inFlight = import('./lazy')
				.then((m) => {
					module = m;
				})
				.catch((err) => {
					loadError = err instanceof Error ? err.message : String(err);
				})
				.finally(() => {
					loading = false;
				});
		}
		return inFlight;
	}

	async function setMode(next: 'view' | 'edit') {
		if (next === 'edit' && !module) {
			// `pending` is distinct from `loading`: the hover prefetch sets `loading` too, and
			// showing progress for a speculative fetch the user never asked for is just noise.
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

		const result = sb.compileSource(transform ? transform(src) : src);
		diagnostics = result.diagnostics;
		elapsed = Math.round(result.elapsed);
		if (result.url) {
			build = result.url;
			runtimeError = null;
		}
	});

	/** Mounts the newest successful build. Only re-runs when `build` changes. */
	const preview: Attachment = (el) => {
		const url = build;
		if (!url) return;

		let mounted: Record<string, any> | null = null;
		let disposed = false;

		import(/* @vite-ignore */ url)
			.then((mod) => {
				URL.revokeObjectURL(url);
				if (disposed) return;
				runtimeError = null;
				mounted = mount(mod.default, { target: el as HTMLElement });
				instance = mounted;
			})
			.catch((err) => {
				URL.revokeObjectURL(url);
				if (!disposed) runtimeError = err instanceof Error ? err.message : String(err);
			});

		return () => {
			disposed = true;
			if (mounted) {
				unmount(mounted);
				if (instance === mounted) instance = null;
			}
		};
	};

	const errors = $derived(diagnostics.filter((d) => d.severity === 'error'));

	/** The one thing worth surfacing over the preview, or `null` when the build is good. */
	const error = $derived.by(() => {
		if (runtimeError) return { message: runtimeError, line: undefined, column: undefined };
		const first = errors[0];
		return first ? { message: first.message, line: first.line, column: first.column } : null;
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
		},
		/** Compile timing, or `null` until the user has edited. */
		get status() {
			return live ? `${elapsed}ms` : null;
		}
	};
}

export type Sandbox = ReturnType<typeof createSandbox>;
