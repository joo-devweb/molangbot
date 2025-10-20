import { WAProto } from '@whiskeysockets/baileys';
import chalk from 'chalk';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { simple } from './simple.js';
import { Client, Command } from './types.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const pluginsDir = path.join(__dirname, '../plugins');

export async function loadPlugins(client: Client) {
    client.commands.clear();
    const readDir = async (dir: string) => {
        const files = fs.readdirSync(dir);
        for (const file of files) {
            const fullPath = path.join(dir, file);
            if (fs.lstatSync(fullPath).isDirectory()) {
                await readDir(fullPath);
            } else if (file.endsWith('.ts')) {
                try {
                    const module = await import(`file://${fullPath}?v=${Date.now()}`);
                    const commands: Command[] = Array.isArray(module.default) ? module.default : [module.default];
                    
                    for (const command of commands) {
                        if (command && command.cmd) {
                            command.cmd.forEach((c: string) => client.commands.set(c, command));
                        }
                    }
                } catch (e) {
                    console.error(chalk.red(`[PLUGINS] Gagal memuat file: ${file}`), e);
                }
            }
        }
    };
    await readDir(pluginsDir);
    console.log(chalk.green(`[PLUGINS] Berhasil memuat ${client.commands.size} alias perintah.`));
}

export async function handleMessages(client: Client, m: WAProto.IWebMessageInfo) {
    if (!m.message || m.key.remoteJid === 'status@broadcast') return;

    const s = simple(client.sock, m);
    
    if (client.botMode === 'self' && !s.isOwner) {
        return;
    }

    const prefix = client.prefix;
    if (!s.text || !s.text.startsWith(prefix)) return;

    const commandName = s.text.slice(prefix.length).trim().split(/ +/).shift()?.toLowerCase() || '';
    const args = s.text.trim().split(/ +/).slice(1);
    s.args = args;
    
    const command = client.commands.get(commandName) || Array.from(client.commands.values()).find((c) => c.cmd.includes(commandName));
    
    console.log(chalk.bgBlack.bold.white('\n<---------- PESAN MASUK ---------->'));
    console.log(chalk.yellow(`Number😝     : ${s.sender.split('@')[0]}`));
    console.log(chalk.green(`Name😝      : ${s.pushName}`));
    if (s.isGroup) {
        try {
            const groupMeta = await client.sock.groupMetadata(s.chat);
            console.log(chalk.cyan(`Grup😝      : ${groupMeta.subject}`));
        } catch {}
    } else {
        console.log(chalk.magenta('Private😝   : Chat Pribadi'));
    }
    console.log(chalk.white(`Timestamp😝 : ${new Date().toLocaleString()}`));
    console.log(chalk.blue(`Teks😛      : ${s.text}`));
    if (command) console.log(chalk.red.bold(`Fitur😘     : ${commandName}`));
    console.log(chalk.bgBlack.bold.white('<------------------------------->'));

    if (command) {
        if (command.owner && !s.isOwner) {
            return s.reply('🚫 Maaf, fitur ini dikhususkan hanya untuk Owner! 🚫');
        }
        try {
            await command.run(s, { client });
        } catch (error: any) {
            console.error(chalk.red.bold(`[ERROR] di ${commandName}:`), error);
            s.reply(`❌ Aduh, ada error nih di fitur *${commandName}*:\n\n*Pesan Error:* ${error.message}`);
        }
    }
}