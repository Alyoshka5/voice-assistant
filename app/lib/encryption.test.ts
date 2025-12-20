import { beforeEach } from 'vitest';
import { encrypt, decrypt } from './encryption';

describe('encryption', () => {
    beforeEach(() => {
        vi.stubEnv('ENCRYPTION_KEY', 'abcdefghijklmnopqrstuvwxyz012345');
    });

    it('encrypts and decrypts a string to its orginal value', async () => {
        let encryptionString = 'secret string';

        const { iv, data } = await encrypt(encryptionString);
        const decodedString = await decrypt(data, iv);

        expect(decodedString).toBe(encryptionString);
    })

    it('generates two different iv and data values for the same string on each call to encrypt', async () => {
        let encryptionString = 'secret string';

        const encryptionResult1 = await encrypt(encryptionString);
        const encryptionResult2 = await encrypt(encryptionString);

        expect(encryptionResult1.data).not.toBe(encryptionResult2.data);
        expect(encryptionResult1.iv).not.toBe(encryptionResult2.iv);
    })
})