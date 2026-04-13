export const hashPassword = async (plain: string) => {
    const hashed = await crypto.subtle.digest(
        "SHA-256",
        new TextEncoder().encode(plain),
    );

    return Array.from(new Uint8Array(hashed))
        .map((b) => b.toString(16).padStart(2, "0"))
        .join("");
};