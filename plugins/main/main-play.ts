import { Command } from '../../lib/types';
import { getYoutubeAudio } from '../../apiBetaBotz/youtubePlay.js';
import chalk from 'chalk';
import axios from 'axios';

const handler: Command = {
    cmd: ['play', 'song'],
    help: ['play <judul lagu>'],
    tag: ['main'],
    info: 'Memutar dan mengunduh lagu dari YouTube.',
    owner: false,
    run: async (s, { client }) => {
        const query = s.args.join(' ');
        if (!query) {
            return s.reply('Mohon sertakan judul lagu atau link YouTube.\n\n*Contoh:*\n.play laskar pelangi');
        }

        const waitingMsg = await s.reply(`Mencari lagu "${query}"...`);

        const startTime = Date.now();
        const response = await getYoutubeAudio(query);
        const latency = Date.now() - startTime;

        if (response.status !== 200 || !response.data) {
            const errorText = `❌ *Gagal*\n\n*Pesan:* ${response.message || 'Tidak ada data yang diterima.'}\n*Status Router:* ${response.status}\n*Latency:* ${latency} ms`;
            return client.sock.sendMessage(s.chat, { text: errorText, edit: waitingMsg.key });
        }

        const { title, author, views, timestamp, thumbnail, downloadUrl, url } = response.data;

        try {
            const infoText = `*Judul:* ${title}\n*Channel:* ${author}\n*Durasi:* ${timestamp}\n*Penonton:* ${views}\n\nMengunduh audio...`;
            await client.sock.sendMessage(s.chat, { text: infoText, edit: waitingMsg.key });

            const [audioBuffer, thumbnailBuffer] = await Promise.all([
                axios.get(downloadUrl, { responseType: 'arraybuffer' }),
                axios.get(thumbnail, { responseType: 'arraybuffer' })
            ]);

            if (!audioBuffer.data || !thumbnailBuffer.data) {
                throw new Error('Gagal mengunduh file audio atau thumbnail.');
            }

            await client.sock.sendMessage(s.chat, {
                audio: audioBuffer.data,
                mimetype: 'audio/mpeg',
                ptt: true,
                contextInfo: {
                    externalAdReply: {
                        title: title,
                        body: `Channel: ${author} | Durasi: ${timestamp}`,
                        thumbnail: thumbnailBuffer.data,
                        mediaType: 1,
                        sourceUrl: url,
                        mediaUrl: url
                    }
                }
            }, { quoted: s.m });
            
            await client.sock.sendMessage(s.chat, { delete: waitingMsg.key });

        } catch (downloadError: any) {
            console.error(chalk.red('[PLAY DOWNLOAD ERROR]'), downloadError);
            const errorText = `❌ *Gagal Mengunduh File*\n\n*Pesan:* ${downloadError.message}`;
            await client.sock.sendMessage(s.chat, { text: errorText, edit: waitingMsg.key });
        }
    }
};

export default handler;