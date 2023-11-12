import { SvelteComponentTyped } from "svelte";
import type { spring as springStore, tweened as tweenedStore } from 'svelte/motion';
declare const __propDef: {
    props: {
        [x: string]: any;
        x?: any;
        y?: any;
        color?: string | ((obj: {
            value: any;
            item: any;
            index: number;
        }) => string) | undefined;
        opacity?: number | undefined;
        stroke?: string | undefined;
        strokeWidth?: number | undefined;
        radius?: number | undefined;
        getKey?: ((item: any, index: number) => any) | undefined;
        getProps?: ((obj: {
            value: any;
            item: any;
            index: number;
        }) => any) | undefined;
        widthOffset?: number | undefined;
        spring?: boolean | Parameters<typeof springStore>[1];
        tweened?: boolean | Parameters<typeof tweenedStore>[1];
        groupBy?: string | undefined;
        groupPaddingInner?: number | undefined;
        groupPaddingOuter?: number | undefined;
    };
    events: {
        [evt: string]: CustomEvent<any>;
    };
    slots: {};
};
export type BarsProps = typeof __propDef.props;
export type BarsEvents = typeof __propDef.events;
export type BarsSlots = typeof __propDef.slots;
export default class Bars extends SvelteComponentTyped<BarsProps, BarsEvents, BarsSlots> {
}
export {};
