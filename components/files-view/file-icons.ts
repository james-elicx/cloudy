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
} from '../icons';

export const fileIconsMap: { [key in FileType]: typeof File } = {
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
