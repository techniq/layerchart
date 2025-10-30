import { prerender, getRequestEvent, query } from '$app/server';
import { range } from 'd3-array';
import { randomInteger } from '@layerstack/utils';
import { unique } from '@layerstack/utils/array';
import { z } from 'zod';

const alpha = [...Array(26)].map((val, i) => String.fromCharCode(i + 65));

export const getGraph = query(z.string(), async (name) => {
	switch (name) {
		case 'basic': {
			return getBasicGraph();
		}
		case 'simple': {
			return getSimpleGraph();
		}
		case 'medium': {
			return getMediumDag();
		}
		case 'large': {
			return getLargeDag();
		}
		case 'complex': {
			return getComplexGraph();
		}
		case 'miserables': {
			return getMiserablesGraph();
		}
		case 'tcp-state': {
			return getTcpStateGraph();
		}
		case 'software-user-flow': {
			return getSoftwareUserFlowGraph();
		}
		case 'cluster': {
			return getClusterGraph();
		}
		case 'dag-medium': {
			return getMediumDag();
		}
		case 'dag-large': {
			return getLargeDag();
		}
		case 'disjoint-graph': {
			return getDisjointGraph();
		}
		case 'simple-generated': {
			return getSimpleGeneratedGraph();
		}
		case 'complex-generated': {
			return getComplexGeneratedGraph();
		}
		default: {
			throw new Error(`Unknown graph: ${name}`);
		}
	}
});

export const getBasicGraph = prerender(async () => {
	const { fetch } = getRequestEvent();
	const data = (await fetch('/data/examples/graph/basic.json').then((r) => r.json())) as {
		nodes: { id: string }[];
		links: { source: string; target: string }[];
	};
	return data;
});

export const getSimpleGraph = prerender(async () => {
	const { fetch } = getRequestEvent();
	const data = (await fetch('/data/examples/graph/simple.json').then((r) => r.json())) as {
		nodes: { id: string }[];
		links: { source: string; target: string }[];
	};
	return data;
});

export const getComplexGraph = prerender(async () => {
	const { fetch } = getRequestEvent();
	const data = (await fetch('/data/examples/graph/complex.json').then((r) => r.json())) as {
		nodes: { id: string }[];
		links: { source: string; target: string }[];
	};
	return data;
});

export const getMiserablesGraph = prerender(async () => {
	const { fetch } = getRequestEvent();
	const data = (await fetch('/data/examples/graph/miserables.json').then((r) => r.json())) as {
		nodes: { id: string; group: number }[];
		links: { source: string; target: string; value: number }[];
	};
	return data;
});

export const getTcpStateGraph = prerender(async () => {
	const { fetch } = getRequestEvent();
	const data = (await fetch('/data/examples/graph/tcp-state.json').then((r) => r.json())) as {
		nodes: { id: string }[];
		links: { source: string; target: string; label: string }[];
	};
	return data;
});

export const getSoftwareUserFlowGraph = prerender(async () => {
	const { fetch } = getRequestEvent();
	const data = (await fetch('/data/examples/graph/software-user-flow.json').then((r) =>
		r.json()
	)) as {
		nodes: { id: string }[];
		links: { source: string; target: string; label: string }[];
	};
	return data;
});

export const getClusterGraph = prerender(async () => {
	const { fetch } = getRequestEvent();
	const data = (await fetch('/data/examples/graph/cluster.json').then((r) => r.json())) as {
		nodes: { id: string; parent?: string }[];
		links: { source: string; target: string }[];
	};
	return data;
});

export const getMediumDag = prerender(async () => {
	const { fetch } = getRequestEvent();
	const data = (await fetch('/data/examples/graph/dag-medium.json').then((r) => r.json())) as {
		nodes: { id: string; name: string }[];
		links: { source: string; target: string }[];
	};
	return data;
});

export const getLargeDag = prerender(async () => {
	const { fetch } = getRequestEvent();
	const data = (await fetch('/data/examples/graph/dag-large.json').then((r) => r.json())) as {
		nodes: { id: string; name: string }[];
		links: { source: string; target: string }[];
	};
	return data;
});

export const getDisjointGraph = prerender(async () => {
	const { fetch } = getRequestEvent();
	const data = (await fetch('/data/examples/graph/disjoint-graph.json').then((r) => r.json())) as {
		nodes: { id: string; group: number }[];
		links: { source: string; target: string; value: number }[];
	};
	return data;
});

export const getSimpleGeneratedGraph = prerender(async () => {
	const data = {
		nodes: alpha.map((a) => ({
			id: a
		})),
		links: alpha.flatMap((a, i) => {
			if (i === 25) {
				return [];
			} else {
				const randomDownstreamId = randomInteger(i + 1, 25);
				const edge = { source: a, target: alpha[randomDownstreamId] };
				return [edge];
			}
		})
	};
	return data;
});

export const getComplexGeneratedGraph = prerender(async () => {
	function getRandomDownstreamIds(index: number) {
		return unique(range(randomInteger(1, 3)).map(() => randomInteger(index + 1, 25)));
	}

	const data = {
		nodes: alpha.map((a) => ({
			id: a
		})),
		links: alpha.flatMap((a, i) => {
			if (i === 25) {
				return [];
			} else {
				return getRandomDownstreamIds(i).map((id) => {
					return { source: a, target: alpha[id] };
				});
			}
		})
	};
	return data;
});
