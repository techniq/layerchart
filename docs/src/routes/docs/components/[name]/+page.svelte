<script lang="ts">
	import { Table, Tooltip } from 'svelte-ux';
	import LucideInfo from '~icons/lucide/info';
	import { allComponents, type Component } from 'content-collections';

	import {
		h2 as H2,
		h3 as H3
	} from '@layerstack/docs/markdown/blueprints/default/blueprint.svelte';
	import { tableCell } from '@layerstack/svelte-table';
	import { ExampleListing, RelatedLink } from '@layerstack/docs/components';
	import { page } from '$app/state';

	import type { ComponentAPI, PropertyInfo } from '@layerstack/docs/api';

	let { data } = $props();
	const { PageComponent, catalog } = $derived(data);
	const metadata = $derived(data.metadata as Component);

	// One API table per entry — a single component normally, or each part of a compound
	// component (e.g. `Tooltip.Root`, `Tooltip.Item`) when listed via `components` frontmatter.
	type ApiEntry = ComponentAPI & { label: string };
	const apis = $derived((metadata.apis as ApiEntry[] | undefined) ?? []);
	/** The labels of the tables documenting `@layerchart/webgl`'s components (`webgl/<name>`) */
	const webglLabels = $derived(
		new Set(
			(metadata.components ?? []).flatMap((entry: string | { name: string; label?: string }) => {
				const name = typeof entry === 'string' ? entry : entry.name;
				const label = typeof entry === 'string' ? entry : (entry.label ?? entry.name);
				return name.startsWith('webgl/') ? [label] : [];
			})
		)
	);
	const isWebGL = (entry: ApiEntry) => webglLabels.has(entry.label);

	type ApiSection = {
		id?: string;
		heading?: string;
		/** Said in a tooltip beside the heading (ex. which package a section's props are only in) */
		note?: string;
		properties: PropertyInfo[];
		/** Props other components' Props contribute (ex. `Points`' from `Circle`), by the component */
		groups?: { from: string; properties: PropertyInfo[] }[];
		extends?: ApiEntry['extends'];
	};
	/** The component a prop's inherited from, if any (ex. `Circle` for `Points`' `z`) */
	const fromOf = (prop: PropertyInfo) => prop.inheritedFrom;
	/** Props inherited from other components, by the component */
	function groupInherited(properties: PropertyInfo[]) {
		const groups = new Map<string, PropertyInfo[]>();
		for (const prop of properties) {
			const from = fromOf(prop);
			if (from) groups.set(from, [...(groups.get(from) ?? []), prop]);
		}
		return [...groups].map(([from, props]) => ({ from, properties: props }));
	}
	const own = (properties: PropertyInfo[]) => properties.filter((prop) => !fromOf(prop));
	const slug = (text: string) =>
		text
			.toLowerCase()
			.replace(/[^a-z0-9]+/g, '-')
			.replace(/^-|-$/g, '');

	/**
	 * The tables to show.  A component documented for LayerChart and `@layerchart/webgl` alike (ex.
	 * `Points`) is one table of the props both take, as LayerChart describes them, then the props
	 * only `@layerchart/webgl`'s takes, then those only LayerChart's does.  Each lists a
	 * component's own props, then those it inherits from another (ex. `Points`' from `Circle`).
	 */
	const sections = $derived.by((): ApiSection[] => {
		const core = apis.filter((entry) => !isWebGL(entry));
		const webgl = apis.filter(isWebGL);
		const several = core.length > 1;
		const counterpart = (entry: ApiEntry) => webgl.find((w) => w.component === entry.component);
		const names = (entry: ApiEntry) => new Set(entry.properties.map((p) => p.name));

		const result: ApiSection[] = core.map((entry) => {
			const other = counterpart(entry);
			// Both packages' props, when there are both
			const shared = other
				? entry.properties.filter((p) => names(other).has(p.name))
				: entry.properties;
			return {
				id: several ? `api-${entry.component}` : undefined,
				heading: several ? entry.label : undefined,
				properties: own(shared),
				groups: groupInherited(shared),
				extends: entry.extends?.filter((e) => !e.inherited)
			};
		});
		for (const entry of core) {
			const other = counterpart(entry);
			if (!other) continue;
			const prefix = several ? `${entry.label}: ` : '';
			const webglOnly = other.properties.filter((p) => !names(entry).has(p.name));
			const coreOnly = entry.properties.filter((p) => !names(other).has(p.name));
			if (webglOnly.length) {
				result.push({
					id: `api-${[slug(prefix), 'webgl-only'].filter(Boolean).join('-')}`,
					heading: `${prefix}WebGL only`,
					note: `Taken only by @layerchart/webgl's ${entry.component}, in a WebGL layer`,
					properties: webglOnly
				});
			}
			if (coreOnly.length) {
				result.push({
					id: `api-${[slug(prefix), 'core-only'].filter(Boolean).join('-')}`,
					heading: `${prefix}Core only`,
					note: `Not taken by @layerchart/webgl's ${entry.component} (yet)`,
					properties: own(coreOnly),
					groups: groupInherited(coreOnly)
				});
			}
		}
		// `@layerchart/webgl`'s own (ex. `Surface`), as they are
		for (const entry of webgl.filter((w) => !core.some((c) => c.component === w.component))) {
			result.push({
				id: apis.length > 1 ? `api-${slug(entry.label)}` : undefined,
				heading: apis.length > 1 ? entry.label : undefined,
				properties: own(entry.properties),
				groups: groupInherited(entry.properties),
				extends: entry.extends?.filter((e) => !e.inherited)
			});
		}
		return result;
	});

	const resolveComponentExample = (component: string) =>
		allComponents.find((c) => c.name === component)?.defaultExample;
