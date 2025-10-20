import { Command } from '../../lib/types';
import chalk from 'chalk';

const handler: Command = {
    cmd: ['add', 'tambah', 'invite'],
    help: ['add <nomor>'],
    tag: ['group'],
    info: 'Menambahkan anggota ke grup.',
    owner: false,
    run: async (s, { client }) => {
        if (!s.isGroup) return s.reply('Fitur ini hanya untuk grup!');

        try {
            const metadata = await client.sock.groupMetadata(s.chat);
            const participants = metadata.participants;

            const bot = participants.find(p => p.id === client.sock.user?.id);
            const isBotAdmin = bot?.admin === 'admin' || bot?.admin === 'superadmin';
            if (!isBotAdmin) return s.reply('Molang harus jadi admin dulu untuk bisa menambahkan orang!');

            const user = participants.find(p => p.id === s.sender);
            const isUserAdmin = user?.admin === 'admin' || user?.admin === 'superadmin';
            if (!isUserAdmin) return s.reply('Hanya admin yang bisa menggunakan perintah ini!');

            const number = s.args[0];
            if (!number) return s.reply('Masukkan nomor yang ingin ditambahkan.\n\n*Contoh:*\n.add 6281234567890');
            
            let targetJid = number.replace(/[^0-9]/g, '');
            if (targetJid.startsWith('08')) {
                targetJid = '62' + targetJid.slice(1);
            }
            targetJid += '@s.whatsapp.net';

            if (participants.some(p => p.id === targetJid)) {
                return s.reply(`Nomor tersebut sudah ada di dalam grup ini.`);
            }

            const response = await client.sock.groupParticipantsUpdate(s.chat, [targetJid], 'add');
            const statusInfo = response[0];
            const status = statusInfo.status;

            if (status === '200') {
                s.reply(`✅ Halo @${targetJid.split('@')[0]}, selamat datang di grup!`);
            } else if (status === '403') {
                s.reply(`❌ Gagal mengundang @${targetJid.split('@')[0]}. Mungkin karena pengaturan privasi mereka.`);
            } else if (status === '404') {
                s.reply(`❌ Nomor tidak ditemukan atau tidak terdaftar di WhatsApp.`);
            } else if (status === '409') {
                s.reply(`❌ @${targetJid.split('@')[0]} baru saja keluar dari grup. Mereka harus ditambahkan secara manual.`);
            } else {
                s.reply(`❌ Gagal menambahkan anggota. Kode status: ${status}`);
            }

        } catch (error: any) {
            console.error(chalk.red('[ERROR ADD USER]:'), error);
            s.reply('Oops, terjadi kesalahan saat mencoba menambahkan anggota.');
        }
    }
};

export default handler;