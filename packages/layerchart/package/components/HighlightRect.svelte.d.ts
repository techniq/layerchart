import { SvelteComponentTyped } from "svelte";
declare const __propDef: {
    props: {
        axis?: "x" | "y" | "both" | undefined;
    };
    events: {
        click: MouseEvent;
    } & {
        [evt: string]: CustomEvent<any>;
    };
    slots: {};
};
export type HighlightRectProps = typeof __propDef.props;
export type HighlightRectEvents = typeof __propDef.events;
export type HighlightRectSlots = typeof __propDef.slots;
export default class HighlightRect extends SvelteComponentTyped<HighlightRectProps, HighlightRectEvents, HighlightRectSlots> {
}
export {};
