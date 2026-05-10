import { parse } from '@layerstack/utils';

export type ApiOptions = {
	method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
	data?: any;
	headers?: Record<string, string>;
	fetch?: typeof globalThis.fetch;
	parse?<T>(data: string): T;
};

export async function api<Data = any>(
	origin: string,
	resource: string,
	options: ApiOptions = {}
): Promise<Data | null> {
	let url = `${origin}/${resource}`;
	const method = options?.method ?? 'GET';
	const _fetch = options?.fetch ?? globalThis.fetch;

	if (method === 'GET' && options?.data) {
		url += `?${new URLSearchParams(options.data)}`;
	}

	const response = await _fetch(url, {
		method,
		headers: {
			'Content-Type': 'application/json',
			...options.headers
		},
		...(method === 'POST' &&
			options?.data && {
				body: JSON.stringify(options.data)
			})
	});

	const text = await response.text();

	if (!response.ok) {
		console.error(
			`API ${method} ${url} failed: ${response.status} ${response.statusText} - ${text}`
		);
		return null;
	}

	try {
		return options.parse ? options.parse<Data>(text) : parse<Data>(text);
	} catch {
		console.error(`API ${method} ${url} returned invalid JSON: ${text.slice(0, 200)}`);
		return null;
	}
}

export async function graphql<Data = any>(
	endpoint: string,
	query: string,
	variables: Record<string, any> = {},
	options: ApiOptions = {}
): Promise<Data | null> {
	const _fetch = options?.fetch ?? globalThis.fetch;

	const response = await _fetch(endpoint, {
		method: options?.method ?? 'POST',
		headers: {
			'Content-Type': 'application/json',
			...options.headers
		},
		body: JSON.stringify({
			query,
			variables,
			...options.data
		})
	});

	const text = await response.text();

	if (!response.ok) {
		console.error(
			`GraphQL ${endpoint} failed: ${response.status} ${response.statusText} - ${text}`
		);
		return null;
	}

	try {
		const json = options.parse ? options.parse(text) : parse(text);
		return json.data as Data;
	} catch {
		console.error(`GraphQL ${endpoint} returned invalid JSON: ${text.slice(0, 200)}`);
		return null;
	}
}
