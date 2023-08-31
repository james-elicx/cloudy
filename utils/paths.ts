export const addLeadingSlash = (path: string): string => (path.startsWith('/') ? path : `/${path}`);
export const addTrailingSlash = (path: string): string => (path.endsWith('/') ? path : `${path}/`);

export const formatFullPath = (path?: string[]): string[] =>
	path?.flatMap((p) => decodeURIComponent(p).split('/')) ?? [];

export const toTitleCase = (str: string): string =>
	str.replace(/\w\S*/g, (txt) => txt.charAt(0).toUpperCase() + txt.slice(1).toLowerCase());

export const formatBucketName = (bucketName: string): string =>
	toTitleCase(bucketName.replace(/[-_]/g, ' '));
