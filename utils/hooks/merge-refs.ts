/**
 * Merges multiple refs into a single ref callback.
 *
 * @param refs Refs to merge.
 * @returns Merged ref callback.
 */
export const mergeRefs =
	<T = unknown>(refs: Ref<T>[]): React.RefCallback<T> =>
	(value) => {
		refs.forEach((ref) => {
			if (typeof ref === 'function') {
				ref(value);
			} else if (ref != null) {
				// eslint-disable-next-line no-param-reassign
				(ref as React.MutableRefObject<T | null>).current = value;
			}
		});
	};

type Ref<T> = React.MutableRefObject<T> | React.LegacyRef<T>;
