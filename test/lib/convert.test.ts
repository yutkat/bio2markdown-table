import { describe, expect, it } from "bun:test";
import { convertBioToTable } from "../../src/lib/convert";

describe("convertBioToTable", () => {
	it("converts basic bio with default '/' delimiter", () => {
		const bio = "Role: Programmer / Editor: Neovim";
		const out = convertBioToTable(bio, "/");
		expect(out).toBe(
			[
				"| | |",
				"|---:|:---|",
				"| **Role** | Programmer |",
				"| **Editor** | Neovim |",
			].join("\n"),
		);
	});

	it("trims whitespace around delimiter entries", () => {
		const bio = "Role: Programmer   /   Shell: zsh";
		const out = convertBioToTable(bio, "/");
		expect(out.endsWith("| **Shell** | zsh |")).toBeTrue();
	});

	it("supports custom delimiter ';'", () => {
		const bio = "Role: Programmer; Editor: Neovim; Terminal: WezTerm";
		const out = convertBioToTable(bio, ";");
		expect(out.split("\n").length).toBe(5); // header(2) + 3 rows
		expect(out.includes("| **Editor** | Neovim |")).toBeTrue();
	});

	it("ignores entries without ':'", () => {
		const bio = "Role: Programmer / INVALID / Shell: zsh";
		const out = convertBioToTable(bio, "/");
		const lines = out.split("\n");
		expect(lines).toEqual([
			"| | |",
			"|---:|:---|",
			"| **Role** | Programmer |",
			"| **Shell** | zsh |",
		]);
	});

	it("preserves additional colons in values", () => {
		const bio = "Account: foo:bar / OS: Linux";
		const out = convertBioToTable(bio, "/");
		expect(out.includes("| **Account** | foo:bar |")).toBeTrue();
	});

	it("escapes regex when delimiter has special characters like '.'", () => {
		const bio = "A: 1 . B: 2 . C: 3"; // delimiter '.'
		const out = convertBioToTable(bio, ".");
		expect(out.split("\n").length).toBe(5); // header(2) + 3 rows
		expect(out.includes("| **B** | 2 |")).toBeTrue();
	});
});
