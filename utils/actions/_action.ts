import { createSafeActionClient } from 'next-safe-action';
import { getUser } from '../auth';

export const actionClient = createSafeActionClient();

export const actionWithSession = actionClient.use(async ({ next }) => {
	const user = await getUser();

	return next({ ctx: { user } });
});
