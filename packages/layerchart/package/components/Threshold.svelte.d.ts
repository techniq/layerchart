import { SvelteComponentTyped } from "svelte";
import type { CurveFactory } from 'd3-shape';
declare const __propDef: {
    props: {
        data?: any;
        x?: any;
        y0?: any;
        y1?: any;
        curve?: CurveFactory | undefined;
        defined?: ((d: [number, number], index: number, data: [number, number][]) => boolean) | undefined;
        id?: string | undefined;
    };
    events: {
        [evt: string]: CustomEvent<any>;
    };
    slots: {
        pathAbove: {
            areaPathData: string | null;
            clipPath: string;
            linePathData: string | null;
        };
        pathBelow: {
            areaPathData: string | null;
            clipPath: string;
            linePathData: string | null;
        };
        default: {};
    };
};
export type ThresholdProps = typeof __propDef.props;
export type ThresholdEvents = typeof __propDef.events;
export type ThresholdSlots = typeof __propDef.slots;
export default class Threshold extends SvelteComponentTyped<ThresholdProps, ThresholdEvents, ThresholdSlots> {
}
export {};
