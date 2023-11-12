import { SvelteComponentTyped } from "svelte";
import { type FormatNumberStyle } from 'svelte-ux/utils/number';
import { type FormatType } from 'svelte-ux/utils/format';
declare const __propDef: {
    props: {
        [x: string]: any;
        orientation?: "outside" | "inside" | "auto" | undefined;
        significantDigits?: number | undefined;
        format?: FormatType;
        formatStyle?: FormatNumberStyle;
        overlap?: boolean | undefined;
        groupBy?: string | undefined;
    };
    events: {
        [evt: string]: CustomEvent<any>;
    };
    slots: {};
};
export type LabelsProps = typeof __propDef.props;
export type LabelsEvents = typeof __propDef.events;
export type LabelsSlots = typeof __propDef.slots;
export default class Labels extends SvelteComponentTyped<LabelsProps, LabelsEvents, LabelsSlots> {
}
export {};
