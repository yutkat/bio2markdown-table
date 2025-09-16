declare namespace NodeJS {
	interface ProcessEnv {
		GITHUB_TOKEN?: string;
		GITHUB_ACTOR?: string;
		GITHUB_REPOSITORY_OWNER?: string;
	}
}
