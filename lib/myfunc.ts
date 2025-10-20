import FormData from 'form-data';
import axios from 'axios';
import { Buffer } from 'buffer';

export function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

export function runtime(seconds: number): string {
    seconds = Number(seconds);
    const d = Math.floor(seconds / (3600 * 24));
    const h = Math.floor(seconds % (3600 * 24) / 3600);
    const m = Math.floor(seconds % 3600 / 60);
    const s = Math.floor(seconds % 60);
    
    const dDisplay = d > 0 ? d + (d == 1 ? " hari, " : " hari, ") : "";
    const hDisplay = h > 0 ? h + (h == 1 ? " jam, " : " jam, ") : "";
    const mDisplay = m > 0 ? m + (m == 1 ? " menit, " : " menit, ") : "";
    const sDisplay = s > 0 ? s + (s == 1 ? " detik" : " detik") : "";
    return dDisplay + hDisplay + mDisplay + sDisplay;
}

export function formatDate(dateString: string): string {
    const d = new Date(dateString);
    return d.toLocaleDateString('id-ID', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric',
        hour: 'numeric',
        minute: 'numeric',
        second: 'numeric'
    });
}

export async function uploadImage(buffer: Buffer): Promise<string> {
    const form = new FormData();
    form.append('file', buffer, { filename: 'image-tool.jpg' });
    const { data } = await axios.post('https://tmpfiles.org/api/v1/upload', form, {
        headers: form.getHeaders(),
    });
    return data.data.url.replace('tmpfiles.org/', 'tmpfiles.org/dl/');
}
