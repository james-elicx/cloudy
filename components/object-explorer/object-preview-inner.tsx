import { addLeadingSlash } from '@/utils';
import type { FileType } from '@/utils';
import { memo } from 'react';
import { twMerge } from 'tailwind-merge';
import { encode } from '@/utils/encoding';
import { useLocation } from '../providers';
import { getFileIcon } from './file-icons';

type Props = {
	className?: string;
	path: string;
	type: FileType;
};

const FallbackIcon = ({ type: itemType }: Pick<Props, 'type'>) => {
	const Icon = getFileIcon(itemType);
	return <Icon size={40} className="absolute z-0" />;
};

export const ObjectPreviewInner = memo(
	({ className, path, type: itemType }: Props) => {
		const { currentBucket } = useLocation();
		if (!currentBucket || !path || !itemType) return null;

		const itemApiSrc = `/api/bucket/${currentBucket?.raw}${addLeadingSlash(encode(path))}`;

		switch (itemType) {
			case 'image': {
				return (
					<>
						{/* eslint-disable-next-line @next/next/no-img-element */}
						<img
							src={itemApiSrc}
							alt={path}
							className={twMerge(className, 'z-20 h-full w-full object-contain')}
						/>
						{/* eslint-disable-next-line @next/next/no-img-element */}
						<img
							src={itemApiSrc}
							alt={path}
							className={twMerge(className, 'absolute z-10 h-full w-full object-cover blur-[50px]')}
						/>
						<FallbackIcon type={itemType} />
					</>
				);
			}
			case 'video': {
				return (
					<>
						{/* eslint-disable-next-line jsx-a11y/media-has-caption */}
						<video src={itemApiSrc} className="z-20 h-full w-full object-contain" />
						<FallbackIcon type={itemType} />
					</>
				);
			}
			default: {
				return <FallbackIcon type={itemType} />;
			}
		}
	},
	(a, b) => a.path !== b.path && a.type !== b.type && a.className !== b.className,
);

ObjectPreviewInner.displayName = 'ObjectPreviewInner';
