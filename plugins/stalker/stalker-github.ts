import { Command } from '../../lib/types';
import { getStalkGithub } from '../../router/githubStalkerScraper.js';
import chalk from 'chalk';

const handler: Command = {
    cmd: ['ghstalk', 'githubstalk'],
    help: ['ghstalk <username>'],
    tag: ['stalker'],
    info: 'Melihat profil pengguna GitHub.',
    owner: false,
    run: async (s, { client }) => {
        const username = s.args[0];
        if (!username) {
            return s.reply('Mohon sertakan username GitHub.');
        }

        const waitingMsg = await s.reply('Mencari profil GitHub...');

        const startTime = Date.now();
        const response = await getStalkGithub(username);
        const latency = Date.now() - startTime;

        if (response.status !== 200 || !response.data) {
            const errorText = `❌ *Gagal*\n\n*Pesan:* ${response.message || 'Tidak ada data yang diterima.'}\n*Status Router:* ${response.status}\n*Latency:* ${latency} ms`;
            return client.sock.sendMessage(s.chat, { text: errorText, edit: waitingMsg.key });
        }

        const { nickname, bio, public_repo, followers, following, created_at, profile_pic, url } = response.data;
        
        const creationDate = new Date(created_at!).toLocaleDateString('id-ID', {
            day: '2-digit', month: 'long', year: 'numeric'
        });

        const caption = `✅ *Profil GitHub Ditemukan*

*Nama:* ${nickname || 'Tidak ada'} (@${response.data.username})
*Followers:* ${followers.toLocaleString('id-ID')}
*Following:* ${following.toLocaleString('id-ID')}
*Repositori Publik:* ${public_repo.toLocaleString('id-ID')}
*Bergabung pada:* ${creationDate}

*Bio:*
${bio || 'Tidak ada bio.'}

*Link Profil:*
${url}

*Status Router:* ${response.status}
*Latency:* ${latency} ms`;

        if (profile_pic) {
            await client.sock.sendMessage(s.chat, {
                image: { url: profile_pic },
                caption: caption,
            }, { quoted: s.m });
            await client.sock.sendMessage(s.chat, { delete: waitingMsg.key });
        } else {
            await client.sock.sendMessage(s.chat, { text: caption, edit: waitingMsg.key });
        }
    }
};

export default handler;