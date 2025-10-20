import { Command } from '../../lib/types';
import { askAI } from '../../router/aiGptScraper.js';
import chalk from 'chalk';

const handler: Command = {
    cmd: ['ai', 'ask', 'gpt'],
    help: ['gpt <pertanyaan>'],
    tag: ['ai'],
    info: 'Berinteraksi dengan model AI GPT-3.',
    owner: false,
    run: async (s, { client }) => {
        const query = s.text.substring(s.text.indexOf(' ') + 1);

        if (s.text.toLowerCase() === '.ai' || s.text.toLowerCase() === '.ask' || s.text.toLowerCase() === '.gpt' || !query) {
            return s.reply('Mohon sertakan pertanyaan Anda.\n\n*Contoh:*\n.gpt apa itu coding?');
        }

        const waitingMsg = await s.reply('gpt sedang berpikir...');

        const startTime = Date.now();
        const response = await askAI(query);
        const latency = Date.now() - startTime;

        if (response.status !== 200 || !response.data) {
            const errorText = `❌ *Gagal*\n\n*Pesan:* ${response.message || 'Tidak ada data yang diterima.'}\n*Status Router:* ${response.status}\n*Latency:* ${latency} ms`;
            return client.sock.sendMessage(s.chat, { text: errorText, edit: waitingMsg.key });
        }

        const successText = `${response.data}\n\n*Status Router:* ${response.status}\n*Latency:* ${latency} ms`;
        await client.sock.sendMessage(s.chat, { text: successText, edit: waitingMsg.key });
    }
};

export default handler;