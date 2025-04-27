import sqlite3 from 'better-sqlite3';
import { resolve } from 'path';
import { PostDisplay, PostSelector, TikTokProvider, UsersContext, UsersProvider } from './client';

console.log(resolve(__dirname, '../../../../../../tiktok-scraper/data/db.sqlite3'));

const getDb = () =>
	sqlite3(resolve(__dirname, '../../../../../../tiktok-scraper/data/db.sqlite3'), {
		readonly: true,
		fileMustExist: true,
	});

type Props = { params: { name: string } };

type User = { unique_name: string; user_id: string };
type Post = { post_id: string; user_id: string };

const shuffle = (arr: unknown[]) => {
	let currentIndex = arr.length;

	// While there remain elements to shuffle...
	while (currentIndex !== 0) {
		// Pick a remaining element...
		const randomIndex = Math.floor(Math.random() * currentIndex);
		currentIndex--;

		// eslint-disable-next-line no-param-reassign, @typescript-eslint/no-non-null-assertion
		[arr[currentIndex], arr[randomIndex]] = [arr[randomIndex]!, arr[currentIndex]!];
	}
};

const Page = async ({ params: { name } }: Props) => {
	const db = getDb();
	const users = db
		.prepare(`SELECT unique_name, user_id FROM users WHERE unique_name LIKE ?`)
		.all(`%${name}%`) as User[];
	// eslint-disable-next-line react/jsx-no-constructed-context-values
	const userIdMap = new Map<string, string>(users.map((user) => [user.user_id, user.unique_name]));

	// const posts = users.flatMap((user, idx) => {
	// 	const userPosts = db
	// 		.prepare(`SELECT post_id FROM posts WHERE downloaded = 1 AND user_id = ?`)
	// 		.get(user.user_id) as Post[];
	// 	console.log('posts', idx, userPosts.length);
	// 	return userPosts;
	// });

	const posts = db
		.prepare(
			`SELECT post_id, user_id FROM posts WHERE downloaded = 1 AND user_id IN (${users
				.map((user) => user.user_id)
				.join(', ')})`,
		)
		.all() as Post[];

	shuffle(posts);

	return (
		<UsersProvider users={userIdMap}>
			<TikTokProvider>
				<div className="flex flex-row">
					<fieldset className="flex flex-col">
						{posts.map((post) => (
							<PostSelector
								key={post.post_id}
								pid={post.post_id}
								uid={post.user_id}
								//  eslint-disable-next-line @typescript-eslint/no-non-null-assertion
								username={userIdMap.get(post.user_id)!}
							/>
						))}
					</fieldset>

					<PostDisplay />
				</div>
			</TikTokProvider>
		</UsersProvider>
	);
};

export default Page;
