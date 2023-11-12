import { SvelteComponentTyped } from "svelte";
declare const __propDef: {
    props: {
        size?: [number, number] | undefined;
        /**
             * see: https://github.com/d3/d3-hierarchy#pack_padding
             */ padding?: number | undefined;
    };
    events: {
        [evt: string]: CustomEvent<any>;
    };
    slots: {
        default: {
            nodes: import("d3-hierarchy").HierarchyCircularNode<unknown>[];
        };
    };
};
export type PackProps = typeof __propDef.props;
export type PackEvents = typeof __propDef.events;
export type PackSlots = typeof __propDef.slots;
export default class Pack extends SvelteComponentTyped<PackProps, PackEvents, PackSlots> {
}
export {};
