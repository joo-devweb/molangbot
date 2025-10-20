import { open, Database } from 'sqlite';
import sqlite3 from 'sqlite3';
import chalk from 'chalk';
import fs from 'fs';

const DB_DIR = './database';
const DB_PATH = `${DB_DIR}/database.sqlite`;
let db: Database | null = null;

export async function initializeDB() {
    try {
        if (!fs.existsSync(DB_DIR)) {
            fs.mkdirSync(DB_DIR);
        }
        
        db = await open({
            filename: DB_PATH,
            driver: sqlite3.Database
        });

        await db.exec(`
            CREATE TABLE IF NOT EXISTS settings (
                key TEXT PRIMARY KEY,
                value TEXT
            )
        `);

        await db.run("INSERT OR IGNORE INTO settings (key, value) VALUES ('prefix', '.')");
        await db.run("INSERT OR IGNORE INTO settings (key, value) VALUES ('botMode', 'public')");
        
        console.log(chalk.greenBright('[DATABASE] Database SQLite berhasil terhubung dan diinisialisasi.'));
    } catch (e) {
        console.error(chalk.red('[DATABASE] Gagal terhubung ke database:'), e);
        process.exit(1);
    }
}

export async function getSetting(key: string): Promise<string | null> {
    if (!db) await initializeDB();
    const result = await db!.get("SELECT value FROM settings WHERE key = ?", key);
    return result?.value || null;
}

export async function setSetting(key: string, value: string): Promise<void> {
    if (!db) await initializeDB();
    await db!.run("REPLACE INTO settings (key, value) VALUES (?, ?)", key, value);
}