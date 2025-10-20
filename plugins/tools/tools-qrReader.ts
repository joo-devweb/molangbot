import { Command } from '../../lib/types';
import { getTextFromQr } from '../../router/qrReaderScraper.js';
import { downloadMediaMessage } from '@whiskeysockets/baileys';
import chalk from 'chalk';

const handler: Command = {
    cmd: ['qr', 'readqr'],
    help: ['qr (reply/kirim gambar)'],
    tag: ['tools'],
    info: 'Membaca teks dari gambar QR code.',
    owner: false,
    run: async (s, { client }) => {
        const msg = s.quoted || s.m;
        const msgType = s.quoted ? Object.keys(msg.message!)[0] : s.mtype;

        if (msgType !== 'imageMessage') {
            return s.reply('Mohon kirim atau balas sebuah gambar yang berisi QR code.');
        }

        const waitingMsg = await s.reply('Membaca QR code...');
        
        try {
            const buffer = await downloadMediaMessage(msg, 'buffer', {}) as Buffer;
            
            const startTime = Date.now();
            const response = await getTextFromQr(buffer);
            const latency = Date.now() - startTime;

            if (response.status !== 200 || !response.data) {
                const errorText = `❌ *Gagal*\n\n*Pesan:* ${response.message || 'Tidak ada data yang diterima.'}\n*Status Router:* ${response.status}\n*Latency:* ${latency} ms`;
                return client.sock.sendMessage(s.chat, { text: errorText, edit: waitingMsg.key });
            }

            const successText = `✅ *Hasil QR Code:*\n${response.data}\n\n*Status Router:* ${response.status}\n*Latency:* ${latency} ms`;
            await client.sock.sendMessage(s.chat, { text: successText, edit: waitingMsg.key });

        } catch (error: any) {
            console.error(chalk.red('[QR READER ERROR]'), error);
            await client.sock.sendMessage(s.chat, { text: `Terjadi kesalahan tak terduga: ${error.message}`, edit: waitingMsg.key });
        }
    }
};

export default handler;