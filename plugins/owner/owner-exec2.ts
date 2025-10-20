import { Command } from '../../lib/types';
import util from 'util';
import syntaxError from 'syntax-error';

const handler: Command = {
    cmd: ['>', '=>'],
    help: ['> <kode>', '=> <kode>'],
    tag: ['owner'],
    info: 'Menjalankan kode JavaScript (eval).',
    owner: true,
    run: async (s, { client }) => {
        const commandPrefix = s.text.startsWith('=>') ? '=>' : '>';
        let code = s.text.slice(commandPrefix.length).trim();
        let result;
        let syntaxErr = '';
        
        try {
            if (commandPrefix === '=>') {
                code = `(async () => { return ${code} })()`;
            }
            result = await eval(code);
        } catch (e: any) {
            const err = syntaxError(code);
            if (err) {
                syntaxErr = `*Syntax Error:*\n\`\`\`${err}\`\`\`\n\n`;
            }
            result = e;
        } finally {
            const output = util.format(result);
            s.reply(syntaxErr + output);
        }
    }
};

export default handler;