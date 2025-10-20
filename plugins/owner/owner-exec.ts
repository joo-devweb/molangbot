import { exec } from 'child_process';
import { Command } from '../../lib/types';
import { promisify } from 'util';

const execAsync = promisify(exec);

const handler: Command = {
    cmd: ['$', 'exec'],
    help: ['exec <command>'],
    tag: ['owner'],
    info: 'Menjalankan kode di terminal.',
    owner: true,
    run: async (s) => {
        const command = s.args.join(' ');
        if (!command) return s.reply('Masukkan perintah!');
        await s.reply('Executing...');
        try {
            const { stdout, stderr } = await execAsync(command);
            let output = '';
            if (stdout) output += `*Stdout:*\n${stdout}`;
            if (stderr) output += `*Stderr:*\n${stderr}`;
            s.reply(output || 'Selesai tanpa output.');
        } catch (e: any) {
            s.reply(`*Error:*\n${e.message}`);
        }
    }
};

export default handler;