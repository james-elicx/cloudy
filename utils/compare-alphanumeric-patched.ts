/**
 * This is a patched version of the @tanstack/react-table `compareAlphanumeric` function.
 *
 * https://github.com/TanStack/table/blob/main/packages/table-core/src/sortingFns.ts
 *
 * It it modified to ensure that numbers are always sorted before strings.
 */

import type { SortingFn } from '@tanstack/react-table';
import { reSplitAlphaNumeric } from '@tanstack/react-table';

// Mixed sorting is slow, but very inclusive of many edge cases.
// It handles numbers, mixed alphanumeric combinations, and even
// null, undefined, and Infinity
function compareAlphanumeric(aStr: string, bStr: string) {
	// Split on number groups, but keep the delimiter
	// Then remove falsey split values
	const a = aStr.split(reSplitAlphaNumeric).filter(Boolean);
	const b = bStr.split(reSplitAlphaNumeric).filter(Boolean);

	// While
	while (a.length && b.length) {
		const aa = a.shift() as string;
		const bb = b.shift() as string;

		const an = parseInt(aa, 10);
		const bn = parseInt(bb, 10);

		const combo = [an, bn].sort();

		// Both are string
		if (Number.isNaN(combo[0])) {
			if (aa > bb) {
				return 1;
			}
			if (bb > aa) {
				return -1;
			}
			continue;
		}

		// One is a string, one is a number
		if (Number.isNaN(combo[1])) {
			return Number.isNaN(an) ? 1 : -1; // NOTE: This is the main change from the original.
		}

		// Both are numbers
		if (an > bn) {
			return 1;
		}
		if (bn > an) {
			return -1;
		}
	}

	return a.length - b.length;
}

function toString(a: unknown) {
	if (typeof a === 'number') {
		if (Number.isNaN(a) || a === Infinity || a === -Infinity) {
			return '';
		}
		return String(a);
	}
	if (typeof a === 'string') {
		return a;
	}
	return '';
}

export const alphanumeric: SortingFn<unknown> = (rowA, rowB, columnId) =>
	compareAlphanumeric(
		toString(rowA.getValue(columnId)).toLowerCase(),
		toString(rowB.getValue(columnId)).toLowerCase(),
	);
