import { Command } from '../../lib/types';
import { searchGithubRepos } from '../../router/githubSearchScraper.js';
import { formatDate } from '../../lib/myfunc.js';

const handler: Command = {
    cmd: ['githubsearch', 'ghsearch'],
    help: ['githubsearch <query>'],
    tag: ['search'],
    info: 'Mencari repositori di GitHub.',
    owner: false,
    run: async (s, { client }) => {
        const query = s.args.join(' ');
        if (!query) {
            return s.reply('Masukkan kata kunci pencarian repositori.');
        }

        const waitingMsg = await s.reply(`Mencari repositori untuk "${query}"...`);

        const response = await searchGithubRepos(query);

        if (response.status !== 200 || !response.data) {
            const errorText = `❌ *Gagal*\n\n*Pesan:* ${response.message || 'Tidak ada data.'}`;
            return client.sock.sendMessage(s.chat, { text: errorText, edit: waitingMsg.key });
        }
        
        const resultText = response.data.slice(0, 5).map((repo, index) => {
            return `*${index + 1}. ${repo.full_name}*${repo.fork ? ' (fork)' : ''}
${repo.html_url}
Dibuat: ${formatDate(repo.created_at)}
Update: ${formatDate(repo.updated_at)}
👁️ ${repo.watchers}   🍴 ${repo.forks}   ⭐ ${repo.stargazers_count}

${repo.description ? `*Deskripsi:*\n${repo.description}` : ''}
*Clone:* \`\`\`git clone ${repo.clone_url}\`\`\``.trim();
        }).join('\n\n---\n\n');

        const footer = `\nMenampilkan 5 dari ${response.data.length} hasil.`;

        await client.sock.sendMessage(s.chat, { text: resultText + footer, edit: waitingMsg.key });
    }
};

export default handler;
