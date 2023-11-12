import { SvelteComponentTyped } from "svelte";
import type { spring as springStore, tweened as tweenedStore } from 'svelte/motion';
declare const __propDef: {
    props: {
        /** Unique id for clipPath */ id?: string | undefined;
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
    slots: {
        default: {
            id: string;
        };
    };
};
export type CircleClipPathProps = typeof __propDef.props;
export type CircleClipPathEvents = typeof __propDef.events;
export type CircleClipPathSlots = typeof __propDef.slots;
export default class CircleClipPath extends SvelteComponentTyped<CircleClipPathProps, CircleClipPathEvents, CircleClipPathSlots> {
}
export {};
