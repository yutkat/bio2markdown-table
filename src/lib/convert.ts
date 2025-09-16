export function escapeRegex(literal: string): string {
	return literal.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

export function convertBioToTable(bio: string, delimiter: string): string {
	const sep = delimiter && delimiter.length > 0 ? delimiter : "/";
	const splitter = new RegExp(`\\s*${escapeRegex(sep)}\\s*`);
	const lines = bio
		.split(splitter)
		.map((line) => line.trim())
		.filter(Boolean);
	const tableRows: string[] = [];

	for (const line of lines) {
		if (line.includes(":")) {
			const [key, ...valueParts] = line.split(":");
			if (key) {
				const value = valueParts.join(":").trim();
				tableRows.push(`| **${key.trim()}** | ${value} |`);
			}
		}
	}

	const table = ["| | |", "|---:|:---|", ...tableRows].join("\n");

	return table;
}
