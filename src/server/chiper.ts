import { Data, deflate, inflate } from "pako";

export const encrypt = (data: Data | string) => deflate(data);
export const decrypt = (compressed: Data) =>
    inflate(compressed, { to: "string" });
