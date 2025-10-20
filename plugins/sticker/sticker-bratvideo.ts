import { Command } from '../../lib/types';
import { createBratSticker } from '../../apiBetaBotz/stickerBrat.js';
import chalk from 'chalk';
import { Sticker, StickerTypes } from 'wa-sticker-formatter';

const handler: Command = {
    cmd: ['bratvideo'],
    help: ['bratvideo <teks>'],
    tag: ['sticker'],
    info: 'Membuat stiker "brat" (video) dengan teks.',
    owner: false,
    run: async (s, { client }) => {
        const text = s.args.join(' ');
        if (!text) {
            return s.reply(`Mohon sertakan teks untuk stiker.\n\n*Contoh:*\n.bratvideo teksnya disini`);
        }

        const waitingMsg = await s.reply('Membuat stiker brat (video)...');

        try {
            const response = await createBratSticker('video', text);

            if (response.status !== 200 || !response.data) {
                throw new Error(response.message || 'Gagal mendapatkan video dari API.');
            }
            
            const sticker = new Sticker(response.data, {
                pack: 'Molang Bot',
                author: 'Nathan',
                type: StickerTypes.FULL,
                quality: 50 
            });

            await client.sock.sendMessage(s.chat, await sticker.toMessage());
            await client.sock.sendMessage(s.chat, { delete: waitingMsg.key });

        } catch (error: any) {
            console.error(chalk.red('[BRAT VIDEO STICKER ERROR]'), error);
            await client.sock.sendMessage(s.chat, { text: `❌ *Gagal:* ${error.message}`, edit: waitingMsg.key });
        }
    }
};

export default handler;