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
    image_url?: string;
    author_id: string;
    created_at: string;
    updated_at: string;
    profiles?: Profile;
}

export interface Comment {
    id: string;
    content: string;
    image_url?: string;
    blog_id: string;
    author_id: string;
    created_at: string;
    profiles?: Profile;
}
