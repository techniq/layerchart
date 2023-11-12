import { SvelteComponentTyped } from "svelte";
declare const __propDef: {
    props: {
        [x: string]: any;
        id: string;
        width: number;
        height: number;
    };
    events: {
        [evt: string]: CustomEvent<any>;
    };
    slots: {
        default: {};
    };
};
export type PatternProps = typeof __propDef.props;
export type PatternEvents = typeof __propDef.events;
export type PatternSlots = typeof __propDef.slots;
export default class Pattern extends SvelteComponentTyped<PatternProps, PatternEvents, PatternSlots> {
}
export {};
