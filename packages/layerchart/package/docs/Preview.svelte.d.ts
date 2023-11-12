import { SvelteComponentTyped } from "svelte";
import 'prism-svelte';
declare const __propDef: {
    props: {
        code?: null | undefined;
        language?: string | undefined;
        highlightedCode?: any;
        showCode?: boolean | undefined;
    };
    events: {
        [evt: string]: CustomEvent<any>;
    };
    slots: {
        default: {};
    };
};
export type PreviewProps = typeof __propDef.props;
export type PreviewEvents = typeof __propDef.events;
export type PreviewSlots = typeof __propDef.slots;
export default class Preview extends SvelteComponentTyped<PreviewProps, PreviewEvents, PreviewSlots> {
}
export {};
