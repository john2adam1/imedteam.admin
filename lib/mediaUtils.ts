/**
 * Helper to get the full media URL.
 * Rules:
 * - If url starts with "http", return as is.
 * - If url starts with "/media", prepend base URL.
 * - Otherwise return as is (or handle as needed).
 * 
 * Base URL: https://prod.axadjonovsardorbek.uz
 */
export const getMediaUrl = (path?: string | null): string => {
    if (!path) return '';

    if (path.startsWith('http') || path.startsWith('https')) {
        return path;
    }

    if (path.startsWith('/media')) {
        return `https://prod.axadjonovsardorbek.uz${path}`;
    }

    return path;
};
