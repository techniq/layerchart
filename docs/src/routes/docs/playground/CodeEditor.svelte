<script lang="ts">
	import { onMount, onDestroy } from 'svelte';
	import { EditorView, basicSetup } from 'codemirror';
	import { javascript } from '@codemirror/lang-javascript';
	import { html } from '@codemirror/lang-html';
	import { css } from '@codemirror/lang-css';
	import { githubLight, githubDark } from '@uiw/codemirror-theme-github';
	import { EditorState, Compartment } from '@codemirror/state';
	import { getSettings } from 'svelte-ux';

	let {
		value = $bindable(''),
		filename = '',
		oninput = () => {}
	}: {
		value?: string;
		filename?: string;
		oninput?: (value: string) => void;
	} = $props();

	let editorContainer: HTMLDivElement;
	let editorView: EditorView | null = null;
	let updating = false;

	// Use Compartments for reconfigurable extensions
	const languageCompartment = new Compartment();
	const themeCompartment = new Compartment();

	// Get current theme mode from svelte-ux settings
	const { currentTheme } = getSettings();

	// Determine language based on file extension
	function getLanguageExtension(filename: string) {
		if (filename.endsWith('.svelte') || filename.endsWith('.html')) {
			return html();
		} else if (filename.endsWith('.ts') || filename.endsWith('.js')) {
			return javascript({ typescript: filename.endsWith('.ts') });
		} else if (filename.endsWith('.css')) {
			return css();
		}
		return javascript();
	}

	// Get theme based on current mode
	function getCurrentTheme() {
		// TODO: read from
		console.log({ $currentTheme });
		return $currentTheme.dark ? githubDark : githubLight;
		// return githubDark;
	}

	onMount(() => {
		const startState = EditorState.create({
			doc: value,
			extensions: [
				basicSetup,
				languageCompartment.of(getLanguageExtension(filename)),
				themeCompartment.of(getCurrentTheme()),
				EditorView.updateListener.of((update) => {
					if (update.docChanged && !updating) {
						const newValue = update.state.doc.toString();
						value = newValue;
						oninput(newValue);
					}
				}),
				EditorView.theme({
					'&': {
						height: '100%',
						background: 'var(--color-surface-100)'
					},
					'.cm-scroller': {
						overflow: 'auto'
					},
					'.cm-gutters': {
						backgroundColor: 'var(--color-surface-300)',
						color: 'var(--color-surface-content)',
						border: 'none'
					}
				})
			]
		});

		editorView = new EditorView({
			state: startState,
			parent: editorContainer
		});
	});

	// Update editor when value changes externally
	$effect(() => {
		if (editorView && value !== editorView.state.doc.toString()) {
			updating = true;
			editorView.dispatch({
				changes: {
					from: 0,
					to: editorView.state.doc.length,
					insert: value
				}
			});
			updating = false;
		}
	});

	// Reconfigure language when filename changes
	$effect(() => {
		if (editorView && filename) {
			editorView.dispatch({
				effects: languageCompartment.reconfigure(getLanguageExtension(filename))
			});
		}
	});

	// Reconfigure theme when mode changes
	$effect(() => {
		if (editorView) {
			// Access $currentTheme to create reactive dependency
			const theme = $currentTheme;
			editorView.dispatch({
				effects: themeCompartment.reconfigure(getCurrentTheme())
			});
		}
	});

	onDestroy(() => {
		if (editorView) {
			editorView.destroy();
		}
	});
</script>

<div bind:this={editorContainer} class="h-full"></div>
