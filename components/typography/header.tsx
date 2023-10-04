type Props = {
	cta?: React.ReactNode;
	desc: string;
	title: string;
};

export const Header = ({ cta, desc, title }: Props): JSX.Element => (
	<div className="my-1 flex flex-col">
		<div className="flex flex-row items-center justify-between">
			<span className="text-lg font-bold">{title}</span>
			{cta}
		</div>

		<p className="text-sm">{desc}</p>
	</div>
);

export type { Props as HeaderProps };
