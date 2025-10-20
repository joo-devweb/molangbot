import { chromium, Browser, Page } from "playwright";

export interface MediafireData {
    fileName: string;
    fileSize: string;
    downloadLink: string | null;
}

export interface ScraperResponse {
    status: number;
    data?: MediafireData;
    message?: string;
}

async function mediafireScrape(url: string): Promise<MediafireData> {
    let browser: Browser | null = null;
    try {
        browser = await chromium.launch({
            headless: true,
            args: ["--no-sandbox", "--disable-setuid-sandbox", "--disable-dev-shm-usage"],
        });
        const context = await browser.newContext({ userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36" });
        const page: Page = await context.newPage();

        await page.route("**/*", (route) => {
            const resourceType = route.request().resourceType();
            if (["image", "stylesheet", "font", "media"].includes(resourceType)) {
                route.abort();
            } else {
                route.continue();
            }
        });

        await page.goto(url, { timeout: 60000, waitUntil: "domcontentloaded" });
        await page.waitForSelector('#downloadButton', { timeout: 30000 });

        const fileInfo = await page.evaluate(() => {
            const nameElement = document.querySelector('.filename');
            const sizeElement = document.querySelector('.details > li:first-child > span');
            const linkElement = document.querySelector('#downloadButton');
            
            return {
                name: nameElement ? nameElement.textContent?.trim() || "Unknown" : "Unknown",
                size: sizeElement ? sizeElement.textContent?.trim() || "Unknown" : "Unknown",
                link: linkElement ? (linkElement as HTMLAnchorElement).href : null,
            };
        });

        return {
            fileName: fileInfo.name,
            fileSize: fileInfo.size,
            downloadLink: fileInfo.link,
        };
    } catch (error: any) {
        throw new Error(`Gagal scrape MediaFire: ${error.message}`);
    } finally {
        if (browser) {
            await browser.close();
        }
    }
}

export async function getMediafire(url: string): Promise<ScraperResponse> {
    if (!url || !/^https?:\/\/(www\.)?mediafire\.com\//.test(url)) {
        return { status: 400, message: "URL MediaFire tidak valid." };
    }
    try {
        const data = await mediafireScrape(url);
        if (!data || !data.downloadLink) {
            return { status: 404, message: "Gagal mengekstrak link unduhan." };
        }
        return { status: 200, data };
    } catch (error: any) {
        return { status: 500, message: error.message };
    }
}