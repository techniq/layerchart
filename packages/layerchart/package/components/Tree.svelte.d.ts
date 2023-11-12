import { SvelteComponentTyped } from "svelte";
import { type HierarchyPointNode } from 'd3-hierarchy';
declare const __propDef: {
    props: {
        /**
             * Sets this tree layout’s node size to the specified two-element array of numbers `[width, height]`.
             * If unset, layout size is used instead.  When a node size is specified, the root node is always
             * positioned at `⟨0, 0⟩`.
             *
             * see: https://github.com/d3/d3-hierarchy#tree_nodeSize
             */ nodeSize?: [number, number] | undefined;
        /**
             * see: https://github.com/d3/d3-hierarchy#tree_separation
             */ separation?: ((a: HierarchyPointNode<any>, b: HierarchyPointNode<any>) => number) | undefined;
        orientation?: "vertical" | "horizontal" | undefined;
    };
    events: {
        [evt: string]: CustomEvent<any>;
    };
    slots: {
        default: {
            nodes: any;
            links: any;
        };
    };
};
export type TreeProps = typeof __propDef.props;
export type TreeEvents = typeof __propDef.events;
export type TreeSlots = typeof __propDef.slots;
export default class Tree extends SvelteComponentTyped<TreeProps, TreeEvents, TreeSlots> {
}
export {};
