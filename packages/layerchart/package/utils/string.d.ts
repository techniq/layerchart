/// <reference types="lodash" />
declare function _getStringWidth(str: string, style?: CSSStyleDeclaration): number | null;
export declare const getStringWidth: typeof _getStringWidth & import("lodash").MemoizedFunction;
export {};
