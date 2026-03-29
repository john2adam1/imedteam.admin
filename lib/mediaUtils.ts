/**
 * Helper to get the full media URL.
 * Rules:
 * - If url starts with "http", return as is.
 * - If url starts with "/media", prepend base URL.
 * - Otherwise return as is (or handle as needed).
 * 
 * Base URL: https://prod.imedteam.uz
 */
export const getMediaUrl = (path?: string | null): string => {
    if (!path) return '';

    if (path.startsWith('http://') || path.startsWith('https://')) {
        return path;
    }

    // Prepend base URL for any relative path
    // Using production media domain observed in existing database entries
    const baseUrl = 'https://prod.imedteam.uz';
    const normalizedPath = path.startsWith('/') ? path : `/${path}`;
    return `${baseUrl}${normalizedPath}`;
};
