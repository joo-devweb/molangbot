import { Command } from '../../lib/types';
import { downloadMediaMessage } from '@whiskeysockets/baileys';
import chalk from 'chalk';

const handler: Command = {
    cmd: ['hidetag', 'tagall'],
    help: ['hidetag <pesan>'],
    tag: ['group'],
    info: 'Mention semua anggota grup secara tersembunyi.',
    owner: true,
    run: async (s, { client }) => {
        if (!s.isGroup) {
            return s.reply('Fitur ini hanya bisa digunakan di dalam grup, ya!');
        }

        try {
            const metadata = await client.sock.groupMetadata(s.chat);
            const participants = metadata.participants;
            const memberJids = participants.map(p => p.id);

            const user = participants.find(p => p.id === s.sender);
            const isUserAdmin = user?.admin === 'admin' || user?.admin === 'superadmin';

            if (!isUserAdmin) {
                return s.reply('Kamu harus menjadi admin untuk menggunakan perintah ini!');
            }

            let messageToSend: any = {
                mentions: memberJids
            };

            if (s.quoted) {
                const quotedMsg = s.quoted;
                const quotedType = Object.keys(quotedMsg.message!)[0];
                const originalContent = quotedMsg.message![quotedType as keyof typeof quotedMsg.message];
                
                switch (quotedType) {
                    case 'conversation':
                    case 'extendedTextMessage':
                        messageToSend.text = (originalContent as any).text || s.text;
                        break;
                    
                    case 'imageMessage':
                        messageToSend.image = await downloadMediaMessage(quotedMsg, 'buffer', {});
                        messageToSend.caption = (originalContent as any).caption || '';
                        break;

                    case 'videoMessage':
                        messageToSend.video = await downloadMediaMessage(quotedMsg, 'buffer', {});
                        messageToSend.caption = (originalContent as any).caption || '';
                        messageToSend.mimetype = (originalContent as any).mimetype || 'video/mp4';
                        break;

                    case 'stickerMessage':
                        messageToSend.sticker = await downloadMediaMessage(quotedMsg, 'buffer', {});
                        break;

                    case 'audioMessage':
                        messageToSend.audio = await downloadMediaMessage(quotedMsg, 'buffer', {});
                        messageToSend.mimetype = (originalContent as any).mimetype || 'audio/mp4';
                        break;
                    
                    default:
                        messageToSend.text = s.args.join(' ') || `Panggilan untuk semua anggota! 👋`;
                        break;
                }
            } else {
                const text = s.args.join(' ');
                if (!text) {
                    return s.reply('Mohon berikan pesan untuk di-hidetag.\n\n*Contoh:*\n.hidetag rapat jam 8 malam ya!');
                }
                messageToSend.text = text;
            }

            await client.sock.sendMessage(s.chat, messageToSend);

        } catch (error: any) {
            console.error(chalk.red('[ERROR HIDETAG]:'), error);
            s.reply('Oops, terjadi kesalahan saat mencoba melakukan hidetag.');
        }
    }
};

export default handler;