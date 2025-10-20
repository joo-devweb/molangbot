import QRCode from "qrcode";
import { Buffer } from "buffer";

export interface ScraperResponse {
    status: number;
    data?: Buffer;
    message?: string;
}

async function generateQrCodeBuffer(text: string): Promise<Buffer> {
    const options: QRCode.QRCodeToBufferOptions = {
        errorCorrectionLevel: "H",
        type: "png",
        quality: 1,
        width: 1024,
        margin: 2,
        color: {
            dark: "#000000",
            light: "#FFFFFF",
        },
    };
    return QRCode.toBuffer(text, options);
}

export async function generateQrFromText(text: string): Promise<ScraperResponse> {
    if (!text || text.trim().length === 0) {
        return {
            status: 400,
            message: "Teks tidak boleh kosong.",
        };
    }
    if (text.length > 2000) {
        return {
            status: 400,
            message: "Teks tidak boleh lebih dari 2000 karakter.",
        };
    }

    try {
        const qrBuffer = await generateQrCodeBuffer(text.trim());
        return {
            status: 200,
            data: qrBuffer,
        };
    } catch (error: any) {
        return {
            status: 500,
            message: "Gagal membuat QR code.",
        };
    }
}