</script>

<!-- Markdown page -->
<PageComponent />

{#if catalog && (catalog.examples?.length || catalog.usage?.length)}
	<div class="mt-12">
		<ExampleListing {catalog} viewAllHref="/docs/components/{data.componentName}/examples" />
	</div>
{/if}

{#if apis.length}
	<H2 id="api-reference">API Reference</H2>

	{#each sections as section, i (section.id ?? i)}
		{#if section.heading}
			<H3 id={section.id}>
				{section.heading}
				{#if section.note}
					<!-- What the section is, beside its heading rather than under it -->
					<Tooltip title={section.note} placement="right" offset={6}>
						<LucideInfo
							class="inline-block size-4 ml-1 align-middle text-surface-content/50"
							aria-label={section.note}
						/>
					</Tooltip>
				{/if}
			</H3>
		{/if}

		{#if section.properties.length}
			{@render apiTable(section.properties)}
		{/if}
		{#each section.groups ?? [] as group (group.from)}
			<p class="text-sm text-surface-content/70 mt-6">Inherited from <code>{group.from}</code></p>
			{@render apiTable(group.properties)}
		{/each}

		{#if section.extends?.length}
			<div class="mt-4">
				also available:
				<div class="inline-flex gap-2">
					{#each section.extends as extended}
						<span class="text-sm bg-surface-content/10 px-1 py-0.5 rounded border"
							>{extended.name}</span
						>
					{/each}
				</div>
			</div>
		{/if}
	{/each}
{/if}

{#if metadata.related.length}
	<H2 id="related">Related</H2>
	<div class="grid grid-cols-xs gap-2 mt-2">
		{#each metadata.related as related}
			<RelatedLink value={related} {resolveComponentExample} />
		{/each}
	</div>
{/if}

{#snippet apiTable(properties: PropertyInfo[])}
	<Table
		data={properties}
		columns={[
			{ name: 'name', header: 'Property' },
			{ name: 'description', header: 'Description' },
			{ name: 'type', header: 'Type' }
		]}
		classes={{
			table: 'text-sm mt-1',
			th: 'border-b px-3 py-2 text-surface-content/50',
			tr: 'border-b last:border-b-0',
			td: 'px-3 py-4'
		}}
	>
		<tbody slot="data" let:columns let:data let:getCellValue let:getCellContent>
			{#each data ?? [] as rowData, rowIndex (rowIndex)}
				{@const row = rowData as PropertyInfo}
				<tr class="hover:bg-surface-content/5 border-b">
					{#each columns as column (column.name)}
						{@const value = getCellValue(column, rowData, rowIndex)}

						<td use:tableCell={{ column, rowData, rowIndex, tableData: data }}>
							{#if column.name === 'name'}
								<div class="flex items-center wrap gap-1">
									<span class="text-xs font-pixel bg-surface-content/10 px-2 py-1 rounded border"
										>{value}</span
									>
									{#if row.required}
										<span
											class="bg-danger/10 px-1 py-0.5 font-medium rounded border border-danger text-danger text-xs"
											>required</span
										>
									{/if}
								</div>
							{:else if column.name === 'type'}
								<span class="font-pixel text-xs text-surface-content/70">{value}</span>
							{:else if column.name === 'description'}
								{#if row.descriptionHtml}
									<span class="prose-inline">{@html row.descriptionHtml}</span>
								{:else}
									<span class="whitespace-pre-line">{value}</span>
								{/if}
								{#if row.default != null}
									<div class="mt-2 text-surface-content/70">
										default: <span class="font-pixel">{row.default}</span>
									</div>
								{/if}
							{:else}
								{getCellContent(column, rowData, rowIndex)}
							{/if}
						</td>
					{/each}
				</tr>
			{:else}
				<tr>
					<td colspan="4" class="p-3 italic">No properties</td>
				</tr>
			{/each}
		</tbody>
	</Table>
{/snippet}
