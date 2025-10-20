import { Command } from '../../lib/types';
import { upscaleImageV1, upscaleImageV2, upscaleImageV3, removeBackground, ScraperResponse } from '../../apiBetaBotz/imageTools.js';
import { downloadMediaMessage } from '@whiskeysockets/baileys';
import { uploadImage } from '../../lib/myfunc.js';
import chalk from 'chalk';

const handler: Command = {
    cmd: ['hd', 'hd2', 'hd3', 'removebg', 'nobg'],
    help: ['hd (reply/kirim gambar)', 'hd2 (reply/kirim gambar)', 'hd3 (reply/kirim gambar)', 'removebg (reply/kirim gambar)'],
    tag: ['tools'],
    info: 'Meningkatkan kualitas atau menghapus background gambar.',
    owner: false,
    run: async (s, { client }) => {
        const command = s.text.slice(client.prefix.length).split(' ')[0].toLowerCase();
        
        const msg = s.quoted || s.m;
        const msgType = s.quoted ? Object.keys(msg.message!)[0] : s.mtype;

        if (msgType !== 'imageMessage') {
            return s.reply(`Mohon kirim atau balas sebuah gambar dengan caption .${command}`);
        }

        const waitingMsg = await s.reply('Memproses gambar...');

        try {
            const buffer = await downloadMediaMessage(msg, 'buffer', {}) as Buffer;
            const imageUrl = await uploadImage(buffer);
            
            let response: ScraperResponse;
            switch (command) {
                case 'hd':
                    response = await upscaleImageV1(imageUrl);
                    break;
                case 'hd2':
                    response = await upscaleImageV2(imageUrl);
                    break;
                case 'hd3':
                    response = await upscaleImageV3(imageUrl);
                    break;
                case 'removebg':
                case 'nobg':
                    response = await removeBackground(imageUrl);
                    break;
                default:
                    throw new Error('Perintah tidak dikenali.');
            }

            if (response.status !== 200 || !response.data?.url) {
                throw new Error(response.message || 'Gagal mendapatkan hasil gambar.');
            }
            
            await client.sock.sendMessage(s.chat, {
                image: { url: response.data.url },
                caption: `✅ *Proses Selesai* dengan perintah .${command}`
            }, { quoted: s.m });

            await client.sock.sendMessage(s.chat, { delete: waitingMsg.key });

        } catch (error: any) {
            console.error(chalk.red(`[IMAGE ENHANCE ERROR: ${command}]`), error);
            await client.sock.sendMessage(s.chat, { text: `❌ *Gagal:* ${error.message}`, edit: waitingMsg.key });
        }
    }
};

export default handler;
