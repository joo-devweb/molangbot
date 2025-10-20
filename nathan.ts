import { makeWASocket, useMultiFileAuthState, DisconnectReason, Browsers } from '@whiskeysockets/baileys';
import pino from 'pino';
import chalk from 'chalk';
import chokidar from 'chokidar';
import path from 'path';
import { Boom } from '@hapi/boom';
import { fileURLToPath } from 'url';
import NodeCache from 'node-cache';
import { config } from './config.js';
import { loadPlugins, handleMessages } from './lib/handler.js';
import { initializeDB, getSetting } from './lib/database.js';
import { Client } from './lib/types';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const groupCache = new NodeCache({ stdTTL: 5 * 60, useClones: false });

console.log(chalk.bold.magenta(`

🏿🏿🏿🏿🏿🏿🏿🏿
🏿🏿🏽🏽🏽🏽🏿🏿
🏽🏽🏽🏽🏽🏽🏽🏽
🏽⬜⬛🏽🏽⬛⬜🏽
🏽🏽🏽🏿🏿🏽🏽🏽
🏽🏽🏿🏽🏽🏿🏽🏽
🏽🏽🏿🏿🏿🏿🏽🏽‍‍ 

`));
console.log(chalk.cyan('======================================================'));
console.log(chalk.yellow.bold('          Molang Bot v1.0.0 - Tahap Pengembangan'));
console.log(chalk.cyan('======================================================'));

async function startBot() {
    await initializeDB();

    const { state, saveCreds } = await useMultiFileAuthState(config.sessionName);

    const client: Client = {
        sock: null as any,
        commands: new Map(),
        prefix: (await getSetting('prefix')) || '.',
        botMode: (await getSetting('botMode')) || 'public',
        apiKey: config.apiKey
    };

    client.sock = makeWASocket({
        logger: pino({ level: 'silent' }),
        printQRInTerminal: !config.pairingNumber,
        browser: ['macOS', 'Safari', '124.00'],
        auth: state,
        cachedGroupMetadata: (jid) => groupCache.get(jid)
    });

    await loadPlugins(client);

    if (config.pairingNumber && !client.sock.authState.creds.registered) {
        console.log(chalk.yellow(`[PAIRING] Meminta kode pairing untuk +${config.pairingNumber} ...`));
        setTimeout(async () => {
            try {
                const code = await client.sock.requestPairingCode(config.pairingNumber);
                console.log(chalk.green.bold(`[PAIRING] Kode Anda: ${code}`));
            } catch (e) {
                console.error(chalk.red('[PAIRING] Gagal meminta kode.'), e);
            }
        }, 3000);
    }
    
    client.sock.ev.on('connection.update', (update) => {
        const { connection, lastDisconnect } = update;
        if (connection === 'close') {
            const shouldReconnect = (lastDisconnect?.error as Boom)?.output?.statusCode !== DisconnectReason.loggedOut;
            console.log(chalk.red('[KONEKSI] Terputus! Mencoba menghubungkan ulang dalam 5 detik...'));
            if (shouldReconnect) setTimeout(startBot, 5000);
        } else if (connection === 'open') {
            console.log(chalk.blue.bold('\n[STATUS] Koneksi WhatsApp Stabil! Molang siap beraksi! ૮ ˶´ ᵕˋ ˶ა\n'));
        }
    });
    
    client.sock.ev.on('creds.update', saveCreds);

    client.sock.ev.on('messages.upsert', ({ messages }) => {
        for (const message of messages) {
            handleMessages(client, message);
        }
    });

    client.sock.ev.on('groups.update', async (events) => {
        for (const event of events) {
            const metadata = await client.sock.groupMetadata(event.id);
            groupCache.set(event.id, metadata);
        }
    });

    client.sock.ev.on('group-participants.update', async (event) => {
        const metadata = await client.sock.groupMetadata(event.id);
        groupCache.set(event.id, metadata);
    });

    chokidar.watch(path.join(__dirname, 'plugins')).on('change', (filePath) => {
        console.log(chalk.magenta(`[HOT RELOAD] File ${path.basename(filePath)} diubah. Memuat ulang semua plugins...`));
        loadPlugins(client);
    });
}

startBot();