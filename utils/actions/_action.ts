import { createSafeActionClient } from 'next-safe-action';
import { getUser } from '../auth';

export const actionWithSession = createSafeActionClient({
	buildContext: async () => {
		const user = await getUser();

		return { user };
	},
});
