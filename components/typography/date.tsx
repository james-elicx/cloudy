'use client';

import { useState } from 'react';

type Props = React.HTMLAttributes<HTMLSpanElement> & { date: Date };

export const IntlDate = ({ date, ...rest }: Props) => {
	const [rtf] = useState(
		() =>
			new Intl.DateTimeFormat(typeof window !== 'object' ? 'en' : window.navigator.language, {
				day: '2-digit',
				month: 'short',
				year: 'numeric',
			}),
	);

	return (
		<span {...rest} suppressHydrationWarning>
			{rtf.format(date)}
		</span>
	);
};
