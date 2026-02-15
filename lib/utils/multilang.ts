
import { MultilangText } from "@/types";

/**
 * Safely extracts a string from a potentially multilingual value.
 * Handles:
 * - string (returns as is)
 * - MultilangText object (returns 'uz', 'ru', or 'en' in that order)
 * - null/undefined (returns empty string or fallback)
 * - other objects (returns JSON stringified or fallback)
 */
export function getMultilangValue(value: string | MultilangText | any, lang: 'uz' | 'ru' | 'en' = 'uz'): string {
    if (value === null || value === undefined) {
        return '';
    }

    if (typeof value === 'string') {
        return value;
    }

    if (typeof value === 'object') {
        // Check if it looks like MultilangText
        if ('uz' in value || 'ru' in value || 'en' in value) {
            return value[lang] || value['uz'] || value['ru'] || value['en'] || '';
        }

        // Fallback for other objects
        console.warn('getMultilangValue received non-MultilangText object:', value);
        return '';
    }

    return String(value);
}
