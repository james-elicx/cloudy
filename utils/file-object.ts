import { bytesToString } from './bytes-to-string';

export type FileType =
	| 'unknown'
	| 'folder'
	| 'image'
	| 'video'
	| 'audio'
	| 'text'
	| 'pdf'
	| 'json'
	| 'xml'
	| 'archive'
	| 'markdown'
	| 'javascript'
	| 'typescript'
	| 'css';

export const parseFileType = (path: string, mimeType = 'unknown'): FileType => {
	const fileExt = path.split('.').pop()?.toLowerCase();

	switch (mimeType) {
		case /^image\/.*/.test(mimeType) && mimeType:
			return 'image';
		case 'video/vnd.dlna.mpeg-tts':
			return 'typescript';
		case /^video\/.*/.test(mimeType) && mimeType:
			return 'video';
		case /^audio\/.*/.test(mimeType) && mimeType:
			return 'audio';
		case 'text/javascript':
			return 'javascript';
		case 'text/css':
			return 'css';
		case /^text\/.*/.test(mimeType) && mimeType:
			return 'text';
		case 'application/pdf':
			return 'pdf';
		case 'application/json':
			return 'json';
		case 'application/xml':
			return 'xml';
		case 'application/zip':
		case 'application/x-zip-compressed':
			return 'archive';
		default:
			switch (fileExt) {
				case 'md':
				case 'mdx':
					return 'markdown';
				case 'jsx':
					return 'javascript';
				case 'tsx':
					return 'typescript';
				default:
					return 'unknown';
			}
	}
};

export const parseObject = (object: string | R2Object) => {
	const isDirectory = typeof object === 'string';
	const path = isDirectory ? object : object.key;

	return {
		isDirectory,
		path,
		getName: (): string => path.replace(/\/$/, '').replace(/.*\//, ''),
		getType: (): FileType =>
			isDirectory ? 'folder' : parseFileType(object.key, object.httpMetadata?.contentType),
		getSize: (): string => (isDirectory ? '' : bytesToString(object.size)),
		getLastModified: (): Date | null => {
			if (isDirectory) return null;

			const mtime = object.customMetadata?.['mtime'];
			const lastMod = Number(mtime?.length === 10 ? mtime.padEnd(13, '0') : mtime);
			if (Number.isNaN(lastMod)) return null;

			return new Date(lastMod);
		},
	};
};
