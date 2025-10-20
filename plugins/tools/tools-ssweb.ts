import { Command } from '../../lib/types';
import { getScreenshot } from '../../apiBetaBotz/ssweb.js';

const handler: Command = {
    cmd: ['ssweb', 'ss'],
    help: ['ssweb <url> [mobile]'],
    tag: ['tools'],
    info: 'Mengambil screenshot dari halaman web.',
    owner: false,
    run: async (s, { client }) => {
        const url = s.args[0];
        if (!url) {
            return s.reply('Mohon sertakan URL halaman web.\n\n*Contoh:*\n.ssweb google.com\n.ssweb google.com mobile');
        }

        const device = s.args.includes('mobile') ? 'mobile' : 'desktop';
        const waitingMsg = await s.reply(`Mengambil screenshot [${device}]...`);

        const startTime = Date.now();
        const response = await getScreenshot(url, device);
        const latency = Date.now() - startTime;

        if (response.status !== 200 || !response.data) {
            const errorText = `❌ *Gagal*\n\n*Pesan:* ${response.message || 'Gagal membuat gambar.'}`;
            return client.sock.sendMessage(s.chat, { text: errorText, edit: waitingMsg.key });
        }
        
        const caption = `✅ *Screenshot Berhasil*\n\n*URL:* ${url}\n*Device:* ${device}`;
        
        await client.sock.sendMessage(s.chat, { 
            image: response.data, 
            caption: caption 
        }, { quoted: s.m });

        await client.sock.sendMessage(s.chat, { delete: waitingMsg.key });
    }
};

export default handler;