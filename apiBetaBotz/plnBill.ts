import axios from "axios";
import { config } from "../config.js";

export interface PlnData {
    customer_id: string;
    name: string;
    periode: string;
    due_date: string;
    amount: string;
}

export interface ScraperResponse {
    status: number;
    data?: PlnData;
    message?: string;
}

export async function getPlnBill(customerId: string): Promise<ScraperResponse> {
    if (!config.apiKey) {
        return { status: 500, message: "API key untuk BetaBotz belum diatur di config.ts" };
    }
    if (!customerId || !/^\d+$/.test(customerId)) {
        return { status: 400, message: "ID Pelanggan PLN tidak valid." };
    }

    try {
        const apiUrl = `https://api.betabotz.eu.org/api/tools/cekbillpln?id=${customerId}&apikey=${config.apiKey}`;
        const { data } = await axios.get(apiUrl);

        if (!data.status || !data.result) {
            throw new Error(data.message || "Gagal memeriksa tagihan dari API.");
        }
        
        return { status: 200, data: data.result };
    } catch (error: any) {
        return { status: 500, message: error.message };
    }
}