import { Command } from '../../lib/types';
import { getMediafire } from '../../router/mediafireScraper.js';
import chalk from 'chalk';
import axios from 'axios';

const handler: Command = {
    cmd: ['mediafire', 'mf'],
    help: ['mediafire <url>'],
    tag: ['downloader'],
    info: 'Mengunduh file dari MediaFire.',
    owner: false,
    run: async (s, { client }) => {
        const url = s.args[0];
        if (!url) {
            return s.reply('Mohon sertakan URL MediaFire.');
        }

        const waitingMsg = await s.reply('Memproses link MediaFire... Ini mungkin memakan waktu lebih lama.');

        const startTime = Date.now();
        const response = await getMediafire(url);
        const latency = Date.now() - startTime;

        if (response.status !== 200 || !response.data) {
            const errorText = `❌ *Gagal*\n\n*Pesan:* ${response.message || 'Tidak ada data yang diterima.'}\n*Status Router:* ${response.status}\n*Latency:* ${latency} ms`;
            return client.sock.sendMessage(s.chat, { text: errorText, edit: waitingMsg.key });
        }

        const { fileName, fileSize, downloadLink } = response.data;

        if (!downloadLink) {
            const errorText = `❌ *Gagal*\n\n*Pesan:* Tidak dapat menemukan link unduhan langsung.\n*Status Router:* ${response.status}\n*Latency:* ${latency} ms`;
            return client.sock.sendMessage(s.chat, { text: errorText, edit: waitingMsg.key });
        }

        try {
            await client.sock.sendMessage(s.chat, { 
                text: `✅ *File Ditemukan*\n\n*Nama:* ${fileName}\n*Ukuran:* ${fileSize}\n\nMengunduh file...`, 
                edit: waitingMsg.key 
            });

            const fileBufferResponse = await axios.get(downloadLink, {
                responseType: 'arraybuffer'
            });

            if (!fileBufferResponse.data) {
                throw new Error('Gagal mengunduh file dari MediaFire.');
            }

            const caption = `✅ *MediaFire Download Berhasil*\n\n*Nama File:* ${fileName}\n*Ukuran:* ${fileSize}`;
            
            await client.sock.sendMessage(s.chat, {
                document: fileBufferResponse.data,
                mimetype: fileBufferResponse.headers['content-type'] || 'application/octet-stream',
                fileName: fileName,
                caption: caption
            }, { quoted: s.m });

            await client.sock.sendMessage(s.chat, { delete: waitingMsg.key });

        } catch (downloadError: any) {
            console.error(chalk.red('[MEDIAFIRE DOWNLOAD ERROR]'), downloadError);
            const errorText = `❌ *Gagal Mengunduh File*\n\n*Pesan:* ${downloadError.message}`;
            await client.sock.sendMessage(s.chat, { text: errorText, edit: waitingMsg.key });
        }
    }
};

export default handler;
