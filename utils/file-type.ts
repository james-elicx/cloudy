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

export const parseFileType = (
	type: 'directory' | 'file',
	name: string,
	mimeType = 'unknown',
): FileType => {
	if (type === 'directory') return 'folder';

	const fileExt = name.split('.').pop()?.toLowerCase();

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
