import { memo, useState, useEffect } from 'react';
import heic2any from 'heic2any';

type ImageProps = {
	src: string;
	className: string;
	alt?: string;
	contentType: string;
};

export const Image = memo(
	({ src: src_, className, alt, contentType }: ImageProps) => {
		const [src, setSrc] = useState(src_);

		useEffect(() => {
			const convertHeicToJpeg = async () => {
				heic2any({
					blob: await fetch(src_).then((res) => res.blob()),
					toType: 'image/jpeg',
					quality: 1,
				})
					// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
					.then((res) => setSrc(URL.createObjectURL(Array.isArray(res) ? res[0]! : res)))
					// eslint-disable-next-line no-console
					.catch((err) => console.error(err));
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

Image.displayName = 'Image';
