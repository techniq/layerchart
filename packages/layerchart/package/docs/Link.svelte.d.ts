/** @typedef {typeof __propDef.props}  LinkProps */
/** @typedef {typeof __propDef.events}  LinkEvents */
/** @typedef {typeof __propDef.slots}  LinkSlots */
export default class Link extends SvelteComponentTyped<{
    [x: string]: never;
}, {
    [evt: string]: CustomEvent<any>;
}, {
    default: {};
}> {
}
export type LinkProps = typeof __propDef.props;
export type LinkEvents = typeof __propDef.events;
export type LinkSlots = typeof __propDef.slots;
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
