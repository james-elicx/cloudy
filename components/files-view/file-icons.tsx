import type { FileType } from '@/utils';
import {
	File,
	FileZip,
	FileAudio,
	FileCode,
	FileImage,
	FilePdf,
	FileText,
	FileVideo,
	FolderSimple,
	CaretUp,
	CaretDown,
} from '../icons';

const fileIconsMap: { [key in FileType]: typeof File } = {
	unknown: File,
	folder: FolderSimple,
	image: FileImage,
	video: FileVideo,
	audio: FileAudio,
	text: FileText,
	pdf: FilePdf,
	json: FileCode,
	xml: FileCode,
	archive: FileZip,
	markdown: FileText,
	javascript: FileCode,
	typescript: FileCode,
	css: FileCode,
};

export const getFileIcon = (type: FileType) => fileIconsMap[type];

export const getSortIcon = (direction: 'asc' | 'desc' | false) => {
	switch (direction) {
		case 'asc':
			return <CaretUp weight="bold" className="mr-2 h-3 w-3" />;
		case 'desc':
			return <CaretDown weight="bold" className="mr-2 h-3 w-3" />;
		default:
			return null;
	}
};
