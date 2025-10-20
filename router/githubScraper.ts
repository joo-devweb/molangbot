import axios from "axios";

export interface GithubRepoData {
    owner: string;
    repo: string;
    description: string;
    stars: number;
    forks: number;
    download_url: string;
}

export interface ScraperResponse {
    status: number;
    data?: GithubRepoData;
    message?: string;
}

class GitHubUrlParser {
    private headers: { [key: string]: string };

    constructor() {
        this.headers = { "User-Agent": "MolangBot-Scraper" };
    }

    private parseRepoUrl(url: string): { user: string; repo: string } | null {
        const match = url.match(/https?:\/\/github\.com\/([^/]+)\/([^/]+)/);
        return match ? { user: match[1], repo: match[2].replace(/\.git$/, "") } : null;
    }

    async getRepoData(user: string, repo: string): Promise<GithubRepoData> {
        const apiUrl = `https://api.github.com/repos/${user}/${repo}`;
        const response = await axios.get(apiUrl, { headers: this.headers, timeout: 30000 });
        const { default_branch, description, stargazers_count, forks_count } = response.data;
        return {
            owner: user,
            repo: repo,
            description,
            stars: stargazers_count,
            forks: forks_count,
            download_url: `https://github.com/${user}/${repo}/archive/refs/heads/${default_branch}.zip`,
        };
    }

    async getData(url: string) {
        const parsed = this.parseRepoUrl(url);
        if (!parsed) {
            throw new Error("URL tidak valid. Hanya mendukung link repositori GitHub (contoh: https://github.com/user/repo).");
        }
        return await this.getRepoData(parsed.user, parsed.repo);
    }
}

const githubScraper = new GitHubUrlParser();

export async function getGithubRepo(url: string): Promise<ScraperResponse> {
    try {
        const result = await githubScraper.getData(url);
        return { status: 200, data: result };
    } catch (error: any) {
        const is404 = error.response?.status === 404;
        return {
            status: is404 ? 404 : 500,
            message: is404 ? "Repositori tidak ditemukan." : error.message,
        };
    }
}