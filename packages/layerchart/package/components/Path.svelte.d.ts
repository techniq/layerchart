import { SvelteComponentTyped } from "svelte";
import type { tweened as tweenedStore } from 'svelte/motion';
import type { CurveFactory, CurveFactoryLineOnly } from 'd3-shape';
declare const __propDef: {
    props: {
        [x: string]: any;
        data?: any;
        x?: any;
        y?: any;
        pathData?: string | undefined;
        tweened?: boolean | Parameters<typeof tweenedStore>[1];
        curve?: CurveFactory | CurveFactoryLineOnly | undefined;
        defined?: ((d: any, index: number, data: any[]) => boolean) | undefined;
        color?: string | undefined;
        width?: undefined;
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
export type PathProps = typeof __propDef.props;
export type PathEvents = typeof __propDef.events;
export type PathSlots = typeof __propDef.slots;
export default class Path extends SvelteComponentTyped<PathProps, PathEvents, PathSlots> {
}
export {};
