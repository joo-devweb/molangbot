import axios from "axios";
import { config } from "../config.js";

export interface ImageToolData {
    url: string;
}

export interface ScraperResponse {
    status: number;
    data?: ImageToolData;
    message?: string;
}

const callApi = async (endpoint: string, imageUrl: string): Promise<ScraperResponse> => {
    if (!config.apiKey) {
        return { status: 500, message: "API key untuk BetaBotz belum diatur di config.ts" };
    }
    
    try {
        const apiUrl = `https://api.betabotz.eu.org/api/tools/${endpoint}?url=${imageUrl}&apikey=${config.apiKey}`;
        const { data } = await axios.get(apiUrl, { timeout: 60000 });

        if (!data.status || !data.url) {
            throw new Error(data.message || `Gagal memproses gambar dari API endpoint: ${endpoint}`);
        }
        
        return { status: 200, data: { url: data.url } };
    } catch (error: any) {
        return { status: 500, message: error.message };
    }
};

export const upscaleImageV1 = (url: string) => callApi('remini', url);
export const upscaleImageV2 = (url: string) => callApi('remini-v2', url);
export const upscaleImageV3 = (url: string) => callApi('remini-v3&resolusi=4', url);
export const removeBackground = (url: string) => callApi('removebg', url);
