export const addLeadingSlash = (path: string): string => (path.startsWith('/') ? path : `/${path}`);
export const addTrailingSlash = (path: string): string => (path.endsWith('/') ? path : `${path}/`);

export const formatFullPath = (path: string[]) =>
	path.flatMap((p) => decodeURIComponent(p).split('/')) as [bucketName: string, ...path: string[]];

export const formatBucketName = (bucketName: string): string =>
	bucketName
		.replace(/[-_]/g, ' ')
		.replace(/\w\S*/g, (txt) => txt.charAt(0).toUpperCase() + txt.slice(1).toLowerCase());
