import { Command } from '../../lib/types';
import { getInstagram } from '../../router/igScraper.js';
import chalk from 'chalk';
import { sleep } from '../../lib/myfunc.js';

const handler: Command = {
    cmd: ['ig', 'instagram', 'igdl', 'instagramdl'],
    help: ['ig <url>'],
    tag: ['downloader'],
    info: 'Mengunduh media dari Instagram.',
    owner: false,
    run: async (s, { client }) => {
        const url = s.args[0];
        if (!url) {
            return s.reply('Mohon sertakan URL Instagram.');
        }

        const waitingMsg = await s.reply('Memproses link Instagram...');

        const startTime = Date.now();
        const response = await getInstagram(url);
        const latency = Date.now() - startTime;

        if (response.status !== 200 || !response.data) {
            const errorText = `❌ *Gagal*\n\n*Pesan:* ${response.message || 'Tidak ada data yang diterima.'}\n*Status Router:* ${response.status}\n*Latency:* ${latency} ms`;
            return client.sock.sendMessage(s.chat, { text: errorText, edit: waitingMsg.key });
        }
        
        const successInfo = `✅ *Sukses*\n\n*Status Router:* ${response.status}\n*Latency:* ${latency} ms\n\nMengirim ${response.data.length} media...`;
        await client.sock.sendMessage(s.chat, { text: successInfo, edit: waitingMsg.key });

        for (const item of response.data) {
            try {
                await client.sock.sendMessage(s.chat, { video: { url: item.url }, caption: "Downloaded by Molang Bot" }, { quoted: s.m });
            } catch (videoError) {
                try {
                    await client.sock.sendMessage(s.chat, { image: { url: item.url }, caption: "Downloaded by Molang Bot" }, { quoted: s.m });
                } catch (imageError) {
                    console.error(chalk.red('[IG SEND ERROR]'), imageError);
                    s.reply(`Gagal mengirim media dari: ${item.url}`);
                }
            }
            await sleep(2000);
        }
        await client.sock.sendMessage(s.chat, { delete: waitingMsg.key });
    }
};

export default handler;