import axios from "axios";

export interface GithubRepoResult {
    full_name: string;
    fork: boolean;
    html_url: string;
    created_at: string;
    updated_at: string;
    watchers: number;
    forks: number;
    stargazers_count: number;
    open_issues: number;
    description: string | null;
    clone_url: string;
}

export interface ScraperResponse {
    status: number;
    data?: GithubRepoResult[];
    message?: string;
}

export async function searchGithubRepos(query: string): Promise<ScraperResponse> {
    if (!query) {
        return { status: 400, message: "Query pencarian tidak boleh kosong." };
    }

    try {
        const apiUrl = `https://api.github.com/search/repositories?q=${encodeURIComponent(query)}`;
        const { data } = await axios.get(apiUrl, {
            headers: { 'User-Agent': 'MolangBot-Scraper' }
        });

        if (!data.items || data.items.length === 0) {
            throw new Error("Tidak ada repositori yang ditemukan.");
        }
        
        return { status: 200, data: data.items };
    } catch (error: any) {
        return { status: 500, message: error.message || "Gagal mencari repositori GitHub." };
    }
}