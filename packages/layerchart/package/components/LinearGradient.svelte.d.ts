import { SvelteComponentTyped } from "svelte";
declare const __propDef: {
    props: {
        [x: string]: any;
        id: string;
        from: string | boolean;
        via: string;
        to: string | boolean;
        vertical?: boolean | undefined;
        x1?: string | undefined;
        y1?: string | undefined;
        x2?: string | undefined;
        y2?: string | undefined;
        rotate?: number | undefined;
    };
    events: {
        [evt: string]: CustomEvent<any>;
    };
    slots: {
        default: {};
    };
};
export type LinearGradientProps = typeof __propDef.props;
export type LinearGradientEvents = typeof __propDef.events;
export type LinearGradientSlots = typeof __propDef.slots;
export default class LinearGradient extends SvelteComponentTyped<LinearGradientProps, LinearGradientEvents, LinearGradientSlots> {
}
export {};
