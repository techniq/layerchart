import { SvelteComponentTyped } from "svelte";
declare const __propDef: {
    props: {
        [x: string]: any;
        value?: string | number | undefined;
        width?: number | undefined;
        x?: string | number | undefined;
        y?: string | number | undefined;
        dx?: string | number | undefined;
        dy?: string | number | undefined;
        lineHeight?: string | undefined;
        capHeight?: string | undefined;
        scaleToFit?: boolean | undefined;
        textAnchor?: "start" | "middle" | "end" | "inherit" | undefined;
        verticalAnchor?: "start" | "middle" | "end" | "inherit" | undefined;
        rotate?: number | undefined;
    };
    events: {
        [evt: string]: CustomEvent<any>;
    };
    slots: {};
};
export type TextProps = typeof __propDef.props;
export type TextEvents = typeof __propDef.events;
export type TextSlots = typeof __propDef.slots;
export default class Text extends SvelteComponentTyped<TextProps, TextEvents, TextSlots> {
}
export {};
