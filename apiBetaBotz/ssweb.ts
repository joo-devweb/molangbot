import axios from "axios";
import { config } from "../config.js";
import { Buffer } from "buffer";

export interface ScraperResponse {
    status: number;
    data?: Buffer;
    message?: string;
}

export async function getScreenshot(url: string, device: 'desktop' | 'mobile'): Promise<ScraperResponse> {
    if (!config.apiKey) {
        return { status: 500, message: "API key untuk BetaBotz belum diatur di config.ts" };
    }
    
    try {
        let fullUrl = url;
        if (!/^(https?:\/\/)/i.test(url)) {
            fullUrl = 'http://' + url;
        }

        const apiUrl = `https://api.betabotz.eu.org/api/tools/ssweb?url=${fullUrl}&device=${device}&apikey=${config.apiKey}`;
        
        const response = await axios.get(apiUrl, { responseType: 'arraybuffer' });
        
        return { status: 200, data: response.data };
    } catch (error: any) {
        return { status: 500, message: error.message };
    }
}