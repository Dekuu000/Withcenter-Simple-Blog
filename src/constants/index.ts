// Application Routes
export const ROUTES = {
    HOME: '/',
    LOGIN: '/login',
    REGISTER: '/register',
    CREATE_BLOG: '/create-blog',
    VIEW_BLOG: '/blog/:id',
    EDIT_BLOG: '/blog/edit/:id',
    MY_POSTS: '/my-posts',
} as const;

// Helper function to generate blog routes
export const getBlogRoute = (id: string) => `/blog/${id}`;
export const getEditBlogRoute = (id: string) => `/blog/edit/${id}`;

// Pagination
export const PAGINATION = {
    DEFAULT_PAGE: 1,
    DEFAULT_LIMIT: 9,
    MAX_LIMIT: 100,
} as const;

// Storage Keys
export const STORAGE_KEYS = {
    AUTH_TOKEN: 'auth_token',
    USER_PREFERENCES: 'user_preferences',
} as const;

// Error Messages
export const ERROR_MESSAGES = {
    NETWORK_ERROR: 'Network error. Please check your connection and try again.',
    UNAUTHORIZED: 'You are not authorized to perform this action.',
    NOT_FOUND: 'The requested resource was not found.',
    SERVER_ERROR: 'An unexpected error occurred. Please try again later.',
    VALIDATION_ERROR: 'Please check your input and try again.',
} as const;

// Success Messages
export const SUCCESS_MESSAGES = {
    BLOG_CREATED: 'Blog post created successfully!',
    BLOG_UPDATED: 'Blog post updated successfully!',
    BLOG_DELETED: 'Blog post deleted successfully!',
    LOGIN_SUCCESS: 'Welcome back!',
    REGISTER_SUCCESS: 'Account created successfully!',
    COMMENT_ADDED: 'Comment added successfully!',
} as const;

// File Upload
export const FILE_UPLOAD = {
    MAX_SIZE: 5 * 1024 * 1024, // 5MB
    ALLOWED_TYPES: ['image/jpeg', 'image/png', 'image/webp', 'image/gif'],
    ALLOWED_EXTENSIONS: ['.jpg', '.jpeg', '.png', '.webp', '.gif'],
} as const;

// API Configuration
export const API_CONFIG = {
    TIMEOUT: 30000, // 30 seconds
    RETRY_ATTEMPTS: 3,
    RETRY_DELAY: 1000, // 1 second
} as const;
