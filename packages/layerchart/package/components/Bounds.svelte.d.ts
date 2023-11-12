import { SvelteComponentTyped } from "svelte";
import { motionScale } from '../utils/scales';
declare const __propDef: {
    props: {
        domain: {
            x0: number;
            y0: number;
            x1: number;
            y1: number;
        } | ((dimensions: {
            width: number;
            height: number;
        }) => {
            x0: number;
            y0: number;
            x1: number;
            y1: number;
        });
        range: {
            x0: number;
            y0: number;
            x1: number;
            y1: number;
        } | ((dimensions: {
            width: number;
            height: number;
        }) => {
            x0: number;
            y0: number;
            x1: number;
            y1: number;
        });
        spring?: boolean | Parameters<typeof motionScale>[1]['spring'];
        tweened?: boolean | Parameters<typeof motionScale>[1]['tweened'];
    };
    events: {
        [evt: string]: CustomEvent<any>;
    };
    slots: {
        default: {
            xScale: any;
            yScale: any;
        };
    };
};
export type BoundsProps = typeof __propDef.props;
export type BoundsEvents = typeof __propDef.events;
export type BoundsSlots = typeof __propDef.slots;
export default class Bounds extends SvelteComponentTyped<BoundsProps, BoundsEvents, BoundsSlots> {
}
export {};
