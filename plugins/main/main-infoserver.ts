import { Command } from '../../lib/types';
import os from 'os';
import { runtime } from '../../lib/myfunc.js';


const handler: Command = {
    cmd: ['serverinfo', 'infoserver'],
    help: ['serverinfo'],
    tag: ['main'],
    info: 'Menampilkan informasi server bot.',
    owner: false,
    run: async (s, {}) => {
        const totalMem = (os.totalmem() / 1024 / 1024).toFixed(2);
        const freeMem = (os.freemem() / 1024 / 1024).toFixed(2);

        const infoText = `💻 *Informasi Server Molang Bot* 💻

- *OS:* ${os.platform()} ${os.release()} (${os.arch()})
- *CPU:* ${os.cpus()[0].model} (${os.cpus().length} core)
- *RAM:* ${freeMem} MB / ${totalMem} MB
- *Uptime:* ${runtime(os.uptime())}
        `;
        s.reply(infoText);
    }
};

export default handler;