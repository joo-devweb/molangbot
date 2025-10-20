import { Command } from '../../lib/types';

const handler: Command = {
    cmd: ['ping', 'p'],
    help: ['ping'],
    tag: ['main'],
    info: 'Mengecek kecepatan respon bot.',
    owner: false,
    run: async (s, { client }) => {
        const startTime = Date.now();
        const msg = await s.reply('🏓 Pong!');
        const endTime = Date.now();
        const speed = (endTime - startTime);
        await client.sock.sendMessage(s.chat, { 
            text: `*PONG!* 🚀\nKecepatan Respon: *${speed}* ms`, 
            edit: msg.key 
        });
    }
};

export default handler;