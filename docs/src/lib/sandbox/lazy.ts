/**
 * Single dynamic-import boundary for the sandbox.
 *
 * Everything reachable from here — `svelte/compiler`, CodeMirror, and the module
 * registry — must only ever be loaded via `import('./lazy')`, so that docs pages
 * that are never edited don't pay for any of it. Don't import this module statically.
 */
export { compileSource, type Diagnostic, type CompileResult } from './compile';
export { availableModules } from './link';
export { default as CodeEditor } from './CodeEditor.svelte';
