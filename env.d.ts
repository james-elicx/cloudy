declare global {
	namespace NodeJS {
		interface ProcessEnv {
			[key: string]: string | R2Bucket | undefined;
			CLOUDY_READ_ONLY?: string;
			AUTH_SECRET?: string;
			AUTH_GITHUB_ID?: string;
			AUTH_GITHUB_SECRET?: string;
		}
	}
}

export {};
