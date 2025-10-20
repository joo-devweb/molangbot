
import puppeteer from "puppeteer-extra";
import StealthPlugin from "puppeteer-extra-plugin-stealth";

puppeteer.use(StealthPlugin());

export interface InstagramMedia {
    thumbnail: string;
    url: string;
}

export interface ScraperResponse {
    status: number;
    data?: InstagramMedia[];
    message?: string;
}

function transformResponse(apiResponse: any): InstagramMedia[] {
    if (!apiResponse) return [];
    let items: any[] = Array.isArray(apiResponse) ? apiResponse : [apiResponse];
    return items.map((item) => ({
        thumbnail: item.thumb || "",
        url: item.url && Array.isArray(item.url) && item.url[0] ? item.url[0].url : "",
    })).filter((item) => item.url);
}

async function tryScraper(url: string, pageUrl: string, selector: string, buttonSelector: string): Promise<InstagramMedia[]> {
    const browser = await puppeteer.launch({
        headless: true,
        args: ["--no-sandbox", "--disable-setuid-sandbox", "--disable-dev-shm-usage"],
    });
    const page = await browser.newPage();
    let responseReceived = false;

    return new Promise<InstagramMedia[]>(async (resolve, reject) => {
        page.on("response", async (response) => {
            if (response.url().includes("/api/convert") && !responseReceived) {
                responseReceived = true;
                try {
                    const apiResponse = await response.json();
                    const transformedData = transformResponse(apiResponse);
                    resolve(transformedData);
                } catch (error) {
                    reject(error);
                } finally {
                    await browser.close();
                }
            }
        });
        
        await page.setRequestInterception(true);
        page.on('request', (req) => {
            if (['image', 'stylesheet', 'font', 'media'].includes(req.resourceType())) {
                req.abort();
            } else {
                req.continue();
            }
        });

        try {
            await page.goto(pageUrl, { waitUntil: "domcontentloaded" });
            await page.waitForSelector(selector, { visible: true, timeout: 15000 });
            await page.type(selector, url);
            await page.waitForSelector(buttonSelector, { visible: true });
            await page.click(buttonSelector);

            setTimeout(async () => {
                if (!responseReceived) {
                    reject(new Error("Timeout waiting for API response"));
                    await browser.close();
                }
            }, 30000);
        } catch (error) {
            await browser.close();
            reject(error);
        }
    });
}

async function downloadInstagram(instagramUrl: string): Promise<InstagramMedia[]> {
    try {
        return await tryScraper(instagramUrl, "https://fastdl.app/id", "#search-form-input", ".search-form__button");
    } catch (error) {
        console.error("Fastdl failed, trying Igram. Error:", error);
        try {
            return await tryScraper(instagramUrl, "https://igram.world/id/", "#url", "button[type=submit]");
        } catch (fallbackError) {
            console.error("Igram also failed. Error:", fallbackError);
            throw new Error("Kedua layanan scraper gagal merespons.");
        }
    }
}

export async function getInstagram(url: string): Promise<ScraperResponse> {
    if (!url || typeof url !== "string" || url.trim().length === 0) {
        return { status: 400, message: "Parameter URL tidak valid atau kosong." };
    }
    
    if (!/instagram\.com/.test(url)) {
         return { status: 400, message: "URL yang diberikan bukan dari Instagram." };
    }

    try {
        const result = await downloadInstagram(url.trim());
        if (!result || result.length === 0) {
            return { status: 404, message: "Tidak ada media yang ditemukan untuk URL yang diberikan." };
        }
        return { status: 200, data: result };
    } catch (error: any) {
        return { status: 500, message: error.message || "Terjadi kesalahan internal pada server." };
    }
}