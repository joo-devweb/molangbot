import axios from "axios";
import { config } from "../config.js";
import { Buffer } from "buffer";

export interface ScraperResponse {
    status: number;
    data?: Buffer;
    message?: string;
}

export async function createBratSticker(type: 'image' | 'video', text: string): Promise<ScraperResponse> {
    if (!config.apiKey) {
        return { status: 500, message: "API key untuk BetaBotz belum diatur di config.ts" };
    }
    if (!text) {
        return { status: 400, message: "Teks tidak boleh kosong." };
    }
    
    try {
        const endpoint = type === 'video' ? 'brat-video' : 'brat';
        const apiUrl = `https://api.betabotz.eu.org/api/maker/${endpoint}?text=${encodeURIComponent(text)}&apikey=${config.apiKey}`;
        
        const response = await axios.get(apiUrl, {
            responseType: 'arraybuffer'
        });

        if (response.headers['content-type']?.includes('application/json')) {
            const errorJson = JSON.parse(response.data.toString());
            throw new Error(errorJson.message || "API mengembalikan error.");
        }
        
        return { status: 200, data: response.data };
    } catch (error: any) {
        return { status: 500, message: error.message || `Gagal membuat stiker dari API.` };
    }
}
