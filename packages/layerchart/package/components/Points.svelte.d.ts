import { SvelteComponentTyped } from "svelte";
declare const __propDef: {
    props: {
        [x: string]: any;
        r?: number | undefined;
        offsetX?: (number | ((value: number, context: any) => number)) | undefined;
        offsetY?: (number | ((value: number, context: any) => number)) | undefined;
        color?: string | ((obj: {
            value: any;
            item: any;
            index: number;
        }) => string) | undefined;
    };
    events: {
        [evt: string]: CustomEvent<any>;
    };
    slots: {
        default: {
            points: any;
        };
    };
};
export type PointsProps = typeof __propDef.props;
export type PointsEvents = typeof __propDef.events;
export type PointsSlots = typeof __propDef.slots;
export default class Points extends SvelteComponentTyped<PointsProps, PointsEvents, PointsSlots> {
}
export {};
