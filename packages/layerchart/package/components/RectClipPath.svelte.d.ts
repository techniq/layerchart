import { SvelteComponentTyped } from "svelte";
import type { spring as springStore, tweened as tweenedStore } from 'svelte/motion';
declare const __propDef: {
    props: {
        /** Unique id for clipPath */ id?: string | undefined;
        x?: number | undefined;
        y?: number | undefined;
        width: number;
        height: number;
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
export type RectClipPathProps = typeof __propDef.props;
export type RectClipPathEvents = typeof __propDef.events;
export type RectClipPathSlots = typeof __propDef.slots;
export default class RectClipPath extends SvelteComponentTyped<RectClipPathProps, RectClipPathEvents, RectClipPathSlots> {
}
export {};
