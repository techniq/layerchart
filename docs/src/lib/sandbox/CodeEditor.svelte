<script lang="ts">
	import { untrack } from 'svelte';
	import {
		EditorView,
		keymap,
		drawSelection,
		dropCursor,
		rectangularSelection,
		crosshairCursor,
		highlightSpecialChars,
		lineNumbers as lineNumbersExt,
		highlightActiveLine,
		highlightActiveLineGutter
	} from '@codemirror/view';
	import { EditorState, Compartment } from '@codemirror/state';
	import {
		defaultKeymap,
		history,
		historyKeymap,
		indentWithTab
	} from '@codemirror/commands';
	import {
		indentOnInput,
		indentUnit,
		bracketMatching,
		syntaxHighlighting,
		HighlightStyle
	} from '@codemirror/language';
	import { tags as t } from '@lezer/highlight';
	import { closeBrackets, closeBracketsKeymap } from '@codemirror/autocomplete';
	import { setDiagnostics, lintKeymap } from '@codemirror/lint';
	import { svelte } from '@replit/codemirror-lang-svelte';
	import { javascript } from '@codemirror/lang-javascript';
	import { css } from '@codemirror/lang-css';
	import { html } from '@codemirror/lang-html';
	import { json } from '@codemirror/lang-json';
	import { getSettings } from 'svelte-ux';
	import type { Diagnostic } from './compile';

	let {
		value = $bindable(''),
		/** Drives syntax highlighting. Defaults to Svelte. */
		filename = 'Example.svelte',
		diagnostics = [],
		autofocus = false,
		/**
		 * Off by default: inline example editors swap in for a `Code` block that has no
		 * gutter, and adding one would shift every line sideways on activation. The
		 * playground, which has no read-only view to match, turns it on.
		 */
		lineNumbers = false,
		oninput,
		class: className
	}: {
		value?: string;
		filename?: string;
		diagnostics?: Diagnostic[];
		autofocus?: boolean;
		lineNumbers?: boolean;
		oninput?: (value: string) => void;
		class?: string;
	} = $props();

	let container = $state<HTMLDivElement | null>(null);
	// `$state` so the theme/diagnostics effects below re-run once the view exists.
	let view = $state<EditorView | null>(null);

	const themeCompartment = new Compartment();
	const languageCompartment = new Compartment();
	const { currentTheme } = getSettings();

	/**
	 * GitHub Primer token colours — the same palette shiki's `github-light-default` /
	 * `github-dark-default` themes use, which is what the read-only `Code` component
	 * renders with. Keeping these in step is what makes View and Edit look like the same
	 * block of code rather than two different editors.
	 */
	const palette = {
		light: {
			plain: '#1f2328',
			comment: '#6e7781',
			keyword: '#cf222e',
			constant: '#0550ae',
			string: '#0a3069',
			func: '#8250df',
			tag: '#116329',
			variable: '#953800',
			invalid: '#82071e'
		},
		dark: {
			plain: '#e6edf3',
			comment: '#8b949e',
			keyword: '#ff7b72',
			constant: '#79c0ff',
			string: '#a5d6ff',
			func: '#d2a8ff',
			tag: '#7ee787',
			variable: '#ffa657',
			invalid: '#ffa198'
		}
	};

	function highlightStyle(c: (typeof palette)['light']) {
		return HighlightStyle.define([
			{ tag: [t.comment, t.lineComment, t.blockComment, t.docComment], color: c.comment },
			{
				tag: [
					t.keyword,
					t.moduleKeyword,
					t.controlKeyword,
					t.operatorKeyword,
					t.definitionKeyword,
					t.modifier,
					t.self,
					t.null
				],
				color: c.keyword
			},
			{
				tag: [t.bool, t.number, t.integer, t.float, t.atom, t.constant(t.variableName)],
				color: c.constant
			},
			{ tag: [t.string, t.special(t.string), t.attributeValue], color: c.string },
			{ tag: [t.regexp], color: c.string },
			{
				tag: [t.function(t.variableName), t.function(t.propertyName), t.macroName],
				color: c.func
			},
			// `className` is what lezer-svelte gives a capitalised markup tag (`<AreaChart>`),
			// which shiki renders as a tag; `typeName` stays separate for TS annotations.
			{
				tag: [t.tagName, t.standard(t.tagName), t.special(t.tagName), t.className],
				color: c.tag
			},
			{ tag: [t.attributeName], color: c.constant },
			{ tag: [t.typeName, t.namespace], color: c.variable },
			{ tag: [t.propertyName, t.variableName, t.definition(t.variableName)], color: c.plain },
			{
				tag: [t.operator, t.punctuation, t.separator, t.bracket, t.angleBracket, t.meta],
				color: c.plain
			},
			{ tag: [t.invalid], color: c.invalid },
			{ tag: [t.link], color: c.constant, textDecoration: 'underline' },
			{ tag: [t.heading], color: c.constant, fontWeight: 'bold' },
			{ tag: [t.emphasis], fontStyle: 'italic' },
			{ tag: [t.strong], fontWeight: 'bold' }
		]);
	}

	const styles = { light: highlightStyle(palette.light), dark: highlightStyle(palette.dark) };

	/** Editor chrome (caret, selection, matching bracket) drawn from the docs surface tokens. */
	function chrome(dark: boolean) {
		return EditorView.theme(
			{
				'&': { color: dark ? palette.dark.plain : palette.light.plain },
				'.cm-cursor, .cm-dropCursor': {
					borderLeftColor: dark ? palette.dark.plain : palette.light.plain
				},
				'&.cm-focused .cm-selectionBackground, .cm-selectionBackground, .cm-content ::selection':
					{ backgroundColor: 'color-mix(in oklab, var(--color-primary) 22%, transparent)' },
				'.cm-matchingBracket, .cm-nonmatchingBracket': {
					backgroundColor: 'color-mix(in oklab, currentColor 12%, transparent)',
					outline: 'none'
				}
			},
			{ dark }
		);
	}

	const theme = (dark: boolean) => [chrome(dark), syntaxHighlighting(styles[dark ? 'dark' : 'light'])];

	function languageFor(name: string) {
		if (name.endsWith('.svelte')) return svelte();
		if (name.endsWith('.ts')) return javascript({ typescript: true });
		if (name.endsWith('.js')) return javascript();
		if (name.endsWith('.css')) return css();
		if (name.endsWith('.json')) return json();
		if (name.endsWith('.html')) return html();
		return svelte();
	}

	/**
	 * Matched to the read-only `Code` component so swapping one for the other doesn't
	 * move a single character: same mono stack, `text-sm` metrics (14px/20px), the same
	 * 1rem padding, and `tab-size: 2`. The background is left transparent so the
	 * surrounding panel supplies it, and there's no gutter — `Code` has no line numbers,
	 * and a gutter would shift every line sideways on activation.
	 */
	const appearance = EditorView.theme({
		// `!important` because the github theme sets its own `&` background and CodeMirror
		// injects the two style modules at equal specificity — the panel must win, or the
		// editor paints a different colour than the `Code` block it replaces.
		'&': { height: '100%', backgroundColor: 'transparent !important' },
		'.cm-scroller, .cm-content': { backgroundColor: 'transparent !important' },
		'&.cm-focused': { outline: 'none' },
		'.cm-scroller': {
			overflow: 'auto',
			fontFamily:
				'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace',
			fontSize: '14px',
			lineHeight: '20px'
		},
		'.cm-content': { padding: '1rem', tabSize: '2' },
		'.cm-line': { padding: '0' },
		'.cm-gutters': {
			backgroundColor: 'transparent !important',
			border: 'none',
			color: 'color-mix(in oklab, currentColor 35%, transparent)'
		}
	});

	/**
	 * `basicSetup` minus line numbers, fold gutter, active-line highlight and the search
	 * panel — the things that would either shift the layout or bloat the chunk. Lint state
	 * isn't listed because `setDiagnostics` appends it on first use.
	 */
	const setup = [
		...(untrack(() => lineNumbers)
			? [lineNumbersExt(), highlightActiveLineGutter(), highlightActiveLine()]
			: []),
		highlightSpecialChars(),
		history(),
		drawSelection(),
		dropCursor(),
		EditorState.allowMultipleSelections.of(true),
		indentOnInput(),
		// The examples are tab-indented; `Code` renders those at 2 columns via
		// `[tab-size:2]`. CodeMirror measures tabs itself, so the CSS alone isn't enough.
		EditorState.tabSize.of(2),
		indentUnit.of('\t'),
		bracketMatching(),
		closeBrackets(),
		rectangularSelection(),
		crosshairCursor(),
		keymap.of([...closeBracketsKeymap, ...defaultKeymap, ...historyKeymap, ...lintKeymap])
	];

	/**
	 * Build the editor exactly once per container. Everything this reads to seed the
	 * initial state (`value`, the theme) is untracked — otherwise typing a character
	 * would re-run the effect and tear the whole editor down mid-keystroke. Ongoing
	 * changes are pushed in by the effects below instead.
	 */
	$effect(() => {
		if (!container) return;

		const parent = container;
		const instance = new EditorView({
			parent,
			state: EditorState.create({
				doc: untrack(() => value),
				extensions: [
					setup,
					languageCompartment.of(languageFor(untrack(() => filename))),
					keymap.of([indentWithTab]),
					themeCompartment.of(theme(untrack(() => $currentTheme.dark))),
					appearance,
					EditorView.updateListener.of((update) => {
						if (update.docChanged) {
							const next = update.state.doc.toString();
							value = next;
							oninput?.(next);
						}
					})
				]
			})
		});
		view = instance;

		if (untrack(() => autofocus)) instance.focus();

		return () => {
			instance.destroy();
			if (view === instance) view = null;
		};
	});

	// External edits (ex. a "reset" button). Typing already matches, so this is a no-op then.
	$effect(() => {
		const next = value;
		if (view && next !== view.state.doc.toString()) {
			view.dispatch({ changes: { from: 0, to: view.state.doc.length, insert: next } });
		}
	});

	$effect(() => {
		const dark = $currentTheme.dark;
		view?.dispatch({ effects: themeCompartment.reconfigure(theme(dark)) });
	});

	$effect(() => {
		const name = filename;
		view?.dispatch({ effects: languageCompartment.reconfigure(languageFor(name)) });
	});

	$effect(() => {
		if (!view) return;
		const length = view.state.doc.length;
		view.dispatch(
			setDiagnostics(
				view.state,
				// Positions come from a possibly-stale compile; clamp so CodeMirror doesn't throw.
				diagnostics.map((d) => ({
					from: Math.min(d.from, length),
					to: Math.min(Math.max(d.to, d.from), length),
					severity: d.severity,
					message: d.message
				}))
			)
		);
	});
</script>

<div bind:this={container} class={className}></div>
