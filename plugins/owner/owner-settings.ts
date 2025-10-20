import { Command } from '../../lib/types';
import { setSetting } from '../../lib/database.js';

const commands: Command[] = [
    {
        cmd: ['self'],
        help: ['self'],
        tag: ['owner'],
        info: 'Mengubah mode bot menjadi self (hanya merespons owner).',
        owner: true,
        run: async (s, { client }) => {
            if (client.botMode === 'self') return s.reply('Mode bot sudah self, tuan.');
            await setSetting('botMode', 'self');
            client.botMode = 'self';
            await s.reply('👑 *Mode Self Diaktifkan!* 👑\nHanya Owner yang Bisa Pakai.');
        }
    },
    {
        cmd: ['public'],
        help: ['public'],
        tag: ['owner'],
        info: 'Mengubah mode bot menjadi public.',
        owner: true,
        run: async (s, { client }) => {
            if (client.botMode === 'public') return s.reply('Mode bot sudah public, tuan.');
            await setSetting('botMode', 'public');
            client.botMode = 'public';
            await s.reply('🌍 *Mode Public Diaktifkan!* 🌍\nAku akan merespons semua orang.');
        }
    },
    {
        cmd: ['setprefix'],
        help: ['setprefix <prefix_baru>'],
        tag: ['owner'],
        info: 'Mengubah prefix perintah bot.',
        owner: true,
        run: async (s, { client }) => {
            const newPrefix = s.args[0];
            if (!newPrefix) return s.reply(`Gunakan format: .setprefix <prefix_baru>\nContoh: .setprefix !`);
            await setSetting('prefix', newPrefix);
            client.prefix = newPrefix;
            await s.reply(`🎉 *Prefix Berhasil Diubah!* 🎉\nPrefix baru sekarang adalah: *${newPrefix}*`);
        }
    }
];

export default commands;