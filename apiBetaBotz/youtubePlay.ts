
import axios from "axios";
import yts from "yt-search";
import { config } from "../config.js";
import { Buffer } from "buffer";

export interface YoutubeData {
    title: string;
    author: string;
    views: string;
    ago: string;
    timestamp: string;
    thumbnail: string;
    url: string;
    downloadUrl: string;
}

export interface ScraperResponse {
    status: number;
    data?: YoutubeData;
    message?: string;
}

async function getYoutubeDownloadLink(url: string, apiKey: string): Promise<string> {
    const { data } = await axios.get(`https://api.betabotz.eu.org/api/download/yt?url=${url}&apikey=${apiKey}`);
    if (data.status && data.result?.mp3) {
        return data.result.mp3;
    }
    throw new Error(data.message || "Gagal mendapatkan link unduhan dari API BetaBotz.");
}

export async function getYoutubeAudio(query: string): Promise<ScraperResponse> {
    if (!config.apiKey || config.apiKey === 'ISI_APIKEY_BETABOTZ_ANDA_DISINI') {
        return { status: 500, message: "API key untuk BetaBotz belum diatur di config.ts." };
    }

    try {
        const searchResult = await yts(query);
        const video = searchResult.videos[0];

        if (!video) {
            return { status: 404, message: "Video tidak ditemukan untuk kata kunci tersebut." };
        }

        if (video.seconds >= 3600) { // Durasi maksimal 1 jam (3600 detik)
            return { status: 400, message: `Video terlalu panjang (${video.timestamp}). Durasi maksimal adalah 1 jam.` };
        }
        
        const downloadUrl = await getYoutubeDownloadLink(video.url, config.apiKey);
        
        const data: YoutubeData = {
            title: video.title,
            author: video.author.name,
            views: video.views.toLocaleString('id-ID'),
            ago: video.ago,
            timestamp: video.timestamp,
            thumbnail: video.thumbnail,
            url: video.url,
            downloadUrl: downloadUrl
        };
        
        return { status: 200, data };
    } catch (error: any) {
        return { status: 500, message: error.message || "Terjadi kesalahan saat mencari atau mengunduh video." };
    }
}