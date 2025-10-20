import { Command } from '../../lib/types';
import { getVidey } from '../../apiBetaBotz/videy.js';
import chalk from 'chalk';
import axios from 'axios';

const handler: Command = {
    cmd: ['videy', 'videydl'],
    help: ['videy <url>'],
    tag: ['downloader'],
    info: 'Mengunduh video dari Videy.co.',
    owner: false,
    run: async (s, { client }) => {
        const url = s.args[0];
        if (!url) {
            return s.reply('Mohon sertakan URL Videy.\n\n*Contoh:*\n.videy https://videy.co/v?id=xxx');
        }

        const waitingMsg = await s.reply('Memproses link Videy...');

        const startTime = Date.now();
        const response = await getVidey(url);
        const latency = Date.now() - startTime;

        if (response.status !== 200 || !response.data) {
            const errorText = `❌ *Gagal*\n\n*Pesan:* ${response.message || 'Tidak ada data yang diterima.'}\n*Status Router:* ${response.status}\n*Latency:* ${latency} ms`;
            return client.sock.sendMessage(s.chat, { text: errorText, edit: waitingMsg.key });
        }

        const { videoUrl } = response.data;

        try {
            await client.sock.sendMessage(s.chat, { 
                text: `✅ Link ditemukan, mengunduh video...`, 
                edit: waitingMsg.key 
            });

            const videoBuffer = await axios.get(videoUrl, {
                responseType: 'arraybuffer'
            });

            if (!videoBuffer.data) {
                throw new Error('Gagal mengunduh file video.');
            }

            const caption = `✅ *DONE*\n\n*Status Router:* ${response.status}\n*Latency:* ${latency} ms`;
            
            await client.sock.sendMessage(s.chat, {
                video: videoBuffer.data,
                mimetype: 'video/mp4',
                caption: caption
            }, { quoted: s.m });

            await client.sock.sendMessage(s.chat, { delete: waitingMsg.key });

        } catch (downloadError: any) {
            console.error(chalk.red('[VIDEY DOWNLOAD ERROR]'), downloadError);
            const errorText = `❌ *Gagal Mengunduh File*\n\n*Pesan:* ${downloadError.message}`;
            await client.sock.sendMessage(s.chat, { text: errorText, edit: waitingMsg.key });
        }
    }
};

export default handler;