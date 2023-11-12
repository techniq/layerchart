import { SvelteComponentTyped } from "svelte";
declare const __propDef: {
    props: {
        color?: string | ((obj: {
            value: any;
            item: any;
            index: number;
        }) => string) | undefined;
        axis?: "x" | "y" | "none" | "both" | undefined;
    };
    events: {
        [evt: string]: CustomEvent<any>;
    };
    slots: {};
};
export type HighlightLineProps = typeof __propDef.props;
export type HighlightLineEvents = typeof __propDef.events;
export type HighlightLineSlots = typeof __propDef.slots;
export default class HighlightLine extends SvelteComponentTyped<HighlightLineProps, HighlightLineEvents, HighlightLineSlots> {
}
export {};
