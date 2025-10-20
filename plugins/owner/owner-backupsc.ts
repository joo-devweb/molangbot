
import { Command } from '../../lib/types';
import fs from 'fs';
import path from 'path';
import os from 'os';
import archiver from 'archiver';
import chalk from 'chalk';

const handler: Command = {
    cmd: ['backup', 'backupsc'],
    help: ['backup'],
    tag: ['owner'],
    info: 'Membuat cadangan (backup) seluruh skrip bot.',
    owner: true,
    run: async (s, { client }) => {
        const waitingMsg = await s.reply('Memulai proses backup skrip Molang... ⚙️');

        const rootDir = process.cwd(); // Mendapatkan direktori utama proyek
        const date = new Date().toISOString().split('T')[0]; // Format YYYY-MM-DD
        const outputFileName = `backup-molang-bot-${date}.zip`;
        const outputFilePath = path.join(os.tmpdir(), outputFileName); // Simpan di folder temporary sistem

        // Daftar file dan folder yang akan diabaikan
        const ignoreList = [
            'node_modules',
            'molangSessions',
            '.git',
            '.npm',
            'cache',
            'database', 
            outputFileName,
            'package-lock.json'
        ];

        try {
            await client.sock.sendMessage(s.chat, {
                text: 'Mengumpulkan file dan folder...',
                edit: waitingMsg.key
            });

            
            const output = fs.createWriteStream(outputFilePath);
            const archive = archiver('zip', {
                zlib: { level: 9 } // Kompresi level maksimal
            });

            
            const archivePromise = new Promise<void>((resolve, reject) => {
                output.on('close', resolve);
                archive.on('error', reject);
            });

            archive.pipe(output);

            
            const addFilesToArchive = (directory: string) => {
                const files = fs.readdirSync(directory);
                for (const file of files) {
                    if (ignoreList.includes(file)) continue; // Lewati jika ada di ignoreList

                    const fullPath = path.join(directory, file);
                    const stat = fs.statSync(fullPath);

                    if (stat.isDirectory()) {
                        addFilesToArchive(fullPath); // Panggil rekursif untuk sub-folder
                    } else {
                        // Tambahkan file ke zip dengan path relatif
                        archive.file(fullPath, { name: path.relative(rootDir, fullPath) });
                    }
                }
            };
            
            addFilesToArchive(rootDir); // Mulai dari direktori utama
            await archive.finalize();
            await archivePromise; // Tunggu sampai file selesai ditulis

            await client.sock.sendMessage(s.chat, {
                text: '✅ Backup selesai! Mengirim file...',
                edit: waitingMsg.key
            });

            // Kirim file backup sebagai dokumen
            await client.sock.sendMessage(s.chat, {
                document: fs.readFileSync(outputFilePath),
                mimetype: 'application/zip',
                fileName: outputFileName
            }, { quoted: s.m });

            // Hapus file backup dari server setelah dikirim
            fs.unlinkSync(outputFilePath);
            await client.sock.sendMessage(s.chat, { delete: waitingMsg.key });

        } catch (error: any) {
            console.error(chalk.red('[ERROR BACKUP]:'), error);
            const errorText = `❌ *Oops, proses backup gagal!*\n\n*Alasan:* ${error.message}`;
            await client.sock.sendMessage(s.chat, {
                text: errorText,
                edit: waitingMsg.key
            });
            // Hapus file backup jika ada error
            if (fs.existsSync(outputFilePath)) {
                fs.unlinkSync(outputFilePath);
            }
        }
    }
};

export default handler;
