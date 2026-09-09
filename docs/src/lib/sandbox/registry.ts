/**
 * Modules the sandbox exposes to user code.
 *
 * These are the *same* instances the docs app itself is built with, so an edited
 * example runs against the workspace build of `layerchart` (not a published copy
 * fetched from a CDN) and shares a single Svelte runtime with the host page.
 */
import * as svelte from 'svelte';
// Compiled components import this; it's deliberately untyped by Svelte, and we only
// ever hand the namespace object back out again.
// @ts-expect-error - no declarations for 'svelte/internal/client'
import * as svelteInternalClient from 'svelte/internal/client';
import * as svelteEasing from 'svelte/easing';
import * as svelteTransition from 'svelte/transition';
import * as layerchart from 'layerchart';
import * as d3Array from 'd3-array';
import * as d3Scale from 'd3-scale';
import * as d3ScaleChromatic from 'd3-scale-chromatic';
import * as d3Time from 'd3-time';
import * as d3Shape from 'd3-shape';
import * as svelteUx from 'svelte-ux';
import * as layerstackUtils from '@layerstack/utils';
import * as layerstackTailwind from '@layerstack/tailwind';
import * as data from '$lib/utils/data';

const empty = {};

export const registry: Record<string, Record<string, unknown>> = {
	svelte,
	'svelte/internal/client': svelteInternalClient,
	// Side-effect-only imports in compiled output — nothing to re-export.
	'svelte/internal/disclose-version': empty,
	'svelte/internal/flags/legacy': empty,
	'svelte/easing': svelteEasing,
	'svelte/transition': svelteTransition,
	layerchart,
	'd3-array': d3Array,
	'd3-scale': d3Scale,
	'd3-scale-chromatic': d3ScaleChromatic,
	'd3-time': d3Time,
	'd3-shape': d3Shape,
	'svelte-ux': svelteUx,
	'@layerstack/utils': layerstackUtils,
	'@layerstack/tailwind': layerstackTailwind,
	'$lib/utils/data': data,
	'$lib/utils/data.js': data
};
