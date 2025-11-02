# LayerChart Component API Documentation

This directory contains automatically generated API documentation for all LayerChart components.

## 📁 Files

- **`index.json`** - Quick reference listing all available components with property counts
- **`{Component}.json`** - Detailed API documentation for each component
- **`../api.json`** - Combined file with all component APIs (at `src/generated/api.json`)

## 🔍 Usage Examples

### Loading a specific component's API

```typescript
import rectApi from '$lib/../generated/api/Rect.json';

console.log(rectApi.properties); // Array of all Rect properties
```

### Getting a list of all components

```typescript
import index from '$lib/../generated/api/index.json';

const components = index.components.map((c) => c.component);
// ['AnnotationLine', 'AnnotationPoint', 'Arc', ...]
```

### Finding components with many properties

```typescript
import index from '$lib/../generated/api/index.json';

const complexComponents = index.components
	.filter((c) => c.propertyCount > 20)
	.sort((a, b) => b.propertyCount - a.propertyCount);

console.log(complexComponents);
// [{ component: 'Chart', propertyCount: 73 }, ...]
```

### Accessing property details

```typescript
import rectApi from '$lib/../generated/api/Rect.json';

const requiredProps = rectApi.properties.filter((p) => p.required);
const optionalProps = rectApi.properties.filter((p) => !p.required);
const propsWithDefaults = rectApi.properties.filter((p) => p.default);
const bindableProps = rectApi.properties.filter((p) => p.tags?.bindable);
```

### Working with nested object properties

```typescript
import annotationLineApi from '$lib/../generated/api/AnnotationLine.json';

// Find the 'props' property which has nested properties
const propsProperty = annotationLineApi.properties.find((p) => p.name === 'props');

if (propsProperty?.properties) {
	console.log('Nested properties:');
	propsProperty.properties.forEach((nested) => {
		console.log(`  - ${nested.name}: ${nested.type}`);
	});
}

// Output:
// Nested properties:
//   - label: Partial<ComponentProps<typeof Text>>
//   - line: Partial<ComponentProps<typeof Line>>
```

## 📊 Component Structure

Each component file has the following structure:

```typescript
{
	generatedAt: string; // ISO timestamp
	component: string; // Component name (e.g., "Rect")
	propsType: string; // TypeScript type name (e.g., "RectPropsWithoutHTML")
	properties: Array<{
		name: string; // Property name
		type: string; // TypeScript type as string
		required: boolean; // Whether the property is required (inverse of optional)
		description?: string; // JSDoc description
		default?: string; // Default value from @default tag
		tags?: Record<string, string>; // Other JSDoc tags
		properties?: PropertyInfo[]; // Nested properties for object types
	}>;
}
```

### Nested Properties

For object-type properties (like `props`, `classes`, `extents`), the API includes a nested `properties` array:

```json
{
	"name": "props",
	"type": "{ label?: Partial<...>; line?: Partial<...>; }",
	"optional": true,
	"description": "Classes for inner elements",
	"properties": [
		{
			"name": "label",
			"type": "Partial<ComponentProps<typeof Text>>",
			"required": false
		},
		{
			"name": "line",
			"type": "Partial<ComponentProps<typeof Line>>",
			"required": false
		}
	]
}
```

## 🔄 Regenerating

To regenerate all API files:

```bash
cd docs
pnpm extract:api
```

This will:

1. Scan all Svelte components in `packages/layerchart/src/lib/components`
2. Extract TypeScript type definitions
3. Parse JSDoc comments
4. Generate individual JSON files for each component
5. Create the index.json file
6. Update the combined api.json file

## 📝 Available Components

Currently documenting **51 components** including:

- **Shapes**: Rect, Circle, Line, Arc, Area, Ellipse, Polygon
- **Charts**: Chart, Axis, Legend, Bars, Pie
- **Annotations**: AnnotationLine, AnnotationPoint, AnnotationRange
- **Geo**: GeoPath, GeoPoint, GeoCircle, GeoTile
- **Effects**: Pattern, LinearGradient, RadialGradient, ClipPath
- **Utilities**: Grid, Group, Frame, Hull, Voronoi
- And many more...

See `index.json` for the complete list.
