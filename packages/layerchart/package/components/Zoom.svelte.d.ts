import { SvelteComponentTyped } from "svelte";
import { motionStore } from '../stores/motionStore';
declare const __propDef: {
    props: {
        spring?: boolean | Parameters<typeof motionStore>[1]['spring'];
        tweened?: boolean | Parameters<typeof motionStore>[1]['tweened'];
        disablePointer?: boolean | undefined;
        reset?: (() => void) | undefined;
        increase?: (() => void) | undefined;
        decrease?: (() => void) | undefined;
        translateCenter?: (() => void) | undefined;
        zoomTo?: ((newTranslate: {
            x: number;
            y: number;
        }, newScale?: {
            x: number;
            y: number;
        }) => void) | undefined;
    };
    events: {
        click: MouseEvent;
    } & {
        [evt: string]: CustomEvent<any>;
    };
    slots: {
        default: {
            scale: any;
        };
    };
};
export type ZoomProps = typeof __propDef.props;
export type ZoomEvents = typeof __propDef.events;
export type ZoomSlots = typeof __propDef.slots;
export default class Zoom extends SvelteComponentTyped<ZoomProps, ZoomEvents, ZoomSlots> {
    get reset(): () => void;
    get increase(): () => void;
    get decrease(): () => void;
    get translateCenter(): () => void;
    get zoomTo(): (newTranslate: {
        x: number;
        y: number;
    }, newScale?: {
        x: number;
        y: number;
    } | undefined) => void;
}
export {};
