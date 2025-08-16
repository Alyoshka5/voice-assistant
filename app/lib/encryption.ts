const encoder = new TextEncoder();
const decoder = new TextDecoder();

let keyMaterial: CryptoKey | null = null;

async function getKeyMaterial(){
	if (!keyMaterial) {
		keyMaterial = await crypto.subtle.importKey(
			"raw",
			encoder.encode(process.env.ENCRYPTION_KEY!.slice(0, 32)),
			{ name: "AES-CBC" },
			false,
			["encrypt", "decrypt"]
		);
	}

	return keyMaterial;
}

export async function encrypt(text: string) {
	let key = await getKeyMaterial();
    const iv = crypto.getRandomValues(new Uint8Array(16));
    const encoded = encoder.encode(text);

    const ciphertext = await crypto.subtle.encrypt(
        { name: "AES-CBC", iv },
        key,
        encoded
    );

    return {
        iv: Buffer.from(iv).toString("base64"),
        data: Buffer.from(ciphertext).toString("base64"),
    };
}

export async function decrypt(base64Data: string, base64Iv: string) {
	let key = await getKeyMaterial();
    const iv = Uint8Array.from(Buffer.from(base64Iv, "base64"));
    const data = Uint8Array.from(Buffer.from(base64Data, "base64"));

    const decrypted = await crypto.subtle.decrypt(
        { name: "AES-CBC", iv },
        key,
        data
    );

    return decoder.decode(decrypted);
}
