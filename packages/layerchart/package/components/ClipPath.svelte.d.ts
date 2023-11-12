import { SvelteComponentTyped } from "svelte";
declare const __propDef: {
    props: {
        [x: string]: any;
        id?: string | undefined;
    };
    events: {
        [evt: string]: CustomEvent<any>;
    };
    slots: {
        default: {
            id: string;
        };
    };
};
export type ClipPathProps = typeof __propDef.props;
export type ClipPathEvents = typeof __propDef.events;
export type ClipPathSlots = typeof __propDef.slots;
export default class ClipPath extends SvelteComponentTyped<ClipPathProps, ClipPathEvents, ClipPathSlots> {
}
export {};
