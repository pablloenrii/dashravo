/**
 * RAVO OS — Cache Strategies
 * Estratégias de cache para dados e assets
 */

export interface CacheConfig {
  ttl?: number; // Time to live em ms
  version?: number; // Cache version para invalidação
}

/**
 * Cache manager
 */
class CacheManager {
  private cache: Map<string, { data: any; timestamp: number }> = new Map();
  private readonly defaultTTL = 5 * 60 * 1000; // 5 minutos

  /**
   * Get do cache
   */
  get<T>(key: string, config: CacheConfig = {}): T | null {
    const entry = this.cache.get(key);
    if (!entry) return null;

    const ttl = config.ttl ?? this.defaultTTL;
    if (Date.now() - entry.timestamp > ttl) {
      this.cache.delete(key);
      return null;
    }

    return entry.data as T;
  }

  /**
   * Set do cache
   */
  set<T>(key: string, data: T, config: CacheConfig = {}): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
    });
  }

  /**
   * Remover do cache
   */
  delete(key: string): void {
    this.cache.delete(key);
  }

  /**
   * Limpar cache
   */
  clear(): void {
    this.cache.clear();
  }

  /**
   * Invalidar por padrão de chave
   */
  invalidatePattern(pattern: string | RegExp): void {
    const regex = typeof pattern === 'string' ? new RegExp(pattern) : pattern;
    for (const key of this.cache.keys()) {
      if (regex.test(key)) {
        this.cache.delete(key);
      }
    }
  }

  /**
   * Get ou fetch
   */
  async getOrFetch<T>(
    key: string,
    fetcher: () => Promise<T>,
    config: CacheConfig = {}
  ): Promise<T> {
    const cached = this.get<T>(key, config);
    if (cached) return cached;

    const data = await fetcher();
    this.set(key, data, config);
    return data;
  }
}

export const cacheManager = new CacheManager();

/**
 * API Cache Strategy - Network first with cache fallback
 */
export async function fetchWithCache<T>(
  url: string,
  options: {
    method?: string;
    ttl?: number;
    skipCache?: boolean;
  } = {}
): Promise<T> {
  const cacheKey = `api:${options.method || 'GET'}:${url}`;

  if (!options.skipCache) {
    const cached = cacheManager.get<T>(cacheKey, { ttl: options.ttl });
    if (cached) {
      console.log(`📦 Cache hit: ${url}`);
      return cached;
    }
  }

  try {
    const response = await fetch(url, {
      method: options.method || 'GET',
    });

    if (!response.ok) throw new Error(`HTTP ${response.status}`);

    const data = await response.json();
    cacheManager.set(cacheKey, data, { ttl: options.ttl });
    console.log(`🌐 Network fetch: ${url}`);
    return data;
  } catch (error) {
    const cached = cacheManager.get<T>(cacheKey);
    if (cached) {
      console.log(`⚠️  Fallback to stale cache: ${url}`);
      return cached;
    }
    throw error;
  }
}

/**
 * IndexedDB wrapper para cache de dados grandes
 */
export class IndexedDBCache {
  private dbName: string;
  private dbVersion: number = 1;

  constructor(dbName: string = 'ravo-cache') {
    this.dbName = dbName;
  }

  /**
   * Abrir database
   */
  private openDB(): Promise<IDBDatabase> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.dbVersion);
      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result);
      request.onupgradeneeded = (e) => {
        const db = (e.target as IDBOpenDBRequest).result;
        if (!db.objectStoreNames.contains('cache')) {
          db.createObjectStore('cache', { keyPath: 'key' });
        }
      };
    });
  }

  /**
   * Get do IndexedDB
   */
  async get<T>(key: string): Promise<T | null> {
    try {
      const db = await this.openDB();
      const tx = db.transaction(['cache'], 'readonly');
      const store = tx.objectStore('cache');
      const result = await new Promise<{ value: T; timestamp: number } | undefined>(
        (resolve, reject) => {
          const request = store.get(key);
          request.onerror = () => reject(request.error);
          request.onsuccess = () => resolve(request.result);
        }
      );

      if (!result) return null;

      // Check TTL (1 hora padrão)
      if (Date.now() - result.timestamp > 60 * 60 * 1000) {
        await this.delete(key);
        return null;
      }

      return result.value;
    } catch (error) {
      console.error('IndexedDB get error:', error);
      return null;
    }
  }

  /**
   * Set no IndexedDB
   */
  async set<T>(key: string, value: T): Promise<void> {
    try {
      const db = await this.openDB();
      const tx = db.transaction(['cache'], 'readwrite');
      const store = tx.objectStore('cache');
      await new Promise((resolve, reject) => {
        const request = store.put({
          key,
          value,
          timestamp: Date.now(),
        });
        request.onerror = () => reject(request.error);
        request.onsuccess = () => resolve(null);
      });
    } catch (error) {
      console.error('IndexedDB set error:', error);
    }
  }

  /**
   * Delete do IndexedDB
   */
  async delete(key: string): Promise<void> {
    try {
      const db = await this.openDB();
      const tx = db.transaction(['cache'], 'readwrite');
      const store = tx.objectStore('cache');
      await new Promise((resolve, reject) => {
        const request = store.delete(key);
        request.onerror = () => reject(request.error);
        request.onsuccess = () => resolve(null);
      });
    } catch (error) {
      console.error('IndexedDB delete error:', error);
    }
  }

  /**
   * Clear IndexedDB
   */
  async clear(): Promise<void> {
    try {
      const db = await this.openDB();
      const tx = db.transaction(['cache'], 'readwrite');
      const store = tx.objectStore('cache');
      await new Promise((resolve, reject) => {
        const request = store.clear();
        request.onerror = () => reject(request.error);
        request.onsuccess = () => resolve(null);
      });
    } catch (error) {
      console.error('IndexedDB clear error:', error);
    }
  }
}

export const indexedDBCache = new IndexedDBCache();
