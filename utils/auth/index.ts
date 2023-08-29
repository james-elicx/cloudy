import NextAuth from 'next-auth';
import GitHub from 'next-auth/providers/github';

const { handlers: nextAuthHandlers, auth } = NextAuth({
	useSecureCookies: process.env.NODE_ENV === 'production',
	providers: [GitHub],
});
export { auth };

export const isAuthAvailable = () => !!process.env.AUTH_SECRET;

export const { GET, POST }: typeof nextAuthHandlers = {
	GET: async (req) =>
		isAuthAvailable() ? nextAuthHandlers.GET(req) : new Response('Not found', { status: 404 }),
	POST: async (req) =>
		isAuthAvailable() ? nextAuthHandlers.POST(req) : new Response('Not found', { status: 404 }),
};

export const getUser = async () => {
	try {
		if (!isAuthAvailable()) {
			throw new Error('Auth is not available');
		}

		const session = await auth();

		if (!session.user) {
			throw new Error('User not found');
		}

		return session.user;
	} catch (e) {
		return undefined;
	}
};
