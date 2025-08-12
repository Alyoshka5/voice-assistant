const encoder = new TextEncoder();
const decoder = new TextDecoder();

const keyMaterial = await crypto.subtle.importKey(
    "raw",
    encoder.encode(process.env.ENCRYPTION_KEY!.slice(0, 32)),
    { name: "AES-CBC" },
    false,
    ["encrypt", "decrypt"]
);

export async function encrypt(text: string) {
    const iv = crypto.getRandomValues(new Uint8Array(16));
    const encoded = encoder.encode(text);

    const ciphertext = await crypto.subtle.encrypt(
        { name: "AES-CBC", iv },
        keyMaterial,
        encoded
    );

    return {
        iv: Buffer.from(iv).toString("base64"),
        data: Buffer.from(ciphertext).toString("base64"),
    };
}

export async function decrypt(base64Data: string, base64Iv: string) {
    const iv = Uint8Array.from(Buffer.from(base64Iv, "base64"));
    const data = Uint8Array.from(Buffer.from(base64Data, "base64"));

    const decrypted = await crypto.subtle.decrypt(
        { name: "AES-CBC", iv },
        keyMaterial,
        data
    );

    return decoder.decode(decrypted);
}
