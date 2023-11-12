import { SvelteComponentTyped } from "svelte";
import * as d3 from 'd3-hierarchy';
declare const __propDef: {
    props: {
        tile?: d3.RatioSquarifyTilingFactory | "binary" | "squarify" | "resquarify" | "dice" | "slice" | "sliceDice" | undefined;
        padding?: number | undefined;
        paddingInner?: number | undefined;
        paddingOuter?: number | undefined;
        paddingTop?: number | undefined;
        paddingBottom?: number | undefined;
        paddingLeft?: undefined;
        paddingRight?: undefined;
        selected?: any;
    };
    events: {
        [evt: string]: CustomEvent<any>;
    };
    slots: {
        default: {
            nodes: any;
        };
    };
};
export type TreemapProps = typeof __propDef.props;
export type TreemapEvents = typeof __propDef.events;
export type TreemapSlots = typeof __propDef.slots;
export default class Treemap extends SvelteComponentTyped<TreemapProps, TreemapEvents, TreemapSlots> {
}
export {};
