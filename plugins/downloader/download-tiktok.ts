import { Command } from '../../lib/types';
import { getTiktok } from '../../router/tiktokScraper.js';
import chalk from 'chalk';
import axios from 'axios';

const handler: Command = {
    cmd: ['tiktok', 'tt', 'ttdl'],
    help: ['tiktok <url>'],
    tag: ['downloader'],
    info: 'Mengunduh video atau foto dari TikTok.',
    owner: false,
    run: async (s, { client }) => {
        const url = s.args[0];
        if (!url) {
            return s.reply('Mohon sertakan URL TikTok.');
        }

        const waitingMsg = await s.reply('Memproses permintaan...');

        const startTime = Date.now();
        const response = await getTiktok(url);
        const latency = Date.now() - startTime;

        if (response.status !== 200 || !response.data) {
            const errorText = `❌ *Gagal*\n\n*Pesan:* ${response.message || 'Tidak ada data yang diterima.'}\n*Status Router:* ${response.status}\n*Latency:* ${latency} ms`;
            return client.sock.sendMessage(s.chat, { text: errorText, edit: waitingMsg.key });
        }
        
        const { metadata, download } = response.data;
        const caption = `${metadata.description || 'Downloaded by Molang Bot'}`.trim();

        const successInfo = `✅ *Sukses*\n\n*Status Router:* ${response.status}\n*Latency:* ${latency} ms\n\nMengirim media...`;
        await client.sock.sendMessage(s.chat, { text: successInfo, edit: waitingMsg.key });

        try {
            if (download.video && download.video.length > 0) {
                await client.sock.sendMessage(s.chat, { video: { url: download.video[0] }, caption }, { quoted: s.m });
            } else if (download.photo && download.photo.length > 0) {
                for (let i = 0; i < download.photo.length; i++) {
                    await client.sock.sendMessage(s.chat, { image: { url: download.photo[i] }, caption: i === 0 ? caption : '' }, { quoted: s.m });
                }
            } else {
                await client.sock.sendMessage(s.chat, { text: 'Tidak ada media yang dapat diunduh.', edit: waitingMsg.key });
            }
             await client.sock.sendMessage(s.chat, { delete: waitingMsg.key });
        } catch (e) {
            console.error(chalk.red('[TIKTOK SEND ERROR]'), e);
            s.reply('Gagal mengirim media.');
        }
    }
};

export default handler;