import { Command } from '../../lib/types';
import { downloadMediaMessage } from '@whiskeysockets/baileys';
import { Sticker, StickerTypes } from 'wa-sticker-formatter';

const handler: Command = {
    cmd: ['s', 'sticker', 'stiker'],
    help: ['sticker (reply/kirim media)'],
    tag: ['tools'],
    info: 'Membuat stiker dari gambar atau video.',
    owner: false,
    run: async (s, { client }) => {
        const msg = s.quoted || s.m;
        const msgType = s.quoted ? Object.keys(msg.message!)[0] : s.mtype;

        if (msgType !== 'imageMessage' && msgType !== 'videoMessage') {
            return s.reply('Kirim atau reply gambar/video dengan caption `.sticker`');
        }

        await s.reply('✨ *Sedang membuat stiker...* ✨');
        const buffer = await downloadMediaMessage(msg, 'buffer', {});

        const sticker = new Sticker(buffer as Buffer, {
            pack: 'Molang Bot',
            author: 'Nathan',
            type: StickerTypes.FULL,
            quality: 70
        });

        await client.sock.sendMessage(s.chat, await sticker.toMessage());
    }
};

export default handler;