/** @typedef {typeof __propDef.props}  LayoutProps */
/** @typedef {typeof __propDef.events}  LayoutEvents */
/** @typedef {typeof __propDef.slots}  LayoutSlots */
export default class Layout extends SvelteComponentTyped<{
    name?: any;
    sourceUrl?: any;
    docUrl?: any;
    description?: any;
}, {
    [evt: string]: CustomEvent<any>;
}, {
    toc: {};
    default: {};
}> {
}
export type LayoutProps = typeof __propDef.props;
export type LayoutEvents = typeof __propDef.events;
export type LayoutSlots = typeof __propDef.slots;
import a from "./Link.svelte";
import blockquote from "./Blockquote.svelte";
import h1 from "./Header1.svelte";
import { SvelteComponentTyped } from "svelte";
declare const __propDef: {
    props: {
        name?: any;
        sourceUrl?: any;
        docUrl?: any;
        description?: any;
    };
    events: {
        [evt: string]: CustomEvent<any>;
    };
    slots: {
        toc: {};
        default: {};
    };
};
export { a, blockquote, h1 };
