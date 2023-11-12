import { SvelteComponentTyped } from "svelte";
declare const __propDef: {
    props: {
        [x: string]: never;
    };
    events: {
        click: MouseEvent;
    } & {
        [evt: string]: CustomEvent<any>;
    };
    slots: {
        default: {};
    };
};
export type ChartClipPathProps = typeof __propDef.props;
export type ChartClipPathEvents = typeof __propDef.events;
export type ChartClipPathSlots = typeof __propDef.slots;
export default class ChartClipPath extends SvelteComponentTyped<ChartClipPathProps, ChartClipPathEvents, ChartClipPathSlots> {
}
export {};
