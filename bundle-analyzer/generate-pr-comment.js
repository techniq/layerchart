import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { resolve, dirname } from "node:path";

/**
 * @typedef {Object} BundleResult
 * @property {string} scenario
 * @property {string} description
 * @property {number} size
 * @property {number} gzipSize
 * @property {string[]} imports
 */

/**
 * @typedef {Object} BundleReport
 * @property {string} timestamp
 * @property {BundleResult[]} results
 */

/**
 * @typedef {Object} ScenarioDiff
 * @property {string} scenario
 * @property {string} description
 * @property {'added'|'removed'|'changed'|'unchanged'} status
 * @property {number} sizeDiff
 * @property {number} gzipSizeDiff
 * @property {number} sizePercent
 * @property {number} gzipSizePercent
 * @property {number} currentSize
 * @property {number} currentGzipSize
 * @property {number} targetSize
 * @property {number} targetGzipSize
 */

function formatKB(bytes) {
	return (bytes / 1024).toFixed(2);
}

function formatDiff(bytes) {
	const sign = bytes > 0 ? "+" : "";
	return `${sign}${formatKB(bytes)}`;
}

function formatPercent(percent) {
	if (!isFinite(percent)) return "";
	const sign = percent > 0 ? "+" : "";
	return `${sign}${percent.toFixed(1)}%`;
}

function getStatusIcon(status, sizeDiff) {
	if (status === "changed") {
		return sizeDiff > 0 ? "\u{1F534}" : sizeDiff < 0 ? "\u{1F7E2}" : "\u27A1\uFE0F";
	}
	return "\u27A1\uFE0F";
}

function analyzeChanges(prReport, targetReport) {
	/** @type {ScenarioDiff[]} */
	const changes = [];

	const prMap = new Map(prReport.results.map((r) => [r.scenario, r]));
	const targetMap = new Map(targetReport.results.map((r) => [r.scenario, r]));
	const allScenarios = new Set([...prMap.keys(), ...targetMap.keys()]);

	for (const scenario of allScenarios) {
		const pr = prMap.get(scenario);
		const target = targetMap.get(scenario);

		if (pr && target) {
			const sizeDiff = pr.size - target.size;
			const gzipSizeDiff = pr.gzipSize - target.gzipSize;
			const sizePercent =
				target.size > 0 ? (sizeDiff / target.size) * 100 : 0;
			const gzipSizePercent =
				target.gzipSize > 0
					? (gzipSizeDiff / target.gzipSize) * 100
					: 0;

			const hasSignificantChange =
				Math.abs(sizeDiff) > 10 || Math.abs(sizePercent) > 0.1;

			changes.push({
				scenario,
				description: pr.description || target.description || "",
				group: pr.group || target.group,
				status: hasSignificantChange ? "changed" : "unchanged",
				sizeDiff,
				gzipSizeDiff,
				sizePercent,
				gzipSizePercent,
				currentSize: pr.size,
				currentGzipSize: pr.gzipSize,
				targetSize: target.size,
				targetGzipSize: target.gzipSize,
			});
		} else if (pr && !target) {
			changes.push({
				scenario,
				description: pr.description || "",
				group: pr.group,
				status: "added",
				sizeDiff: pr.size,
				gzipSizeDiff: pr.gzipSize,
				sizePercent: Infinity,
				gzipSizePercent: Infinity,
				currentSize: pr.size,
				currentGzipSize: pr.gzipSize,
				targetSize: 0,
				targetGzipSize: 0,
			});
		} else if (!pr && target) {
			changes.push({
				scenario,
				description: target.description || "",
				group: target.group,
				status: "removed",
				sizeDiff: -target.size,
				gzipSizeDiff: -target.gzipSize,
				sizePercent: -100,
				gzipSizePercent: -100,
				currentSize: 0,
				currentGzipSize: 0,
				targetSize: target.size,
				targetGzipSize: target.gzipSize,
			});
		}
	}

	// Preserve the input order — PR scenarios first (which start with `core`),
	// then any target-only scenarios. Order within a group reflects the order
	// in `bundle-scenarios.ts`.
	return changes;
}

