import { Command } from '../../lib/types';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const pluginsDir = path.resolve(__dirname, '..');

const commands: Command[] = [
    {
        cmd: ['sfp', 'saveplugin'],
        help: ['sfp <path> <kode>'],
        tag: ['owner'],
        info: 'Menyimpan atau mengubah file plugin.',
        owner: true,
        run: async (s) => {
            const filePath = s.args[0];
            const code = s.text.slice(s.text.indexOf(filePath) + filePath.length).trim();
            if (!filePath || !code) return s.reply('Gunakan: .sfp plugins/sub/file.ts <kode>');
            
            const fullPath = path.resolve(pluginsDir, filePath);
            if (!fullPath.startsWith(pluginsDir)) return s.reply('Error: Dilarang menyimpan file di luar folder plugins!');

            fs.writeFileSync(fullPath, code);
            s.reply(`✅ Plugin berhasil disimpan di: ${filePath}\nHot reload sedang berjalan...`);
        }
    },
    {
        cmd: ['dfp', 'deleteplugin'],
        help: ['dfp <path>'],
        tag: ['owner'],
        info: 'Menghapus file plugin.',
        owner: true,
        run: async (s) => {
            const filePath = s.args[0];
            if (!filePath) return s.reply('Masukkan path file!');
            const fullPath = path.resolve(pluginsDir, filePath);
            if (!fullPath.startsWith(pluginsDir) || !fs.existsSync(fullPath)) return s.reply('File tidak ditemukan atau dilarang.');

            fs.unlinkSync(fullPath);
            s.reply(`🗑️ Plugin berhasil dihapus: ${filePath}\nHot reload sedang berjalan...`);
        }
    },
    {
        cmd: ['gfp', 'getplugin'],
        help: ['gfp <path>'],
        tag: ['owner'],
        info: 'Mengambil kode dari file plugin.',
        owner: true,
        run: async (s) => {
            const filePath = s.args[0];
            if (!filePath) return s.reply('Masukkan path file!');
            const fullPath = path.resolve(pluginsDir, filePath);
            if (!fullPath.startsWith(pluginsDir) || !fs.existsSync(fullPath)) return s.reply('File tidak ditemukan atau dilarang.');

            const content = fs.readFileSync(fullPath, 'utf-8');
            s.reply(content);
        }
    }
];

export default commands;