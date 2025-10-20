import { Command } from '../../lib/types';
import { generateQrFromText } from '../../router/qrGeneratorScraper.js';
import chalk from 'chalk';

const handler: Command = {
    cmd: ['makeqr', 'text2qr'],
    help: ['makeqr <teks>'],
    tag: ['tools'],
    info: 'Membuat gambar QR code dari teks.',
    owner: false,
    run: async (s, { client }) => {
        const text = s.text.substring(s.text.indexOf(' ') + 1);

        if (s.text.toLowerCase() === '.makeqr' || s.text.toLowerCase() === '.text2qr' || !text) {
            return s.reply('Mohon sertakan teks yang ingin dijadikan QR code.\n\n*Contoh:*\n.makeqr Halo, ini Molang Bot!');
        }

        const waitingMsg = await s.reply('Membuat QR code...');

        const startTime = Date.now();
        const response = await generateQrFromText(text);
        const latency = Date.now() - startTime;

        if (response.status !== 200 || !response.data) {
            const errorText = `❌ *Gagal*\n\n*Pesan:* ${response.message || 'Gagal membuat gambar.'}\n*Status Router:* ${response.status}\n*Latency:* ${latency} ms`;
            return client.sock.sendMessage(s.chat, { text: errorText, edit: waitingMsg.key });
        }

        const caption = `✅ *QR Code Berhasil Dibuat*\n\n*Status Router:* ${response.status}\n*Latency:* ${latency} ms`;
        
        await client.sock.sendMessage(s.chat, { 
            image: response.data, 
            caption: caption 
        }, { quoted: s.m });

        await client.sock.sendMessage(s.chat, { delete: waitingMsg.key });
    }
};

export default handler;
