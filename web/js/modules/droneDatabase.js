/**
 * =========================================================================================
 *  HARİTA TOOL / GNSS POS WEB STUDIO - İHA & FOTOGRAMETRİ SENSÖR VERİTABANI (DroneDatabase)
 * =========================================================================================
 *  - Profesyonel Fotogrametri İHA Platformları (DJI Matrice, Mavic 3E/T/M, Phantom 4 RTK, Trinity Pro vb.)
 *  - Metrik Kamera & LiDAR Sensör Parametreleri (Sensör Boyutları, Odak Uzaklığı, Çözünürlük, Deklanşör)
 *  - Dinamik Harici JSON Yükleme & Otomatik UI Senkronizasyonu
 * =========================================================================================
 */

class DroneDatabaseManager {
  static droneData = null;
  static loadPromise = null;

  /**
   * data/drone_sensors.json dosyasından güncel sensör veritabanını asenkron ve tekil olarak çeker
   * Single Source of Truth (Tek Gerçek Kaynak) mimarisi
   */
  static async loadDatabase() {
    if (DroneDatabaseManager.droneData) return DroneDatabaseManager.droneData;
    if (DroneDatabaseManager.loadPromise) return DroneDatabaseManager.loadPromise;

    DroneDatabaseManager.loadPromise = (async () => {
      try {
        const basePath = (typeof window !== "undefined" && window.location.pathname)
          ? window.location.pathname.substring(0, window.location.pathname.lastIndexOf('/') + 1)
          : '';
        const res = await fetch(`${basePath}data/drone_sensors.json?v=${Date.now()}`);
        if (res.ok) {
          const json = await res.json();
          if (json && json.drones && json.cameras) {
            DroneDatabaseManager.droneData = json;
          }
        }
      } catch (err) {
        console.warn("İHA Sensör veritabanı (data/drone_sensors.json) yüklenemedi:", err);
      }
      return DroneDatabaseManager.droneData || { drones: [], cameras: [] };
    })();

    return DroneDatabaseManager.loadPromise;
  }

  constructor() {
    this.data = DroneDatabaseManager.droneData || { drones: [], cameras: [] };
    if (!DroneDatabaseManager.droneData) {
      DroneDatabaseManager.loadDatabase().then(json => {
        if (json) {
          this.data = json;
          if (typeof window !== "undefined" && window.refreshDroneDatabaseUI) {
            window.refreshDroneDatabaseUI();
          }
        }
      });
    }
  }

  /**
   * Harici JSON dosyasını yeniden çeker
   */
  async fetchExternalJson() {
    const json = await DroneDatabaseManager.loadDatabase();
    if (json) {
      this.data = json;
      if (typeof window !== "undefined" && window.refreshDroneDatabaseUI) {
        window.refreshDroneDatabaseUI();
      }
    }
    return json;
  }

  getDrones() {
    return this.data.drones || [];
  }

  getDrone(droneId) {
    return (this.data.drones || []).find(d => d.id === droneId) || null;
  }

  getCameras() {
    return this.data.cameras || [];
  }

  getCamera(cameraId) {
    return (this.data.cameras || []).find(c => c.id === cameraId) || null;
  }

  getCamerasForDrone(droneId) {
    const drone = this.getDrone(droneId);
    if (!drone || !drone.supportedPayloads) {
      return this.getCameras();
    }
    return this.getCameras().filter(cam => drone.supportedPayloads.includes(cam.id));
  }
}

const defaultDroneManager = new DroneDatabaseManager();

if (typeof window !== "undefined") {
  window.DroneDatabase = defaultDroneManager;
  window.DroneDatabaseManager = DroneDatabaseManager;
}

if (typeof module !== "undefined" && module.exports) {
  module.exports = defaultDroneManager;
  module.exports.DroneDatabaseManager = DroneDatabaseManager;
}