import { SvelteComponentTyped } from "svelte";
import type { spring as springStore, tweened as tweenedStore } from 'svelte/motion';
declare const __propDef: {
    props: {
        [x: string]: any;
        cx?: number | undefined;
        cy?: number | undefined;
        r: number;
        spring?: boolean | Parameters<typeof springStore>[1];
        tweened?: boolean | Parameters<typeof tweenedStore>[1];
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
export type CircleProps = typeof __propDef.props;
export type CircleEvents = typeof __propDef.events;
export type CircleSlots = typeof __propDef.slots;
export default class Circle extends SvelteComponentTyped<CircleProps, CircleEvents, CircleSlots> {
}
export {};
