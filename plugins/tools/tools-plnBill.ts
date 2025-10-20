import { Command } from '../../lib/types';
import { getPlnBill } from '../../apiBetaBotz/plnBill.js';

const handler: Command = {
    cmd: ['cektagihan', 'tagihanpln', 'pln'],
    help: ['pln <id_pelanggan>'],
    tag: ['tools'],
    info: 'Mengecek tagihan listrik PLN.',
    owner: false,
    run: async (s, { client }) => {
        const customerId = s.args[0];
        if (!customerId) {
            return s.reply('Mohon sertakan ID Pelanggan PLN.');
        }

        const waitingMsg = await s.reply('Memeriksa tagihan...');

        const response = await getPlnBill(customerId);

        if (response.status !== 200 || !response.data) {
            const errorText = `❌ *Gagal*\n\n*Pesan:* ${response.message || 'Tidak ada data.'}`;
            return client.sock.sendMessage(s.chat, { text: errorText, edit: waitingMsg.key });
        }
        
        const { name, periode, due_date, amount } = response.data;
        const resultText = `✅ *Tagihan PLN Ditemukan*

*ID Pelanggan:* ${customerId}
*Nama:* ${name}
*Periode:* ${periode}
*Jatuh Tempo:* ${due_date}
*Jumlah Tagihan:* Rp${amount}`;

        await client.sock.sendMessage(s.chat, { text: resultText, edit: waitingMsg.key });
    }
};

export default handler;