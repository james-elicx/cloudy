'use client';

import { encode } from '@/utils/encoding';
import React, {
	createContext,
	memo,
	useCallback,
	useContext,
	useEffect,
	useMemo,
	useRef,
	useState,
} from 'react';

export const UsersContext = createContext<Map<string, string>>(new Map());

export const UsersProvider = ({
	children,
	users,
}: React.PropsWithChildren<{ users: Map<string, string> }>) => {
	// eslint-disable-next-line react-hooks/exhaustive-deps
	const value = useMemo(() => users, []);

	return <UsersContext.Provider value={value}>{children}</UsersContext.Provider>;
};

type PostInfo = { uid: string; pid: string };

type TikTokContextValue = {
	setPost: (post: PostInfo) => void;
	onNewPost: (cb: (post: PostInfo) => void) => void;
};

const TikTokContext = createContext<TikTokContextValue>({
	onNewPost: () => null,
	setPost: () => null,
});

export const TikTokProvider = ({ children }: React.PropsWithChildren) => {
	const listeners = useRef<Set<(post: PostInfo) => void>>(new Set());

	const onNewPost: TikTokContextValue['onNewPost'] = useCallback(
		(cb) => listeners.current.add(cb),
		[],
	);

	const value = useMemo(
		(): TikTokContextValue => ({
			onNewPost,
			setPost: ({ pid, uid }) => listeners.current.forEach((listener) => listener({ uid, pid })),
		}),
		[onNewPost],
	);

	return <TikTokContext.Provider value={value}>{children}</TikTokContext.Provider>;
};

type PostSelectorProps = { pid: string; uid: string; username: string };

export const PostSelector = memo(({ pid, uid, username }: PostSelectorProps) => {
	const { setPost } = useContext(TikTokContext);

	return (
		<label htmlFor={pid}>
			<input id={pid} type="radio" onChange={() => setPost({ uid, pid })} name="post-selector" />
			{username} - {pid}
		</label>
	);
});

PostSelector.displayName = 'PostsSelector';

export const PostDisplay = memo(() => {
	const { onNewPost } = useContext(TikTokContext);

	const abortController = useRef<AbortController>(new AbortController());

	const [data, setData] = useState<R2Object | null>(null);
	const [isLoading, setIsLoading] = useState<boolean>(false);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		abortController.current = new AbortController();
		const controller = abortController.current;

		const fetchObject = (post: PostInfo) => {
			setData(null);
			setError(null);
			setIsLoading(true);

			fetch(`/api/bucket/SCRAPER/${encode(`tiktok/posts/${post.uid}/${post.pid}.mp4`)}`, {
				method: 'POST',
				signal: abortController.current.signal,
			})
				.then((resp) => {
					if (!resp.ok) {
						throw new Error(resp.statusText);
					} else {
						return resp.json<R2Object>();
					}
				})
				.then((obj) => {
					if (!obj) {
						throw new Error('Object Not Found');
					} else {
						setData(obj);
					}
				})
				.catch((err) => {
					// eslint-disable-next-line no-console
					console.error(err);
					setError(err.message);
				})
				.finally(() => setIsLoading(false));
		};

		onNewPost(fetchObject);

		return () => controller.abort();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	return (
		<div className="fixed right-0 top-0 h-screen w-[45vw] bg-background">
			{isLoading && <p>Loading...</p>}
			{error && <p className="text-status-error">{error}</p>}

			{data?.httpMetadata?.contentType?.startsWith('video') && (
				// eslint-disable-next-line jsx-a11y/media-has-caption
				<video
					src={`/api/bucket/SCRAPER/${encode(data.key)}`}
					autoPlay
					controls
					loop
					className="h-full w-auto"
				/>
			)}
		</div>
	);
});

PostDisplay.displayName = 'PostDisplay';
