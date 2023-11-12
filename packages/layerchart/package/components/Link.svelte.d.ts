import { SvelteComponentTyped } from "svelte";
import type { tweened as tweenedStore } from 'svelte/motion';
declare const __propDef: {
    props: {
        [x: string]: any;
        data?: any;
        orientation?: "vertical" | "horizontal" | undefined;
        sankey?: boolean | undefined;
        source?: ((d: any) => any) | undefined;
        target?: ((d: any) => any) | undefined;
        x?: ((d: any) => any) | undefined;
        y?: ((d: any) => any) | undefined;
        curve?: import("d3-shape").CurveFactory | undefined;
        tweened?: boolean | Parameters<typeof tweenedStore>[1];
        color?: string | undefined;
        width?: undefined;
    };
    events: {
        click: MouseEvent;
        mouseover: MouseEvent;
        mouseout: MouseEvent;
    } & {
        [evt: string]: CustomEvent<any>;
    };
    slots: {};
};
export type LinkProps = typeof __propDef.props;
export type LinkEvents = typeof __propDef.events;
export type LinkSlots = typeof __propDef.slots;
export default class Link extends SvelteComponentTyped<LinkProps, LinkEvents, LinkSlots> {
}
export {};
