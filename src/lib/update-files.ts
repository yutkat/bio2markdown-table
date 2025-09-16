import * as fs from "node:fs";

export interface UpdateLogger {
	info(message: string): void;
	warning(message: string): void;
	setFailed(message: string): void;
}

function escapePlaceholder(placeholder: string): string {
	return placeholder.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

export function updateFiles(
	table: string,
	files: string,
	placeholder: string,
	logger: UpdateLogger,
): void {
	const fileList = files
		.split(",")
		.map((f) => f.trim())
		.filter(Boolean);
	const escapedPlaceholder = escapePlaceholder(placeholder);

	for (const file of fileList) {
		try {
			if (fs.existsSync(file)) {
				let content = fs.readFileSync(file, "utf8");
				const placeholderPattern = new RegExp(
					`^${escapedPlaceholder}[ \t]*$`,
					"gm",
				);
				content = content.replace(placeholderPattern, table);
				fs.writeFileSync(file, content);
				logger.info(`Updated ${file}`);
			} else {
				logger.warning(`File ${file} not found`);
			}
		} catch (error) {
			const errorMessage =
				error instanceof Error ? error.message : String(error);
			logger.setFailed(`Error updating ${file}: ${errorMessage}`);
		}
	}
}
