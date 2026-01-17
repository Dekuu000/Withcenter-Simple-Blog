export interface Profile {
    id: string;
    email: string;
    full_name?: string;
    avatar_url?: string;
}

export interface Blog {
    id: string;
    title: string;
    content: string;
    author_id: string;
    created_at: string;
    updated_at: string;
    profiles?: Profile;
}
