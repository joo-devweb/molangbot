import axios from "axios";
import * as cheerio from "cheerio";
import { CookieJar } from "tough-cookie";
import { wrapper } from "axios-cookiejar-support";

export interface TiktokMedia {
    metadata: {
        description: string;
        stats: any;
    };
    download: {
        video?: string[];
        audio?: string;
        photo?: string[];
    };
}

export interface ScraperResponse {
    status: number;
    data?: TiktokMedia;
    message?: string;
}

class TikTokScraper {
    private genericUserAgent: string = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36";

    private decodeJWT(token: string): any {
        try {
            const base64Url = token.split('.')[1];
            const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
            const jsonPayload = decodeURIComponent(Buffer.from(base64, 'base64').toString('binary').split('').map((c) => 
                '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)
            ).join(''));
            return JSON.parse(jsonPayload);
        } catch {
            return null;
        }
    }

    private async getDownloadLinks(URL: string) {
        const response = await axios.get("https://musicaldown.com/en", {
            headers: { "user-agent": "Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/132.0.0.0 Mobile Safari/537.36" }
        });
        const $ = cheerio.load(response.data);
        const url_name = $("#link_url").attr("name");
        const token_name = $("#submit-form > div").find("div:nth-child(1) > input[type=hidden]:nth-child(2)").attr("name");
        const token_ = $("#submit-form > div").find("div:nth-child(1) > input[type=hidden]:nth-child(2)").attr("value");
        const verify = $("#submit-form > div").find("div:nth-child(1) > input[type=hidden]:nth-child(3)").attr("value");

        if (!url_name || !token_name || !token_ || !verify) throw new Error("Failed to extract form data from musicaldown.com");

        const data: { [key: string]: string } = { [url_name]: URL, [token_name]: token_, verify };
        const respon = await axios.post("https://musicaldown.com/download", new URLSearchParams(data), {
            headers: {
                "user-agent": "Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/132.0.0.0 Mobile Safari/537.36",
                "cookie": response.headers["set-cookie"]?.join("; ") || ""
            }
        });
        const ch = cheerio.load(respon.data);
        let result: { video?: string[], audio?: string, photo?: string[] } = {};
        const videoLinks: string[] = [];

        ['a[data-event="hd_download_click"]', 'a[data-event="mp4_download_click"]', 'a[data-event="watermark_download_click"]'].forEach(selector => {
            const link = ch(selector).attr("href");
            if (link) {
                const decoded = this.decodeJWT(link.split('token=')[1]);
                if (decoded?.url) videoLinks.push(decoded.url);
            }
        });
        if (videoLinks.length > 0) result.video = videoLinks;

        const mp3Link = ch('a[data-event="mp3_download_click"]').attr("href");
        if (mp3Link) {
            const decoded = this.decodeJWT(mp3Link.split('token=')[1]);
            if (decoded?.url) result.audio = decoded.url;
        }

        const images: string[] = [];
        ch(".card-action.center > a").each((i, elem) => {
            const href = ch(elem).attr("href");
            if (href) {
                const decoded = this.decodeJWT(href.split('token=')[1]);
                if (decoded?.cover) images.push(decoded.cover);
            }
        });
        if (images.length > 0) result.photo = images;

        const scriptContent = ch("#SlideButton").parent().find("script").text();
        const slideDataMatch = scriptContent.match(/data:\s*['"](.*?)['"]/);
        if (slideDataMatch) {
            const slideRes = await axios.post("https://render.muscdn.app/slider", new URLSearchParams({ data: slideDataMatch[1] }));
            if (slideRes.data.success) result.video = [slideRes.data.url];
        }
        return result;
    }

    async scrape(url: string) {
        const jar = new CookieJar();
        const client = wrapper(axios.create({ jar, withCredentials: true }));
        const headers = { "User-Agent": this.genericUserAgent };
        const first = await client.get(url, { headers, maxRedirects: 0, validateStatus: (s) => s >= 200 && s < 400 });
        let redirectUrl = first.headers.location || url;
        if (redirectUrl.includes("/photo/")) redirectUrl = redirectUrl.replace("/photo/", "/video/");

        const { data: html } = await client.get(redirectUrl, { headers, maxRedirects: 10 });
        if (!html.includes("__UNIVERSAL_DATA_FOR_REHYDRATION__")) throw new Error("Data not found");

        const json = html.split('<script id="__UNIVERSAL_DATA_FOR_REHYDRATION__" type="application/json">')[1].split("</script>")[0];
        const data = JSON.parse(json);
        const item = data["__DEFAULT_SCOPE__"]["webapp.video-detail"]?.itemInfo?.itemStruct;
        if (!item) throw new Error("Video detail not found");
        if (data["__DEFAULT_SCOPE__"]["webapp.video-detail"].statusMsg) throw new Error("Video unavailable");

        const downloadLinks = await this.getDownloadLinks(url);
        return {
            metadata: { description: item.desc, stats: item.stats },
            download: downloadLinks,
        };
    }
}

const tiktokScraper = new TikTokScraper();

export async function getTiktok(url: string): Promise<ScraperResponse> {
    if (!url || !/tiktok\.com/.test(url)) {
        return { status: 400, message: "URL TikTok tidak valid." };
    }
    try {
        const result = await tiktokScraper.scrape(url);
        return { status: 200, data: result };
    } catch (error: any) {
        return { status: 500, message: error.message || "Gagal mengambil data TikTok." };
    }
}