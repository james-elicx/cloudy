const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB'];

/**
 * Converts raw bytes to a pretty string representation.
 *
 * @param bytes Raw bytes to convert to string.
 * @returns String representation of bytes.
 */
export const bytesToString = (bytes: number) => {
	if (bytes === 0) return `0 ${sizes[0]}`;

	const i = Math.floor(Math.log(bytes) / Math.log(1024));
	const size = (bytes / (1024 ** i || 1)).toFixed(2);

	return `${size.replace(/\.00?$/, '')} ${sizes[i]}`;
};
