declare module 'virtual:sandbox-registry' {
	const packages: Record<string, () => Promise<Record<string, unknown>>>;
	export default packages;
}
