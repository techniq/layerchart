import { Context } from 'runed';
import type { ComponentRender } from './canvas.js';
import { getCanvasContext } from './canvas.js';

export type NodeKind = 'group' | 'mark' | 'composite-mark';

export interface ComponentNode {
  id: symbol;
  kind: NodeKind;
  name: string;
  parent: ComponentNode | null;
  children: ComponentNode[];
  /** Canvas render info — only present for components that render on canvas */
  canvasRender?: ComponentRender;
  /** Whether this node has a composite-mark ancestor (computed on creation) */
  insideCompositeMark: boolean;
}

export interface RegisterComponentNodeOptions<T extends Element = Element> {
  /** Display name for the node (used for debugging) */
  name: string;
  /** The type of node */
  kind: NodeKind;
  /** Canvas render info. When provided, sets up dependency tracking and cleanup automatically. */
  canvasRender?: ComponentRender<T>;
}

const _ParentNode = new Context<ComponentNode | null>('ComponentTreeParent');

/**
 * Get the nearest parent node from context, or null if at root.
 */
export function getParentNode(): ComponentNode | null {
  return _ParentNode.getOr(null);
}

/**
 * Register a component tree node, attach to parent, and set as context for children.
 * Call this at the top level of a component's `<script>` block.
 *
 * When `canvasRender` is provided, automatically sets up:
 * - Dependency tracking for canvas invalidation
 * - Cleanup (node removal + invalidation) on destroy
 *
 * @example
 * // Non-canvas node (composite mark):
 * registerComponentNode({ name: 'Area', kind: 'composite-mark' })
 *
 * // Canvas leaf mark:
 * registerComponentNode({ name: 'Circle', kind: 'mark', canvasRender: { render, deps, events } })
 *
 * // Canvas group:
 * registerComponentNode({ name: 'Group', kind: 'group', canvasRender: { render, deps, events } })
 */
export function registerComponentNode<T extends Element = Element>(options: RegisterComponentNodeOptions<T>): ComponentNode {
  const { name, kind, canvasRender } = options;
  const parent = getParentNode();

  // Walk ancestors to check for composite-mark
  let insideCompositeMark = false;
  let ancestor = parent;
  while (ancestor) {
    if (ancestor.kind === 'composite-mark') {
      insideCompositeMark = true;
      break;
    }
    ancestor = ancestor.parent;
  }

  const node: ComponentNode = {
    id: Symbol(name),
    kind,
    name,
    parent,
    children: [],
    canvasRender: canvasRender as ComponentRender | undefined,
    insideCompositeMark,
  };

  // Register with parent
  if (parent) {
    parent.children.push(node);
  }

  // Set self as context for children
  _ParentNode.set(node);

  // When canvas render info is provided, set up deps tracking and cleanup
  if (canvasRender) {
    const canvasCtx = getCanvasContext();

    if (canvasRender.deps) {
      $effect.pre(() => {
        canvasRender.deps?.();
        canvasCtx.invalidate();
      });
    }

    $effect.pre(() => {
      return () => {
        removeComponentNode(node);
        canvasCtx.invalidate();
      };
    });

    canvasCtx.invalidate();
  }

  return node;
}

/**
 * Remove a node from its parent's children array.
 * Call this during cleanup (e.g., $effect cleanup or onDestroy).
 */
export function removeComponentNode(node: ComponentNode) {
  if (node.parent) {
    const idx = node.parent.children.indexOf(node);
    if (idx >= 0) node.parent.children.splice(idx, 1);
  }
}

