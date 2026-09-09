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

	/** Compiles the current source and mounts it into the attached element. */
	const preview: Attachment = (el) => {
		const sb = module;
		const src = debounced;
		if (!sb || !live) return;

		const result = sb.compileSource(transform ? transform(src) : src);
		diagnostics = result.diagnostics;
		elapsed = Math.round(result.elapsed);
		if (!result.url) return;

		let mounted: Record<string, any> | null = null;
		let disposed = false;

		import(/* @vite-ignore */ result.url)
			.then((mod) => {
				URL.revokeObjectURL(result.url!);
				if (disposed) return;
				runtimeError = null;
				mounted = mount(mod.default, { target: el as HTMLElement });
				instance = mounted;
			})
			.catch((err) => {
				URL.revokeObjectURL(result.url!);
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
		/** `null` until the user has edited — nothing worth reporting before that. */
		get status() {
			return runtimeError ?? errors[0]?.message ?? (live ? `${elapsed}ms` : null);
		},
		get hasError() {
			return runtimeError !== null || errors.length > 0;
		}
	};
}

export type Sandbox = ReturnType<typeof createSandbox>;
