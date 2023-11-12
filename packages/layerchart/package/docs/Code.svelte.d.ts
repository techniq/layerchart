/** @typedef {typeof __propDef.props}  CodeProps */
/** @typedef {typeof __propDef.events}  CodeEvents */
/** @typedef {typeof __propDef.slots}  CodeSlots */
export default class Code extends SvelteComponentTyped<{
    [x: string]: never;
}, {
    [evt: string]: CustomEvent<any>;
}, {
    default: {};
}> {
}
export type CodeProps = typeof __propDef.props;
export type CodeEvents = typeof __propDef.events;
export type CodeSlots = typeof __propDef.slots;
import { SvelteComponentTyped } from "svelte";
declare const __propDef: {
    props: {
        [x: string]: never;
    };
    events: {
        [evt: string]: CustomEvent<any>;
    };
    slots: {
        default: {};
    };
};
export {};
