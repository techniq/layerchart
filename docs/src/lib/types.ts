import type { Component } from 'svelte';

// Examples by component name and example name
export type Examples = Record<string, Record<string, { component: Component; source: string }>>;
