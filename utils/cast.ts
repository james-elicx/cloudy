export type AccessControlKind = 'r2';

const forwards: { [key in AccessControlKind]: number } = { r2: 1 };
const backwards: { [key: number]: AccessControlKind } = { 1: 'r2' };

export const castKindToInt = (kind: AccessControlKind): number => forwards[kind];
export const castIntToKind = (kind: number): AccessControlKind =>
	backwards[kind] as AccessControlKind;

export const castBoolToInt = (val: boolean) => (val ? 1 : 0);
export const castIntToBool = (val: number) => val === 1;
