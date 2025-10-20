import { Command } from '../../lib/types';
import { fetchUrl } from '../../router/fetchScraper.js';
import chalk from 'chalk';
import axios from 'axios';

const handler: Command = {
    cmd: ['fetch', 'get'],
    help: ['fetch <url>'],
    tag: ['internet'],
    info: 'Mengambil konten dari URL (teks, json, atau file).',
    owner: false,
    run: async (s, { client }) => {
        const url = s.args[0];
        if (!url || !url.match(/^https?:\/\//)) {
            return s.reply('Mohon sertakan URL yang valid (diawali dengan http:// atau https://).');
        }

        const waitingMsg = await s.reply(`Memeriksa URL: ${url}...`);

        const startTime = Date.now();
        const response = await fetchUrl(url);
        const latency = Date.now() - startTime;

        if (response.status !== 200 || !response.data) {
            const errorText = `❌ *Gagal*\n\n*Pesan:* ${response.message || 'Tidak ada data yang diterima.'}\n*Status Router:* ${response.status}\n*Latency:* ${latency} ms`;
            return client.sock.sendMessage(s.chat, { text: errorText, edit: waitingMsg.key });
        }

        const { type, content, size, mediaKey } = response.data;

        try {
            switch (type) {
                case 'json':
                    await client.sock.sendMessage(s.chat, { 
                        text: JSON.stringify(content, null, 2), 
                        edit: waitingMsg.key 
                    });
                    break;
                case 'text':
                    await client.sock.sendMessage(s.chat, { 
                        text: content, 
                        edit: waitingMsg.key 
                    });
                    break;
                case 'file':
                    await client.sock.sendMessage(s.chat, { 
                        text: `✅ *Konten Terdeteksi*\n\n*Tipe:* File (${mediaKey})\n*Ukuran:* ${size}\n\nMengirim file...`,
                        edit: waitingMsg.key 
                    });
                    await client.sock.sendMessage(s.chat, {
                        [mediaKey]: { url: content },
                        mimetype: (await axios.head(content)).headers['content-type']
                    }, { quoted: s.m });
                    await client.sock.sendMessage(s.chat, { delete: waitingMsg.key });
                    break;
            }
        } catch (e: any) {
            console.error(chalk.red('[FETCH ERROR]'), e);
            await client.sock.sendMessage(s.chat, { text: `Terjadi kesalahan saat mengirim konten: ${e.message}`, edit: waitingMsg.key });
        }
    }
};

export default handler;