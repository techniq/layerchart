import type { ComponentNode } from '$lib/states/chart.svelte.js';

/**
 * Recursively render the component tree onto a canvas context.
 * Group nodes: save → render → recurse children → restore
 * Leaf nodes: save → render → restore
 * Non-rendering nodes: just recurse children
 */
export function renderTree(ctx: CanvasRenderingContext2D, node: ComponentNode): void {
  if (node.kind === 'group' && node.canvasRender) {
    // Group: save state, apply transform, render children, restore
    ctx.save();
    node.canvasRender.render(ctx);
    for (const child of paintOrder(node)) {
      renderTree(ctx, child);
    }
    ctx.restore();
  } else if (node.canvasRender) {
    // Leaf mark: save, render, restore
    ctx.save();
    node.canvasRender.render(ctx);
    ctx.restore();
  } else {
    // Non-rendering node (e.g. root, composite-mark): just recurse children
    for (const child of paintOrder(node)) {
      renderTree(ctx, child);
    }
  }
}

/**
 * A node's children in the order to paint them: mount order, or for a node registered with
 * `paintByDepth`, each run of children reporting a `depth` back to front.  Canvas can't follow a
 * keyed `{#each}` that reorders, as the DOM does.
 */
export function paintOrder(node: ComponentNode): ComponentNode[] {
  const nodes = node.children;
  if (!node.paintByDepth) return nodes;
  let result = nodes;
  let start = -1;
  const depths = nodes.map((child) => child.canvasRender?.depth?.());
  for (let i = 0; i <= nodes.length; i++) {
    if (i < nodes.length && depths[i] != null) {
      if (start === -1) start = i;
      continue;
    }
    if (start !== -1 && i - start > 1) {
      if (result === nodes) result = [...nodes];
      const run = nodes
        .slice(start, i)
        .map((child, k) => ({ child, depth: depths[start + k]! }))
        .sort((a, b) => a.depth - b.depth);
      run.forEach(({ child }, k) => (result[start + k] = child));
    }
    start = -1;
  }
  return result;
}
