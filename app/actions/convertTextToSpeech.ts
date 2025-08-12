'use server'

import textToSpeech from '@google-cloud/text-to-speech';
import { Buffer } from 'buffer';

const client = new textToSpeech.TextToSpeechClient({
    credentials: {
        client_email: process.env.GCP_CLIENT_EMAIL,
        private_key: process.env.GCP_PRIVATE_KEY
    }
});

export default async function convertToSpeech(text: string) {
    const request = {
        input: {text: text},
        voice: {languageCode: 'en-US', name: 'en-US-Chirp3-HD-Alnilam'},
        audioConfig: {
            audioEncoding: "MP3" as "MP3",
            model: "chirp",
            speakingRate: 1.0
        },
    };

    const [response] = await client.synthesizeSpeech(request);

    if (response.audioContent) {
        return Buffer.from(response.audioContent).toString('base64');
    }
}
