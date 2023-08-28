declare global {
	namespace NodeJS {
		interface ProcessEnv {
			[key: string]: string | R2Bucket | undefined;
			CLOUDY_READ_ONLY?: string;
		}
	}
}

export {};
