// รับเฉพาะ path ภายในเว็บ กัน open redirect เช่น ?next=https://evil.com หรือ //evil.com
export const safeNext = (value: string | undefined) => value && value.startsWith("/") && !value.startsWith("//") ? value : "/spaces";
