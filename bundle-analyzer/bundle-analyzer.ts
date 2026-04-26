import { build } from "vite";
import { svelte } from "@sveltejs/vite-plugin-svelte";
import { resolve, join } from "node:path";
import {
	writeFileSync,
	readFileSync,
	existsSync,
	mkdirSync,
	rmSync,
} from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname } from "node:path";
import { gzipSync } from "node:zlib";
import {
	getScenarios,
	getComponentScenarios,
	type Scenario,
} from "./define-scenarios.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

interface BundleResult {
	scenario: string;
	description: string;
	size: number;
	gzipSize: number;
	imports: string[];
}

interface BundleReport {
	timestamp: string;
	results: BundleResult[];
}


class BundleAnalyzer {
	tempDir: string;
	outputDir: string;

	constructor() {
		this.tempDir = resolve(__dirname, ".temp-bundle-analysis");
		this.outputDir = resolve(__dirname, "./bundle-reports");
	}

	async analyze(options: {
		scenarios?: string[];
		components?: boolean;
		componentFilter?: string[];
	}): Promise<BundleReport> {
		console.log("Starting bundle analysis...\n");

		const scenariosToAnalyze: Scenario[] = [];

		// Add use-case scenarios (unless --components-only)
		if (!options.components || options.scenarios) {
			scenariosToAnalyze.push(...getScenarios(options.scenarios));
		}

		// Add individual component scenarios if requested
		if (options.components) {
			scenariosToAnalyze.push(
				...getComponentScenarios(options.componentFilter)
			);
		}

		this.setupDirectories();

		const results: BundleResult[] = [];

		for (const scenario of scenariosToAnalyze) {
			console.log(`  Analyzing: ${scenario.name}`);
			const result = await this.analyzeScenario(scenario);
			results.push(result);
		}

		const report: BundleReport = {
			timestamp: new Date().toISOString(),
			results,
		};

		this.saveReport(report);
		this.printReport(report);

		// Clean up temp directory
		if (existsSync(this.tempDir)) {
			rmSync(this.tempDir, { recursive: true });
		}

		return report;
	}

	private setupDirectories(): void {
		if (existsSync(this.tempDir)) {
			rmSync(this.tempDir, { recursive: true });
		}
		mkdirSync(this.tempDir, { recursive: true });

		if (!existsSync(this.outputDir)) {
			mkdirSync(this.outputDir, { recursive: true });
		}
	}

	private async analyzeScenario(
		scenario: Scenario
	): Promise<BundleResult> {
		const entryPath = this.createEntryFile(scenario);
		const { size, gzipSize } = await this.buildAndMeasure(
			entryPath,
			scenario.name
		);

		return {
			scenario: scenario.name,
			description: scenario.description,
			size,
			gzipSize,
			imports: scenario.imports,
		};
	}

	private createEntryFile(scenario: Scenario): string {
		let content: string;

		if (scenario.imports.length === 1 && scenario.imports[0] === "*") {
			// Wildcard import: import everything
			content = `import * as LayerChart from "layerchart";
;(globalThis.__lc_keep ||= []).push(LayerChart);
`;
		} else {
			const importList = scenario.imports.join(", ");
			content = `import { ${importList} } from "layerchart";

const refs = [
	${scenario.imports.join(",\n\t")}
];
;(globalThis.__lc_keep ||= []).push(refs);
`;
		}

		// Add extra imports if defined
		if (scenario.extraImports) {
			for (const line of scenario.extraImports) {
				content = `${line}\n${content}`;
			}
		}

		const safeName = scenario.name.replace(/[^a-zA-Z0-9_-]/g, "_");
		const filePath = join(this.tempDir, `${safeName}.entry.ts`);
		writeFileSync(filePath, content);
		return filePath;
	}

