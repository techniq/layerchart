import { SvelteComponentTyped } from "svelte";
import { type SankeyNode } from 'd3-sankey';
declare const __propDef: {
    props: {
        nodes?: ((d: any) => any) | undefined;
        nodeId?: ((d: any) => any) | undefined;
        /**
             * see: https://github.com/d3/d3-sankey#alignments
             */ nodeAlign?: "left" | "right" | "center" | "justify" | ((node: SankeyNode<any, any>, n: number) => number) | undefined;
        nodeWidth?: number | undefined;
        nodePadding?: number | undefined;
        nodeSort?: undefined;
        links?: ((d: any) => any) | undefined;
        linkSort?: undefined;
    };
    events: {
        update: CustomEvent<any>;
    } & {
        [evt: string]: CustomEvent<any>;
    };
    slots: {
        default: {
            nodes: import("d3-sankey").SankeyNodeMinimal<{}, {}>[];
            links: import("d3-sankey").SankeyLinkMinimal<{}, {}>[];
        };
    };
};
export type SankeyProps = typeof __propDef.props;
export type SankeyEvents = typeof __propDef.events;
export type SankeySlots = typeof __propDef.slots;
export default class Sankey extends SvelteComponentTyped<SankeyProps, SankeyEvents, SankeySlots> {
}
export {};
