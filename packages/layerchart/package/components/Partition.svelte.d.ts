import { SvelteComponentTyped } from "svelte";
declare const __propDef: {
    props: {
        orientation?: "vertical" | "horizontal" | undefined;
        size?: [number, number] | undefined;
        /**
             * see: https://github.com/d3/d3-hierarchy#tree_nodeSize
             */ padding?: number | undefined;
        /**
             * see: https://github.com/d3/d3-hierarchy#tree_nodeSize
             */ round?: boolean | undefined;
    };
    events: {
        [evt: string]: CustomEvent<any>;
    };
    slots: {
        default: {
            nodes: import("d3-hierarchy").HierarchyRectangularNode<unknown>[];
        };
    };
};
export type PartitionProps = typeof __propDef.props;
export type PartitionEvents = typeof __propDef.events;
export type PartitionSlots = typeof __propDef.slots;
export default class Partition extends SvelteComponentTyped<PartitionProps, PartitionEvents, PartitionSlots> {
}
export {};
