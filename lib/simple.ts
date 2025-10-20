import { WASocket, WAProto, getContentType } from '@whiskeysockets/baileys';
import { SimpleMessage } from './types.js';
import { config } from '../config.js';

export function simple(sock: WASocket, m: WAProto.IWebMessageInfo): SimpleMessage {
    const s: Partial<SimpleMessage> = {};

    s.key = m.key;
    s.message = m.message!;
    s.m = m;
    s.chat = m.key.remoteJid!;
    s.sender = m.key.fromMe ? (sock.user!.id.split(':')[0] + '@s.whatsapp.net' || sock.user!.id) : (m.key.participant || m.key.remoteJid!);
    s.isGroup = s.chat.endsWith('@g.us');
    s.pushName = m.pushName || 'Tanpa Nama';
    s.text = m.message?.conversation || m.message?.extendedTextMessage?.text || m.message?.imageMessage?.caption || m.message?.videoMessage?.caption || '';
    s.mtype = getContentType(m.message!);
    s.isOwner = config.ownerNumber.some(owner => s.sender.startsWith(owner)) || m.key.fromMe;

    const contextInfo = m.message?.extendedTextMessage?.contextInfo;
    s.quoted = contextInfo?.quotedMessage ? {
        key: {
            remoteJid: s.chat,
            fromMe: contextInfo.participant === (sock.user?.id.split(':')[0] + '@s.whatsapp.net'),
            id: contextInfo.stanzaId,
            participant: contextInfo.participant
        },
        message: contextInfo.quotedMessage
    } : null;

    s.reply = (text: string) => {
        return sock.sendMessage(s.chat!, { text }, { quoted: m });
    };
    
    s.args = [];

    return s as SimpleMessage;
}