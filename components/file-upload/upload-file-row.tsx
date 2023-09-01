'use client';

import { bytesToString } from '@/utils';

type Props = {
	file: File;
};

export const UploadFileRow = ({ file }: Props) => (
	<div className="flex w-full flex-row items-center gap-1">
		<div className="flex flex-grow flex-col truncate pr-1">
			<span className="truncate" title={file.name}>
				{file.name}
			</span>

			<div className="grid grid-cols-4 text-xs">
				<span className="col-span-2 truncate pr-1">{file.type || 'unknown type'}</span>
				<span>{bytesToString(file.size)}</span>
				<span suppressHydrationWarning className="text-right">
					{new Date(file.lastModified).toLocaleDateString()}
				</span>
			</div>
		</div>
	</div>
);
