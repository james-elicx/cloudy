import { addLeadingSlash } from '@/utils';
import type { FileType } from '@/utils';
import { memo, useEffect, useState } from 'react';
import { twMerge } from 'tailwind-merge';
import { encode } from '@/utils/encoding';
import { useLocation } from '../providers';
import { getFileIcon } from './file-icons';
import heic2any from 'heic2any';

type Props = {
	className?: string;
	path: string;
	type: FileType;
	contentType: string;
};

const FallbackIcon = ({ type: itemType }: Pick<Props, 'type'>) => {
	const Icon = getFileIcon(itemType);
	return <Icon size={40} className="absolute z-0" />;
};

export const ObjectPreviewInner = memo(
	({ className, path, type: itemType, contentType }: Props) => {
		const { currentBucket } = useLocation();
		if (!currentBucket || !path || !itemType) return null;

		const itemApiSrc = `/api/bucket/${currentBucket?.raw}${addLeadingSlash(encode(path))}`;

		switch (itemType) {
			case 'image': {
				return (
					<>
						<ImagePreviewInner
							contentType={contentType}
							src={itemApiSrc}
							alt={path}
							className={twMerge(className, 'z-20 h-full w-full object-contain')}
						/>
						<ImagePreviewInner
							contentType={contentType}
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

type ImagePreviewInnerProps = {
	src: string;
	className: string;
	alt?: string;
	contentType: string;
};

export const ImagePreviewInner = memo(
	({ src: src_, className, alt, contentType }: ImagePreviewInnerProps) => {
		const [src, setSrc] = useState(src_);

		useEffect(() => {
			const convertHeicToJpeg = async () => {
				heic2any({
					blob: await fetch(src_).then((res) => res.blob()),
					toType: 'image/jpeg',
					quality: 1,
				})
					.then((res) => setSrc(URL.createObjectURL(Array.isArray(res) ? res[0] : res)))
					.catch((err) => {
						console.error(err);
						alert('Failed to convert HEIC image');
					});
			};

			if (contentType === 'image/heif') {
				convertHeicToJpeg();
			}
		}, [src_, contentType]);

		// eslint-disable-next-line @next/next/no-img-element
		return <img src={src} alt={alt} className={className} />;
	},
	(a, b) =>
		a.src !== b.src &&
		a.className !== b.className &&
		a.alt !== b.alt &&
		a.contentType !== b.contentType,
);

ImagePreviewInner.displayName = 'ImagePreviewInner';