function generateComment(changes, hasBaseline = true) {
	let comment = "## Bundle Size Analysis\n\n";

	if (!hasBaseline) {
		comment +=
			"**Initial bundle size report** - No baseline to compare against.\n\n";
		comment +=
			"Future PRs will show size comparisons against this baseline.\n\n";

		// Separate scenarios vs components
		const scenarios = changes.filter(
			(c) => !c.scenario.startsWith("component:")
		);
		const components = changes.filter((c) =>
			c.scenario.startsWith("component:")
		);

		if (scenarios.length > 0) {
			comment += "### Use-Case Scenarios\n\n";
			comment += "| Scenario | Size | Gzipped |\n";
			comment += "|----------|-----:|--------:|\n";
			for (const s of scenarios) {
				comment += `| \`${s.scenario}\` | ${formatKB(s.currentSize)} KB | ${formatKB(s.currentGzipSize)} KB |\n`;
			}
			comment += "\n";
		}

		if (components.length > 0) {
			comment += "<details>\n<summary>Individual Components</summary>\n\n";
			comment += "| Component | Size | Gzipped |\n";
			comment += "|-----------|-----:|--------:|\n";
			for (const c of components) {
				const name = c.scenario.replace("component:", "");
				comment += `| \`${name}\` | ${formatKB(c.currentSize)} KB | ${formatKB(c.currentGzipSize)} KB |\n`;
			}
			comment += "\n</details>\n\n";
		}

		return comment;
	}

	const changedItems = changes.filter((c) => c.status !== "unchanged");

	if (changedItems.length === 0) {
		comment += "No significant bundle size changes detected.\n\n";
		return comment;
	}

	// Separate scenarios vs components
	const changedScenarios = changedItems.filter(
		(c) => !c.scenario.startsWith("component:")
	);
	const changedComponents = changedItems.filter((c) =>
		c.scenario.startsWith("component:")
	);

	if (changedScenarios.length > 0) {
		comment += "### Use-Case Scenarios\n\n";

		// Group rows by `group` field, preserving insertion order. Scenarios
		// without a `group` end up under "Other".
		/** @type {Map<string, ScenarioDiff[]>} */
		const byGroup = new Map();
		for (const s of changedScenarios) {
			const g = s.group || "Other";
			if (!byGroup.has(g)) byGroup.set(g, []);
			byGroup.get(g).push(s);
		}

		const renderRow = (s) => {
			const icon = getStatusIcon(s.status, s.sizeDiff);
			const current = `${formatKB(s.targetSize)} KB <sub>(${formatKB(s.targetGzipSize)} gz)</sub>`;
			const newSize = `${formatKB(s.currentSize)} KB <sub>(${formatKB(s.currentGzipSize)} gz)</sub>`;
			const change = `${formatDiff(s.sizeDiff)} KB (${formatPercent(s.sizePercent)}) <sub>(${formatDiff(s.gzipSizeDiff)} gz, ${formatPercent(s.gzipSizePercent)})</sub>`;
			return `| ${icon} \`${s.scenario}\` | ${current} | ${newSize} | ${change} |\n`;
		};

		for (const [groupName, rows] of byGroup) {
			comment += `#### ${groupName}\n\n`;
			comment += "| Scenario | Current | New | Change |\n";
			comment += "|----------|--------:|----:|-------:|\n";
			for (const s of rows) comment += renderRow(s);
			comment += "\n";
		}
	}

	if (changedComponents.length > 0) {
		comment += "<details>\n<summary>Individual Components";
		comment += ` (${changedComponents.length} changed)</summary>\n\n`;
		comment += "| Component | Current | New | Change |\n";
		comment += "|-----------|--------:|----:|-------:|\n";

		for (const c of changedComponents) {
			const name = c.scenario.replace("component:", "");
			const icon = getStatusIcon(c.status, c.sizeDiff);
			const current = `${formatKB(c.targetSize)} KB`;
			const newSize = `${formatKB(c.currentSize)} KB`;
			const change = `${formatDiff(c.sizeDiff)} KB (${formatPercent(c.sizePercent)})`;
			comment += `| ${icon} \`${name}\` | ${current} | ${newSize} | ${change} |\n`;
		}
		comment += "\n</details>\n\n";
	}

	comment += "---\n\n";
	comment += "<details>\n";
	comment += "<summary>Understanding this report</summary>\n\n";
	comment +=
		"- **Use-case scenarios** measure the bundle cost of common chart configurations (e.g. a line chart with axes)\n";
	comment +=
		"- **Individual components** measure each component imported in isolation\n";
	comment +=
		"- Svelte runtime is excluded; sizes reflect layerchart + its dependencies (d3, etc.)\n";
	comment +=
		"- When multiple components share dependencies (e.g. d3-scale), the real-world cost is lower than the sum of individual sizes\n";
	comment +=
		"- Changes smaller than 10 bytes or 0.1% are considered insignificant\n\n";
	comment += "</details>\n";

	return comment;
}

function main() {
	const args = process.argv.slice(2);

	if (args.length !== 2) {
		console.error(
			"Usage: node generate-pr-comment.js <pr-report.json> <target-report.json>"
		);
		process.exit(1);
	}

	const [prReportPath, targetReportPath] = args;

	try {
		/** @type {BundleReport} */
		const prReport = JSON.parse(
			readFileSync(resolve(prReportPath), "utf-8")
		);
		/** @type {BundleReport} */
		const targetReport = JSON.parse(
			readFileSync(resolve(targetReportPath), "utf-8")
		);

		const hasBaseline =
			targetReport.results && targetReport.results.length > 0;

		let changes;
		if (hasBaseline) {
			changes = analyzeChanges(prReport, targetReport);
		} else {
			changes = prReport.results.map((result) => ({
				scenario: result.scenario,
				description: result.description,
				status: "added",
				sizeDiff: result.size,
				gzipSizeDiff: result.gzipSize,
				sizePercent: Infinity,
				gzipSizePercent: Infinity,
				currentSize: result.size,
				currentGzipSize: result.gzipSize,
				targetSize: 0,
				targetGzipSize: 0,
			}));
		}

		const comment = generateComment(changes, hasBaseline);

		const outputDir = "/tmp/bundle-analysis";
		mkdirSync(outputDir, { recursive: true });
		writeFileSync(`${outputDir}/comment.md`, comment);

		console.log("Bundle analysis comment generated successfully");
		if (hasBaseline) {
			const changed = changes.filter((c) => c.status !== "unchanged");
			console.log(`Found ${changed.length} changed scenarios`);
		} else {
			console.log("No baseline found - generated initial report");
		}
	} catch (error) {
		console.error("Failed to generate bundle analysis comment:", error.message);
		process.exit(1);
	}
}

main();
