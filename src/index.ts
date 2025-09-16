import * as https from "node:https";
import * as core from "@actions/core";
import { convertBioToTable } from "./lib/convert";
import { updateFiles } from "./lib/update-files";

interface FetchBioResult {
	bio: string | null;
	error?: string;
}

function parseApiMessage(raw: string): string | undefined {
	if (!raw) {
		return undefined;
	}

	try {
		const payload = JSON.parse(raw) as { message?: string } | null;
		if (
			payload &&
			typeof payload.message === "string" &&
			payload.message.trim()
		) {
			return payload.message;
		}
	} catch (error) {
		core.debug(`Unable to parse API message: ${String(error)}`);
	}

	return undefined;
}

function buildStatusMessage(
	user: string,
	statusCode?: number,
	apiMessage?: string,
): string {
	let baseMessage: string;

	if (statusCode === 404) {
		baseMessage = `GitHub user "${user}" not found (status 404).`;
	} else if (statusCode === 403) {
		baseMessage = `GitHub API request for "${user}" was forbidden (status 403).`;
	} else {
		const statusSuffix = statusCode ? ` (status ${statusCode})` : "";
		baseMessage = `GitHub API request failed for "${user}"${statusSuffix}.`;
	}

	if (apiMessage) {
		return `${baseMessage} ${apiMessage}`;
	}

	return baseMessage;
}

async function fetchBioForUser(
	user: string,
	token?: string,
): Promise<FetchBioResult> {
	return await new Promise((resolve) => {
		const options: https.RequestOptions = {
			hostname: "api.github.com",
			path: `/users/${encodeURIComponent(user)}`,
			method: "GET",
			headers: {
				"User-Agent": "bio2markdown-table-action",
				Accept: "application/vnd.github+json",
				...(token ? { Authorization: `Bearer ${token}` } : {}),
			},
		};

		const req = https.request(options, (res) => {
			const { statusCode } = res;
			let raw = "";
			res.setEncoding("utf8");
			res.on("data", (chunk) => {
				raw += chunk;
			});
			res.on("end", () => {
				if (!statusCode || statusCode < 200 || statusCode >= 300) {
					const apiMessage = parseApiMessage(raw);
					const message = buildStatusMessage(user, statusCode, apiMessage);
					core.warning(message);
					resolve({ bio: null, error: message });
					return;
				}

				try {
					const data = JSON.parse(raw) as { bio?: string | null };
					if (typeof data.bio === "string" && data.bio.trim()) {
						resolve({ bio: data.bio });
						return;
					}

					const message = `GitHub user "${user}" has no bio set.`;
					core.warning(message);
					resolve({ bio: null, error: message });
				} catch (error) {
					const message = `Failed to parse bio response: ${String(error)}.`;
					core.warning(message);
					resolve({ bio: null, error: message });
				}
			});
		});
		req.on("error", (err) => {
			const message = `Error fetching bio for "${user}": ${String(err)}`;
			core.warning(message);
			resolve({ bio: null, error: message });
		});
		req.end();
	});
}

async function main(): Promise<void> {
	try {
		const delimiter = core.getInput("delimiter") || "/";
		const files = core.getInput("files");
		const placeholder = core.getInput("placeholder");
		const userInput = core.getInput("user");
		const token =
			core.getInput("github_token") || process.env.GITHUB_TOKEN || "";

		const resolvedUser =
			userInput ||
			process.env.GITHUB_ACTOR ||
			process.env.GITHUB_REPOSITORY_OWNER ||
			"";

		if (!resolvedUser) {
			core.setFailed('Unable to resolve a username (set input "user").');
			return;
		}

		core.info(`Fetching bio for user: ${resolvedUser}`);
		const { bio, error } = await fetchBioForUser(resolvedUser, token);

		if (!bio || !bio.trim()) {
			const message = error ?? `Bio is empty for user "${resolvedUser}".`;
			core.setFailed(message);
			return;
		}

		const table = convertBioToTable(bio, delimiter);
		core.setOutput("table", table);
		core.info("Generated table:");
		core.info(table);

		updateFiles(table, files, placeholder, core);
	} catch (error) {
		const errorMessage = error instanceof Error ? error.message : String(error);
		core.setFailed(errorMessage);
	}
}

// eslint-disable-next-line @typescript-eslint/no-floating-promises
main();
