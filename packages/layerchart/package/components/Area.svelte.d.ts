import { SvelteComponentTyped } from "svelte";
import type { tweened as tweenedStore } from 'svelte/motion';
import type { CurveFactory } from 'd3-shape';
declare const __propDef: {
    props: {
        [x: string]: any;
        data?: any;
        x?: any;
        y0?: any;
        y1?: any;
        pathData?: string | undefined;
        clipPath?: string | undefined;
        tweened?: boolean | Parameters<typeof tweenedStore>[1];
        curve?: CurveFactory | undefined;
        defined?: ((d: any, index: number, data: any[]) => boolean) | undefined;
        color?: string | undefined;
        opacity?: number | undefined;
        line?: boolean | any;
    };
    events: {
        click: MouseEvent;
        mousemove: MouseEvent;
        mouseleave: MouseEvent;
    } & {
        [evt: string]: CustomEvent<any>;
    };
    slots: {};
};
export type AreaProps = typeof __propDef.props;
export type AreaEvents = typeof __propDef.events;
export type AreaSlots = typeof __propDef.slots;
export default class Area extends SvelteComponentTyped<AreaProps, AreaEvents, AreaSlots> {
}
export {};
