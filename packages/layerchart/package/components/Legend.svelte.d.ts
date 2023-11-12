import { SvelteComponentTyped } from "svelte";
declare const __propDef: {
    props: {
        [x: string]: any;
        formatLabel?: ((label: string) => string) | undefined;
        items?: any;
    };
    events: {
        [evt: string]: CustomEvent<any>;
    };
    slots: {
        default: {
            items: any;
            scale: any;
        };
    };
};
export type LegendProps = typeof __propDef.props;
export type LegendEvents = typeof __propDef.events;
export type LegendSlots = typeof __propDef.slots;
export default class Legend extends SvelteComponentTyped<LegendProps, LegendEvents, LegendSlots> {
}
export {};
