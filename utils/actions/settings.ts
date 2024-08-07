'use server';

import 'server-only';

import { z } from 'zod';
import { actionWithSession } from './_action';
import { q } from '../db';

export const updateCacheHeader = actionWithSession
	.schema(z.object({ cacheHeader: z.string() }))
	.action(async ({ parsedInput: { cacheHeader }, ctx }) => {
		if (!ctx.user?.admin) throw new Error('Unauthorized');

		const resp = await q.updateSettingsRecord('general', 'cache-header', cacheHeader, ctx.user.id);

		if (!resp) throw new Error('Failed to update record');

		return resp;
	});
