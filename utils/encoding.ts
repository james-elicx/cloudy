export const encode = (v: string) => btoa(encodeURIComponent(v));

export const decode = (v: string) => decodeURIComponent(atob(v));
