import { Command } from '../../lib/types';
import chalk from 'chalk';

const handler: Command = {
    cmd: ['kick', 'tendang', 'keluarkan'],
    help: ['kick @user'],
    tag: ['group'],
    info: 'Mengeluarkan anggota dari grup.',
    owner: false,
    run: async (s, { client }) => {
        if (!s.isGroup) return s.reply('Fitur ini hanya untuk grup!');

        try {
            const metadata = await client.sock.groupMetadata(s.chat);
            const participants = metadata.participants;

            const bot = participants.find(p => p.id === client.sock.user?.id);
            const isBotAdmin = bot?.admin === 'admin' || bot?.admin === 'superadmin';
            if (!isBotAdmin) return s.reply('Molang harus jadi admin dulu untuk bisa menendang orang!');

            const user = participants.find(p => p.id === s.sender);
            const isUserAdmin = user?.admin === 'admin' || user?.admin === 'superadmin';
            if (!isUserAdmin) return s.reply('Hanya admin yang bisa menggunakan perintah ini!');

            let targetJids: string[] = [];
            const mentions = s.m.message?.extendedTextMessage?.contextInfo?.mentionedJid || [];
            
            if (mentions.length > 0) {
                targetJids = mentions;
            } else if (s.quoted) {
                const quotedSender = s.quoted.key.participant || s.quoted.key.remoteJid;
                if (quotedSender) targetJids.push(quotedSender);
            } else {
                return s.reply('Siapa yang mau ditendang?\n\n*Contoh:*\n.kick @user atau balas pesannya dengan .kick');
            }

            if (targetJids.length === 0) {
                return s.reply('Target tidak ditemukan.');
            }

            const kickedUsers: string[] = [];
            const failedUsers: string[] = [];
            for (const jid of targetJids) {
                if (jid === s.sender || jid === bot?.id) continue;
                
                const targetUser = participants.find(p => p.id === jid);
                const isTargetAdmin = targetUser?.admin === 'admin' || targetUser?.admin === 'superadmin';
                if (isTargetAdmin) {
                    failedUsers.push(`@${jid.split('@')[0]} (dia admin)`);
                    continue;
                }
                
                try {
                    await client.sock.groupParticipantsUpdate(s.chat, [jid], 'remove');
                    kickedUsers.push(`@${jid.split('@')[0]}`);
                } catch (error) {
                    failedUsers.push(`@${jid.split('@')[0]}`);
                }
            }

            let responseText = '';
            if (kickedUsers.length > 0) {
                responseText += `✅ Berhasil mengeluarkan ${kickedUsers.join(', ')} dari grup.`;
            }
            if (failedUsers.length > 0) {
                responseText += `\n❌ Gagal mengeluarkan ${failedUsers.join(', ')}.`;
            }
            
            if (responseText) {
                s.reply(responseText);
            }
        } catch (error: any) {
            console.error(chalk.red('[ERROR KICK]:'), error);
            s.reply('Oops, terjadi kesalahan saat mencoba mengeluarkan anggota.');
        }
    }
};

export default handler;