	private async buildAndMeasure(
		entryPath: string,
		scenarioName: string
	): Promise<{ size: number; gzipSize: number }> {
		const safeName = scenarioName.replace(/[^a-zA-Z0-9_-]/g, "_");
		const outputPath = join(this.tempDir, `dist-${safeName}`);

		try {
			await build({
				plugins: [
					svelte(),
					{
						name: "strip-comments",
						generateBundle(_options, bundle) {
							for (const fileName in bundle) {
								const chunk = bundle[fileName];
								if (!chunk || chunk.type !== "chunk") continue;
								chunk.code = chunk.code
									.replace(/\/\*[\s\S]*?\*\//g, "")
									.replace(/\/\/.*$/gm, "")
									.replace(/^\s*\n/gm, "");
							}
						},
					},
				],
				esbuild: {
					minifyWhitespace: true,
					minifyIdentifiers: true,
					minifySyntax: true,
					legalComments: "none",
					target: "es2020",
				},
				build: {
					lib: {
						entry: entryPath,
						formats: ["es"],
						fileName: "bundle",
					},
					outDir: outputPath,
					write: true,
					minify: "esbuild",
					sourcemap: false,
					rollupOptions: {
						external: [
							"svelte",
							"svelte/internal",
							"svelte/internal/client",
							"svelte/internal/server",
							"svelte/store",
							"svelte/animate",
							"svelte/easing",
							"svelte/motion",
							"svelte/transition",
							"svelte/compiler",
						],
						output: {
							minifyInternalExports: true,
							hoistTransitiveImports: false,
							entryFileNames: "bundle.js",
						},
						treeshake: {
							moduleSideEffects: false,
							propertyReadSideEffects: false,
							unknownGlobalSideEffects: false,
						},
					},
				},
				logLevel: "silent",
			});

			return this.measureBundle(safeName);
		} catch (error) {
			console.error(`  Failed to build ${scenarioName}:`, error);
			return { size: 0, gzipSize: 0 };
		}
	}

	private measureBundle(
		safeName: string
	): { size: number; gzipSize: number } {
		const bundlePath = join(this.tempDir, `dist-${safeName}`, "bundle.js");

		if (!existsSync(bundlePath)) {
			return { size: 0, gzipSize: 0 };
		}

		const content = readFileSync(bundlePath, "utf-8");
		const size = Buffer.byteLength(content, "utf-8");
		const gzipSize = gzipSync(content).length;

		return { size, gzipSize };
	}

	private saveReport(report: BundleReport): void {
		const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
		const filepath = join(this.outputDir, `bundle-report-${timestamp}.json`);

		writeFileSync(filepath, JSON.stringify(report, null, 2));

		const latestPath = join(this.outputDir, "latest.json");
		writeFileSync(latestPath, JSON.stringify(report, null, 2));

		console.log(`\nReport saved to ${filepath}`);
	}

	private printReport(report: BundleReport): void {
		console.log("\nBundle Size Report");
		console.log("==================");
		console.log(`Generated: ${new Date(report.timestamp).toLocaleString()}\n`);

		// Separate scenarios and components
		const scenarioResults = report.results.filter(
			(r) => !r.scenario.startsWith("component:")
		);
		const componentResults = report.results.filter((r) =>
			r.scenario.startsWith("component:")
		);

		if (scenarioResults.length > 0) {
			console.log("Use-Case Scenarios:");
			console.log("-------------------");
			for (const result of scenarioResults) {
				const sizeKB = (result.size / 1024).toFixed(2);
				const gzipKB = (result.gzipSize / 1024).toFixed(2);
				console.log(
					`  ${result.scenario.padEnd(25)} ${sizeKB.padStart(8)} KB  (${gzipKB.padStart(7)} KB gzipped)`
				);
			}
		}

		if (componentResults.length > 0) {
			console.log("\nIndividual Components:");
			console.log("---------------------");
			for (const result of componentResults) {
				const name = result.scenario.replace("component:", "");
				const sizeKB = (result.size / 1024).toFixed(2);
				const gzipKB = (result.gzipSize / 1024).toFixed(2);
				console.log(
					`  ${name.padEnd(25)} ${sizeKB.padStart(8)} KB  (${gzipKB.padStart(7)} KB gzipped)`
				);
			}
		}
	}

	static compare(currentPath: string, previousPath: string): void {
		const current: BundleReport = JSON.parse(
			readFileSync(currentPath, "utf-8")
		);
		const previous: BundleReport = JSON.parse(
			readFileSync(previousPath, "utf-8")
		);

		console.log("\nBundle Size Comparison");
		console.log("=====================\n");

		const currentMap = new Map(current.results.map((r) => [r.scenario, r]));
		const previousMap = new Map(
			previous.results.map((r) => [r.scenario, r])
		);

		const allScenarios = new Set([
			...currentMap.keys(),
			...previousMap.keys(),
		]);

		for (const scenario of Array.from(allScenarios).sort()) {
			const curr = currentMap.get(scenario);
			const prev = previousMap.get(scenario);

			if (!curr) {
				console.log(`  REMOVED  ${scenario}`);
				continue;
			}

			if (!prev) {
				console.log(
					`  NEW      ${scenario}: +${(curr.size / 1024).toFixed(2)} KB`
				);
				continue;
			}

			const sizeDiff = curr.size - prev.size;
			const percentChange = ((sizeDiff / prev.size) * 100).toFixed(1);
			const diffKB = (sizeDiff / 1024).toFixed(2);
			const sign = sizeDiff > 0 ? "+" : "";
			const icon = sizeDiff > 0 ? "UP" : sizeDiff < 0 ? "DOWN" : "SAME";

			console.log(
				`  ${icon.padEnd(6)} ${scenario.padEnd(25)} ${sign}${diffKB} KB (${sign}${percentChange}%)`
			);
		}
	}
}

async function main() {
	const args = process.argv.slice(2);

	if (args.includes("--compare")) {
		const idx = args.indexOf("--compare");
		const currentPath = args[idx + 1];
		const previousPath = args[idx + 2];

		if (currentPath && previousPath) {
			BundleAnalyzer.compare(currentPath, previousPath);
		} else {
			console.error(
				"Usage: --compare <current-report.json> <previous-report.json>"
			);
			process.exit(1);
		}
		return;
	}

	const includeComponents = args.includes("--components");
	const scenarioFilter = args
		.filter((a) => !a.startsWith("--"))
		.filter((a) => a.length > 0);

	const analyzer = new BundleAnalyzer();
	await analyzer.analyze({
		scenarios: scenarioFilter.length > 0 ? scenarioFilter : undefined,
		components: includeComponents,
		componentFilter:
			scenarioFilter.length > 0 ? scenarioFilter : undefined,
	});
}

main().catch(console.error);

export { BundleAnalyzer, type BundleReport, type BundleResult };
