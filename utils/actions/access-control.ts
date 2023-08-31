'use server';

import 'server-only';

import { z } from 'zod';
import { actionWithSession } from './_action';
import { q } from '../db';

export const updateVisibility = actionWithSession(
	z.object({
		id: z.number().optional(),
		kind: z.enum(['r2']),
		key: z.string(),
		glob: z.string(),
		public: z.boolean(),
		readOnly: z.boolean(),
	}),
	async ({ id, ...input }, ctx) => {
		if (!ctx.user?.admin) throw new Error('Unauthorized');

		const resp = await q.updateVisibilityRecord(id, input);

		if (!resp?.id) throw new Error('Failed to update record');

		return resp;
	},
);
