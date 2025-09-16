import { afterEach, describe, expect, it } from "bun:test";
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { updateFiles, type UpdateLogger } from "../../src/lib/update-files";

class MockLogger implements UpdateLogger {
	infos: string[] = [];
	warnings: string[] = [];
	failures: string[] = [];

	info(message: string): void {
		this.infos.push(message);
	}

	warning(message: string): void {
		this.warnings.push(message);
	}

	setFailed(message: string): void {
		this.failures.push(message);
	}
}

function createTempDir(): string {
	return mkdtempSync(join(tmpdir(), "bio2md-"));
}

describe("updateFiles", () => {
	const tempDirs: string[] = [];
	const placeholder = "{{bio}}";
	const table = "| **Role** | Developer |";

	afterEach(() => {
		for (const dir of tempDirs.splice(0)) {
			rmSync(dir, { recursive: true, force: true });
		}
	});

	it("replaces placeholder across multiple files", () => {
		const dir = createTempDir();
		tempDirs.push(dir);
		const fileA = join(dir, "a.md");
		const fileB = join(dir, "b.md");

		writeFileSync(fileA, `Intro\n${placeholder}\n`);
		writeFileSync(fileB, `${placeholder}\nOutro`);

		const logger = new MockLogger();
		updateFiles(table, `${fileA}, ${fileB}`, placeholder, logger);

		expect(readFileSync(fileA, "utf8")).toContain(table);
		expect(readFileSync(fileB, "utf8")).toContain(table);
		expect(logger.infos).toEqual([`Updated ${fileA}`, `Updated ${fileB}`]);
		expect(logger.failures).toHaveLength(0);
	});

	it("does not replace placeholder embedded in text", () => {
		const dir = createTempDir();
		tempDirs.push(dir);
		const fileA = join(dir, "inline.md");
		writeFileSync(fileA, `Intro ${placeholder} inline`);

		const logger = new MockLogger();
		updateFiles(table, fileA, placeholder, logger);

		const content = readFileSync(fileA, "utf8");
		expect(content).toContain(`Intro ${placeholder} inline`);
		expect(content).not.toContain(table);
		expect(logger.failures).toHaveLength(0);
	});

	it("warns when target file is missing", () => {
		const dir = createTempDir();
		tempDirs.push(dir);
		const fileA = join(dir, "existing.md");
		const missingFile = join(dir, "missing.md");

		writeFileSync(fileA, `${placeholder}\n`);

		const logger = new MockLogger();
		updateFiles(table, `${fileA}, ${missingFile}`, placeholder, logger);

		expect(readFileSync(fileA, "utf8")).toBe(`${table}\n`);
		expect(logger.warnings).toContain(`File ${missingFile} not found`);
		expect(logger.failures).toHaveLength(0);
	});
});
