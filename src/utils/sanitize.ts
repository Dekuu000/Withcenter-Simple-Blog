/**
 * Sanitizes HTML content to prevent XSS attacks
 * Basic implementation - for production, consider using DOMPurify
 */
export function sanitizeHtml(dirty: string): string {
    const element = document.createElement('div');
    element.textContent = dirty;
    return element.innerHTML;
}

/**
 * Escapes HTML entities in a string
 */
export function escapeHtml(text: string): string {
    const map: Record<string, string> = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#x27;',
        '/': '&#x2F;',
    };
    return text.replace(/[&<>"'/]/g, (char) => map[char] || char);
}

/**
 * Validates if a string is a safe URL
 */
export function isValidUrl(url: string): boolean {
    try {
        const parsedUrl = new URL(url);
        return ['http:', 'https:'].includes(parsedUrl.protocol);
    } catch {
        return false;
    }
}

/**
 * Truncates text to a specified length with ellipsis
 */
export function truncateText(text: string, maxLength: number): string {
    if (text.length <= maxLength) return text;
    return text.slice(0, maxLength).trim() + '...';
}
