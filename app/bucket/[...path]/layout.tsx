import { validateBucketName } from '@/utils/cf';
import { formatBucketName, formatFullPath } from '@/utils';
import { FileExplorerProvider, FilePreviewProvider } from '@/components';
import type { Metadata } from 'next';
import { Ctx } from './ctx';

export type RouteParams = { path: string[] };
type Props = { params: RouteParams; children: React.ReactNode };

export const generateMetadata = ({ params }: { params: RouteParams }): Metadata => ({
	title: formatBucketName(formatFullPath(params.path)[0]),
});

const Layout = ({ params: { path }, children }: Props): JSX.Element => {
	const [bucketName, ...fullPath] = formatFullPath(path);
	validateBucketName(bucketName);

	return (
		<>
			<Ctx bucketName={bucketName} path={fullPath} />

			<FileExplorerProvider>
				<FilePreviewProvider bucketName={bucketName}>{children}</FilePreviewProvider>
			</FileExplorerProvider>
		</>
	);
};

export default Layout;
