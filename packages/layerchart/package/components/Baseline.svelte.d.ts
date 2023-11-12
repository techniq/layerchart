import { SvelteComponentTyped } from "svelte";
declare const __propDef: {
    props: {
        [x: string]: any;
        x?: boolean | undefined;
        y?: boolean | undefined;
    };
    events: {
        [evt: string]: CustomEvent<any>;
    };
    slots: {};
};
export type BaselineProps = typeof __propDef.props;
export type BaselineEvents = typeof __propDef.events;
export type BaselineSlots = typeof __propDef.slots;
export default class Baseline extends SvelteComponentTyped<BaselineProps, BaselineEvents, BaselineSlots> {
}
export {};
