import { SvelteComponentTyped } from "svelte";
import type { FormatType } from 'svelte-ux/utils/format';
declare const __propDef: {
    props: {
        [x: string]: any;
        label: any;
        value?: any;
        format?: FormatType;
        valueAlign?: "left" | "right" | "center" | undefined;
    };
    events: {
        [evt: string]: CustomEvent<any>;
    };
    slots: {
        label: {};
        default: {};
    };
};
export type TooltipItemProps = typeof __propDef.props;
export type TooltipItemEvents = typeof __propDef.events;
export type TooltipItemSlots = typeof __propDef.slots;
export default class TooltipItem extends SvelteComponentTyped<TooltipItemProps, TooltipItemEvents, TooltipItemSlots> {
}
export {};
