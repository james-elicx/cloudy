export const encode = (v: string) => btoa(encodeURIComponent(v));

export const decode = (v: string) => atob(decodeURIComponent(v));
