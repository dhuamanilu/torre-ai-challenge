type CacheEntry<T> = {
    data: T;
    timestamp: number;
};

const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

class ApiCache {
    private cache: Map<string, CacheEntry<any>> = new Map();

    set<T>(key: string, data: T): void {
        this.cache.set(key, {
            data,
            timestamp: Date.now(),
        });
    }

    get<T>(key: string): T | null {
        const entry = this.cache.get(key);
        if (!entry) return null;

        if (Date.now() - entry.timestamp > CACHE_DURATION) {
            this.cache.delete(key);
            return null;
        }

        return entry.data as T;
    }

    clear(): void {
        this.cache.clear();
    }
}

export const apiCache = new ApiCache();
