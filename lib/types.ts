import { WASocket, WAProto, WAMessageKey } from '@whiskeysockets/baileys';

export interface SimpleMessage {
    key: WAMessageKey;
    message: WAProto.IMessage | undefined;
    mtype: string | null;
    text: string;
    sender: string;
    chat: string;
    isGroup: boolean;
    isOwner: boolean;
    args: string[];
    m: WAProto.IWebMessageInfo;
    quoted: WAProto.IWebMessageInfo | null;
    reply: (text: string) => Promise<WAProto.WebMessageInfo>;
    pushName: string;
}

export interface Client {
    sock: WASocket;
    commands: Map<string, Command>;
    prefix: string;
    botMode: 'public' | 'self';
    apiKey?: string;
}

export interface Command {
    cmd: string[];
    help: string[];
    tag: string[];
    info: string;
    owner: boolean;
    run: (s: SimpleMessage, options: { client: Client }) => Promise<void>;
}

export interface Config {
    ownerNumber: string[];
    botName: string;
    prefix: string;
    pairingNumber: string;
    sessionName: string;
    menuGifUrl: string;
    apiKey?: string;
}