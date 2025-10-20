
import axios from "axios";
import { config } from "../config.js";

export interface VideyData {
    videoUrl: string;
}

export interface ScraperResponse {
    status: number;
    data?: VideyData;
    message?: string;
}

export async function getVidey(url: string): Promise<ScraperResponse> {
    if (!config.apiKey || config.apiKey === 'ISI_APIKEY_BETABOTZ_ANDA_DISINI') {
        return { status: 500, message: "API key untuk BetaBotz belum diatur di config.ts" };
    }
    if (!url || !/videy\.co/.test(url)) {
        return { status: 400, message: "URL Videy tidak valid." };
    }

    try {
        const apiUrl = `https://api.betabotz.eu.org/api/download/videy?url=${url}&apikey=${config.apiKey}`;
        const response = await axios.get(apiUrl, { timeout: 30000 });

        if (response.data && response.data.result) {
            return {
                status: 200,
                data: { videoUrl: response.data.result }
            };
        } else {
            throw new Error(response.data.message || "Gagal mendapatkan link unduhan dari API.");
        }
    } catch (error: any) {
        return { status: 500, message: error.message || "Terjadi kesalahan pada scraper Videy." };
    }
}