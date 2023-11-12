import { SvelteComponentTyped } from "svelte";
import type { spring as springStore, tweened as tweenedStore } from 'svelte/motion';
declare const __propDef: {
    props: {
        [x: string]: any;
        spring?: boolean | Parameters<typeof springStore>[1];
        tweened?: boolean | Parameters<typeof tweenedStore>[1];
        value?: number | undefined;
        domain?: number[] | undefined;
        range?: number[] | undefined;
        startAngle?: number | undefined;
        endAngle?: number | undefined;
        innerRadius?: undefined;
        outerRadius?: undefined;
        cornerRadius?: number | undefined;
        padAngle?: number | undefined;
        track?: boolean | svelte.JSX.SVGProps<SVGPathElement>;
        offset?: number | undefined;
    };
    events: {
        click: MouseEvent;
        mousemove: MouseEvent;
        mouseleave: MouseEvent;
    } & {
        [evt: string]: CustomEvent<any>;
    };
    slots: {
        default: {
            value: any;
            centroid: [number, number];
            boundingBox: any;
        };
    };
};
export type ArcProps = typeof __propDef.props;
export type ArcEvents = typeof __propDef.events;
export type ArcSlots = typeof __propDef.slots;
export default class Arc extends SvelteComponentTyped<ArcProps, ArcEvents, ArcSlots> {
}
export {};
