import type { Component } from 'svelte';

// Loaded example with component and source
export type LoadedExample = { component: Component; source: string };

// Examples by component name and example name
export type Examples = Record<string, Record<string, LoadedExample>>;
