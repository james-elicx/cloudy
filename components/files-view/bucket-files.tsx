'use client';

import { useState } from 'react';
import { BucketFileRow } from './bucket-file-row';
import { CaretDown, CaretUp } from '../icons';

type Props = {
	bucketName: string;
	directories: string[];
	files: R2Object[];
};

export const BucketFilesTable = ({ bucketName, directories, files }: Props): JSX.Element => {
	const [sort, setSort] = useState({ field: 'name', order: 'asc' });

	return (
		<table className="border-separate border-spacing-0">
			<thead>
				<tr className="text-left [&>*]:text-sm [&>*]:font-normal">
					<th aria-label="Icon" className="w-[6rem]" />
					<th className="w-[30rem] py-2">
						<button
							className="flex w-full flex-row items-center justify-between"
							type="button"
							onClick={() =>
								setSort((prev) => ({
									field: 'name',
									order: prev.field === 'name' && prev.order === 'asc' ? 'desc' : 'asc',
								}))
							}
						>
							Name
							{sort.field === 'name' &&
								(sort.order === 'asc' ? (
									<CaretUp weight="bold" className="mr-2 h-3 w-3" />
								) : (
									<CaretDown className="mr-2 h-3 w-3" />
								))}
						</button>
					</th>
					<th className="w-[12rem]">Type</th>
					<th className="w-[12rem]">Size</th>
					<th className="w-[12rem]">Last Modified</th>
				</tr>
			</thead>

			<tbody className="[&>:nth-child(odd)>*]:bg-secondary/40 dark:[&>:nth-child(odd)>*]:bg-secondary-dark/40">
				{directories.map((dir) => (
					<BucketFileRow
						key={`bucket-${bucketName}-${dir}`}
						bucketName={bucketName}
						path={dir}
						type="directory"
					/>
				))}

				{files.map((file) => (
					<BucketFileRow
						key={`bucket-${bucketName}-${file.key}`}
						bucketName={bucketName}
						path={file.key}
						type="file"
						file={file}
					/>
				))}
			</tbody>
		</table>
	);
};
