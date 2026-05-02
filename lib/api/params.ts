export function sanitizeQueryParams(params: Record<string, unknown>): Record<string, unknown> {
    return Object.fromEntries(
        Object.entries(params).filter(([, value]) => value !== '' && value !== undefined && value !== null)
    );
}
