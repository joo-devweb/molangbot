import axios from 'axios';

interface Message {
    role: "system" | "user" | "assistant";
    content: string;
}

export interface ScraperResponse {
    status: number;
    data?: string;
    message?: string;
}

async function scrapeGpt3(messages: Message[]): Promise<string> {
    try {
        const response = await axios.post(
            "https://chatbot-ji1z.onrender.com/chatbot-ji1z",
            { messages },
            {
                timeout: 30000,
                headers: {
                    Accept: "text/event-stream",
                    "Content-Type": "application/json",
                    origin: "https://seoschmiede.at",
                },
            },
        );
        return response.data.choices[0].message.content;
    } catch (error: any) {
        console.error("AI Scraper API Error:", error.message);
        throw new Error("Gagal mendapatkan respons dari API eksternal.");
    }
}

export async function askAI(query: string): Promise<ScraperResponse> {
    if (!query || query.trim().length === 0) {
        return {
            status: 400,
            message: "Parameter query tidak boleh kosong.",
        };
    }

    if (query.length > 2000) {
        return {
            status: 400,
            message: "Query tidak boleh lebih dari 2000 karakter.",
        };
    }

    try {
        const messages: Message[] = [
            { role: "system", content: "Anda adalah AI yang cerdas dan hebat. Tugas Anda adalah memberikan informasi yang akurat, membantu pengguna dengan pertanyaan mereka, dan mengambil keputusan yang etis" },
            { role: "user", content: query.trim() },
        ];

        const result = await scrapeGpt3(messages);

        if (!result) {
            return {
                status: 500,
                message: "API tidak mengembalikan hasil.",
            };
        }

        return {
            status: 200,
            data: result,
        };
    } catch (error: any) {
        return {
            status: 500,
            message: error.message || "Terjadi kesalahan internal pada scraper.",
        };
    }
}