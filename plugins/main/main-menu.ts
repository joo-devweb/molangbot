import { Command } from '../../lib/types';
import { config } from '../../config';

const handler: Command = {
    cmd: ['menu', 'help', '?'],
    help: ['menu'],
    tag: ['main'],
    info: 'Menampilkan daftar perintah bot.',
    owner: false,
    run: async (s, { client }) => {
        const commands = client.commands.values();
        const categorized = new Map<string, Command[]>();
        const uniqueCommands = new Set<Command>();

        for (const cmd of commands) uniqueCommands.add(cmd);

        uniqueCommands.forEach(cmd => {
            const tag = cmd.tag[0]?.toUpperCase() || 'LAINNYA';
            if (!categorized.has(tag)) categorized.set(tag, []);
            categorized.get(tag)!.push(cmd);
        });

        let menuText = `╭─❖ *${config.botName.toUpperCase()}* ❖
│
│ Hai Bro *${s.pushName}*! ૮ ˶´ ᵕˋ ˶ა
│ Molang siap melayani!
│
│ ◦ Prefix: *${client.prefix}*
│ ◦ Mode: *${client.botMode}*
│ ◦ Owner: *Nathan*
│
`;
        for (const [category, cmds] of categorized.entries()) {
            menuText += `├─❖ *${category}*\n`;
            menuText += cmds.map(cmd => `│  ◦ ${client.prefix}${cmd.help[0]}`).join('\n') + '\n';
        }

        menuText += `╰─❖ *© Molang The Cute*`;

        await client.sock.sendMessage(s.chat, {
            video: { url: config.menuGifUrl },
            gifPlayback: false,
            caption: menuText,
            mimetype: 'video/mp4'
        });
    }
};
export default handler;