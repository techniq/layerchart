import { SvelteComponentTyped } from "svelte";
import type { spring as springStore, tweened as tweenedStore } from 'svelte/motion';
declare const __propDef: {
    props: {
        [x: string]: any;
        x?: number | undefined;
        y?: number | undefined;
        center?: boolean | undefined;
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
        default: {};
    };
};
export type GroupProps = typeof __propDef.props;
export type GroupEvents = typeof __propDef.events;
export type GroupSlots = typeof __propDef.slots;
export default class Group extends SvelteComponentTyped<GroupProps, GroupEvents, GroupSlots> {
}
export {};
