
import axios from "axios";
import { Buffer } from "buffer";

// Tipe data untuk hasil fetch
export interface FetchData {
    type: 'json' | 'text' | 'file';
    content: any; // Bisa berupa objek JSON, string, atau URL untuk file
    mediaKey: 'image' | 'video' | 'audio' | 'document'; // Kunci untuk mengirim file di Baileys
    size: string;
}

export interface ScraperResponse {
    status: number;
    data?: FetchData;
    message?: string;
}

// Fungsi helper untuk format ukuran file
function formatSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

export async function fetchUrl(url: string): Promise<ScraperResponse> {
    try {
        // 1. Lakukan HEAD request untuk memeriksa header tanpa download body
        const headResponse = await axios.head(url, {
            headers: { "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/115.0.0.0 Safari/537.36" },
            timeout: 15000,
        });

        const contentType = headResponse.headers['content-type'] || '';
        const contentLength = parseInt(headResponse.headers['content-length'] || '0');
        
        // 2. Cek ukuran file, batas 200 MB
        if (contentLength > 200 * 1024 * 1024) {
            return { status: 413, message: `Ukuran file (${formatSize(contentLength)}) melebihi batas 200 MB.` };
        }

        const size = formatSize(contentLength);

        // 3. Lakukan GET request jika perlu (untuk teks/json)
        if (/json/i.test(contentType)) {
            const { data } = await axios.get(url);
            return { status: 200, data: { type: 'json', content: data, size, mediaKey: 'document' } };
        } else if (/text/i.test(contentType)) {
            const { data } = await axios.get(url);
            return { status: 200, data: { type: 'text', content: data, size, mediaKey: 'document' } };
        } else {
            // 4. Jika file, tentukan tipe media dan kembalikan URL untuk diunduh oleh plugin
            let mediaKey: 'image' | 'video' | 'audio' | 'document' = 'document';
            if (contentType.startsWith('image/')) mediaKey = 'image';
            if (contentType.startsWith('video/')) mediaKey = 'video';
            if (contentType.startsWith('audio/')) mediaKey = 'audio';
            
            return { status: 200, data: { type: 'file', content: url, size, mediaKey } };
        }

    } catch (error: any) {
        return { status: 500, message: `Gagal mengambil data dari URL: ${error.message}` };
    }
}
