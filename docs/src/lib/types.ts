import type { Component } from 'svelte';

export type Examples = Record<string, { component: Component; source: string; data?: any }>;
