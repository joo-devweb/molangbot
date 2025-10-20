import axios from "axios";

export interface GithubUserData {
    username: string;
    nickname: string | null;
    bio: string | null;
    profile_pic: string | null;
    url: string | null;
    public_repo: number;
    followers: number;
    following: number;
    created_at: string | null;
}

export interface ScraperResponse {
    status: number;
    data?: GithubUserData;
    message?: string;
}

async function scrapeGithubUser(user: string): Promise<GithubUserData> {
    const { data } = await axios.get(`https://api.github.com/users/${user}`);
    return {
        username: data.login,
        nickname: data.name,
        bio: data.bio,
        profile_pic: data.avatar_url,
        url: data.html_url,
        public_repo: data.public_repos,
        followers: data.followers,
        following: data.following,
        created_at: data.created_at,
    };
}

export async function getStalkGithub(username: string): Promise<ScraperResponse> {
    try {
        const data = await scrapeGithubUser(username);
        return { status: 200, data };
    } catch (error: any) {
        const is404 = error.response?.status === 404;
        return {
            status: is404 ? 404 : 500,
            message: is404 ? "Pengguna GitHub tidak ditemukan." : error.message,
        };
    }
}