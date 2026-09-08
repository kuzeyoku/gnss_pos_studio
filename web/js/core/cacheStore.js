/**
 * Harita Tools - IndexedDB Geo Cache Store
 * Büyük coğrafi veri setlerini (TG-20 Jeoit Modeli ~1.3MB, HGM Datum Veritabanı ~185KB, EPSG Registry vb.)
 * tarayıcı IndexedDB depolama alanında sürüm denetimli olarak önbelleğe alır.
 */
(function (root, factory) {
  if (typeof define === 'function' && define.amd) {
    define([], factory);
  } else if (typeof module === 'object' && module.exports) {
    module.exports = factory();
  } else {
    root.GeoCacheStore = factory();
  }
}(typeof self !== 'undefined' ? self : this, function () {
  const DB_NAME = 'HaritaToolsGeoCache';
  const DB_VERSION = 1;
  const STORE_NAME = 'geoData';

  class CacheStore {
    constructor() {
      this.db = null;
      this.dbPromise = null;
      this.memoryCache = new Map();
      this.isSupported = typeof indexedDB !== 'undefined';
    }

    async _getDb() {
      if (!this.isSupported) return null;
      if (this.db) return this.db;
      if (this.dbPromise) return this.dbPromise;

      this.dbPromise = new Promise((resolve) => {
        try {
          const req = indexedDB.open(DB_NAME, DB_VERSION);
          req.onupgradeneeded = (e) => {
            const db = e.target.result;
            if (!db.objectStoreNames.contains(STORE_NAME)) {
              db.createObjectStore(STORE_NAME, { keyPath: 'key' });
            }
          };
          req.onsuccess = (e) => {
            this.db = e.target.result;
            resolve(this.db);
          };
          req.onerror = (err) => {
            console.warn('[CacheStore] IndexedDB open error:', err);
            resolve(null);
          };
        } catch (err) {
          console.warn('[CacheStore] IndexedDB exception:', err);
          resolve(null);
        }
      });

      return this.dbPromise;
    }

    /**
     * Önbellekten veri çeker (varsa ve versiyon eşleşiyorsa)
     * @param {string} key 
     * @param {string|number} expectedVersion 
     * @returns {Promise<any|null>}
     */
    async get(key, expectedVersion = null) {
      // 1. In-memory cache kontrolü
      const memItem = this.memoryCache.get(key);
      if (memItem) {
        if (!expectedVersion || memItem.version === expectedVersion) {
          return memItem.data;
        }
      }

      // 2. IndexedDB kontrolü
      try {
        const db = await this._getDb();
        if (!db) return null;

        return new Promise((resolve) => {
          try {
            const tx = db.transaction(STORE_NAME, 'readonly');
            const store = tx.objectStore(STORE_NAME);
            const req = store.get(key);

            req.onsuccess = () => {
              const res = req.result;
              if (res && res.data) {
                if (!expectedVersion || res.version === expectedVersion) {
                  this.memoryCache.set(key, { data: res.data, version: res.version });
                  resolve(res.data);
                  return;
                }
              }
              resolve(null);
            };

            req.onerror = () => resolve(null);
          } catch (e) {
            resolve(null);
          }
        });
      } catch (err) {
        return null;
      }
    }

    /**
     * Veriyi önbelleğe kaydeder
     * @param {string} key 
     * @param {any} data 
     * @param {string|number} version 
     * @returns {Promise<boolean>}
     */
    async set(key, data, version = '1.0.0') {
      this.memoryCache.set(key, { data, version });

      try {
        const db = await this._getDb();
        if (!db) return true;

        return new Promise((resolve) => {
          try {
            const tx = db.transaction(STORE_NAME, 'readwrite');
            const store = tx.objectStore(STORE_NAME);
            const req = store.put({
              key,
              data,
              version,
              updatedAt: Date.now()
            });

            req.onsuccess = () => resolve(true);
            req.onerror = () => resolve(false);
          } catch (e) {
            resolve(false);
          }
        });
      } catch (err) {
        return false;
      }
    }

    /**
     * Belirli bir anahtarı siler
     */
    async delete(key) {
      this.memoryCache.delete(key);
      try {
        const db = await this._getDb();
        if (!db) return true;
        return new Promise((resolve) => {
          const tx = db.transaction(STORE_NAME, 'readwrite');
          const store = tx.objectStore(STORE_NAME);
          const req = store.delete(key);
          req.onsuccess = () => resolve(true);
          req.onerror = () => resolve(false);
        });
      } catch (e) {
        return false;
      }
    }

    /**
     * Tüm coğrafi önbelleği temizler
     */
    async clear() {
      this.memoryCache.clear();
      try {
        const db = await this._getDb();
        if (!db) return true;
        return new Promise((resolve) => {
          const tx = db.transaction(STORE_NAME, 'readwrite');
          const store = tx.objectStore(STORE_NAME);
          const req = store.clear();
          req.onsuccess = () => resolve(true);
          req.onerror = () => resolve(false);
        });
      } catch (e) {
        return false;
      }
    }
  }

  const singletonInstance = new CacheStore();

  if (typeof window !== 'undefined') {
    window.__geoCacheStore = singletonInstance;
    window.__clearGeoCache = async () => {
      await singletonInstance.clear();
      if (typeof window.logMessage === 'function') {
        window.logMessage('🗑️ Coğrafi veri önbelleği (IndexedDB) temizlendi.');
      }
      console.log('[CacheStore] Coğrafi veri önbelleği başarıyla temizlendi.');
      return true;
    };
  }

  return singletonInstance;
}));
