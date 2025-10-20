import { createCanvas, loadImage } from "canvas";
import jsQR from "jsqr";
import { Buffer } from "buffer";

export interface ScraperResponse {
    status: number;
    data?: string;
    message?: string;
}

async function readQrCodeFromBuffer(imageBuffer: Buffer): Promise<string> {
    try {
        const image = await loadImage(imageBuffer);
        const canvas = createCanvas(image.width, image.height);
        const ctx = canvas.getContext("2d");
        ctx.drawImage(image, 0, 0);

        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const code = jsQR(imageData.data, imageData.width, imageData.height);

        if (!code) {
            throw new Error("Tidak ada QR code yang ditemukan di dalam gambar.");
        }
        return code.data;
    } catch (error: any) {
        throw new Error(`Gagal memproses gambar: ${error.message}`);
    }
}

export async function getTextFromQr(imageBuffer: Buffer): Promise<ScraperResponse> {
    if (!imageBuffer || imageBuffer.length === 0) {
        return {
            status: 400,
            message: "Data gambar tidak valid atau kosong."
        };
    }

    try {
        const text = await readQrCodeFromBuffer(imageBuffer);
        return {
            status: 200,
            data: text,
        };
    } catch (error: any) {
        return {
            status: 500,
            message: error.message || "Terjadi kesalahan saat membaca QR code.",
        };
    }
}

