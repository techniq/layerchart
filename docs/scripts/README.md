# Component API Extraction Script

This directory contains a script to automatically extract TypeScript type definitions and JSDoc comments from LayerChart Svelte components.

## Overview

The `extract-component-api.ts` script scans all Svelte components in `packages/layerchart/src/lib/components` and extracts their prop types (specifically `*PropsWithoutHTML` types) along with JSDoc documentation.

## Usage

Run the script from the docs directory:

```bash
pnpm extract:api
```

This will generate:

- Individual component API files in `docs/src/generated/api/` (e.g., `api/Rect.json`, `api/Circle.json`)
- An index file `src/generated/api/index.json` listing all available components
- A combined `api.json` file at `src/generated/api.json`

## Output Format

### Index File (`docs/src/generated/api/index.json`)

A quick reference listing all available components:

```json
{
	"generatedAt": "2025-11-02T00:33:10.394Z",
	"components": [
		{
			"component": "Rect",
			"propsType": "RectPropsWithoutHTML",
			"propertyCount": 16,
			"file": "Rect.json"
		}
	]
}
```

### Individual Component Files (`docs/src/generated/api/{Component}.json`)

Each component gets its own JSON file:

```json
{
	"generatedAt": "2025-11-02T00:33:10.394Z",
	"component": "Rect",
	"propsType": "RectPropsWithoutHTML",
	"properties": [
		{
			"name": "x",
			"type": "number",
			"required": false,
			"description": "The x-coordinate of the rectangle",
			"default": "0",
			"tags": {
				"bindable": ""
			}
		}
	]
}
```

### Combined File (`docs/src/generated/api.json`)

The generated `api.json` file has the following structure:

```json
{
	"generatedAt": "2025-11-02T00:33:10.394Z",
	"components": [
		{
			"component": "Rect",
			"propsType": "RectPropsWithoutHTML",
			"properties": [
				{
					"name": "x",
					"type": "number",
					"required": false,
					"description": "The x-coordinate of the rectangle",
					"default": "0",
					"tags": {
						"bindable": ""
					}
				}
			]
		}
	]
}
```

### Property Fields

- **name**: The property name
- **type**: TypeScript type as a string
- **required**: Whether the property is required (inverse of optional)
- **description**: JSDoc description (if available)
- **default**: Default value from `@default` tag (if specified)
- **tags**: Other JSDoc tags like `@bindable`, `@required`, etc.
- **properties**: Nested properties for object types

## How It Works

1. **File Discovery**: Scans for all `.svelte` files in the components directory
2. **Type Extraction**: For each component, looks for a `*PropsWithoutHTML` type definition
3. **Script Parsing**: Extracts the `<script lang="ts" module>` content
4. **Type Analysis**: Uses TypeScript compiler API to parse and analyze the type definitions
5. **JSDoc Extraction**: Captures JSDoc comments for each property
6. **Property Resolution**: Expands intersection types (e.g., `RectPropsWithoutHTML & CommonStyleProps`)

## Supported Components

The script extracts API information for components that export a `*PropsWithoutHTML` type. Components without this pattern (like context providers or utility components) are skipped.

Currently extracts API for 51+ components including:

- Rect, Circle, Line, Text, etc.
- Chart, Axis, Legend
- Arc, Area, Bar, Pie
- And many more...

## Limitations

- Only processes components in the main components directory (not subdirectories)
- Requires components to follow the `*PropsWithoutHTML` naming convention
- Complex imported types may be stubbed (e.g., `CommonStyleProps` is expanded from a stub definition)
- Type references to external libraries are simplified

## Testing

The extraction script has comprehensive test coverage with 40 tests covering:

- File generation and structure
- TypeScript type extraction
- JSDoc parsing (@default, @bindable, descriptions)
- Nested object properties
- Type formatting and normalization
- Data consistency
- Edge cases

Run the tests:

```bash
cd docs
pnpm test:unit src/extract-component-api.test.ts --run
```

Test coverage includes:

- ✅ 51 components extracted
- ✅ All property types validated
- ✅ Nested properties in 10+ components
- ✅ Cross-file consistency verified

## Future Enhancements

Potential improvements:

- Support for subdirectories (charts/, layers/, tooltip/)
- Better type resolution for imported types
- Support for different prop type naming patterns
- Extract component descriptions from file-level JSDoc
- Generate TypeScript declaration files
- API versioning and change tracking
