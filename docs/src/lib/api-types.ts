/**
 * Shared types for component API documentation
 */

export interface PropertyInfo {
	name: string;
	type: string;
	required: boolean;
	description?: string;
	default?: string;
	tags?: Record<string, string>;
	properties?: PropertyInfo[]; // For nested object types
}

export interface ComponentAPI {
	generatedAt: string;
	component: string;
	propsType: string;
	properties: PropertyInfo[];
}
