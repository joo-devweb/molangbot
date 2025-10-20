import { Command } from '../../lib/types';
import { getGithubRepo } from '../../router/githubScraper.js';
import chalk from 'chalk';
import axios from 'axios';

const handler: Command = {
    cmd: ['github', 'gh'],
    help: ['github <url-repo>'],
    tag: ['downloader'],
    info: 'Mengunduh repositori GitHub sebagai file .zip.',
    owner: false,
    run: async (s, { client }) => {
        const url = s.args[0];
        if (!url) {
            return s.reply('Mohon sertakan URL repositori GitHub.');
        }

        const waitingMsg = await s.reply('Memproses link GitHub...');

        const startTime = Date.now();
        const response = await getGithubRepo(url);
        const latency = Date.now() - startTime;

        if (response.status !== 200 || !response.data) {
            const errorText = `❌ *Gagal*\n\n*Pesan:* ${response.message || 'Tidak ada data yang diterima.'}\n*Status Router:* ${response.status}\n*Latency:* ${latency} ms`;
            return client.sock.sendMessage(s.chat, { text: errorText, edit: waitingMsg.key });
        }

        const { owner, repo, description, stars, forks, download_url } = response.data;

        try {
            await client.sock.sendMessage(s.chat, { 
                text: `✅ *Repositori Ditemukan*\n\nMengunduh *${repo}.zip*...`, 
                edit: waitingMsg.key 
            });
            
            const repoZipBuffer = await axios.get(download_url, {
                responseType: 'arraybuffer'
            });

            if (!repoZipBuffer.data) {
                throw new Error('Gagal mengunduh file repositori.');
            }

            const captionText = `*Repositori:* ${owner}/${repo}\n*Stars:* ${stars}\n*Forks:* ${forks}\n\n*Deskripsi:*\n${description || 'Tidak ada deskripsi.'}\n\n*Status Router:* ${response.status}\n*Latency:* ${latency} ms`;

            await client.sock.sendMessage(s.chat, {
                document: repoZipBuffer.data,
                mimetype: 'application/zip',
                fileName: `${repo}.zip`,
                caption: captionText
            }, { quoted: s.m });

            await client.sock.sendMessage(s.chat, { delete: waitingMsg.key });

        } catch (downloadError: any) {
            console.error(chalk.red('[GITHUB DOWNLOAD ERROR]'), downloadError);
            const errorText = `❌ *Gagal Mengunduh File*\n\n*Pesan:* ${downloadError.message}`;
            await client.sock.sendMessage(s.chat, { text: errorText, edit: waitingMsg.key });
        }
    }
};

export default handler;