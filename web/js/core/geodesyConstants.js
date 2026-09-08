/**
 * Harita Tools - Geodetic Constants & Angular Math Utility Engine
 * Centralized Single Source of Truth for Reference Ellipsoids & Coordinate Math
 * Standards: BÖHHBÜY, IERS, EPSG, HGM
 */

(function (root, factory) {
  if (typeof define === 'function' && define.amd) {
    define([], factory);
  } else if (typeof module === 'object' && module.exports) {
    module.exports = factory();
  } else {
    const exports = factory();
    root.HaritaGeodesy = exports;
    root.GEODETIC_CONSTANTS = exports.ELLIPSOIDS;
    // Export global angle helpers for backward compatibility
    if (typeof root.deg2rad === 'undefined') root.deg2rad = exports.deg2rad;
    if (typeof root.rad2deg === 'undefined') root.rad2deg = exports.rad2deg;
    if (typeof root.gon2deg === 'undefined') root.gon2deg = exports.gon2deg;
    if (typeof root.deg2gon === 'undefined') root.deg2gon = exports.deg2gon;
  }
}(typeof self !== 'undefined' ? self : this, function () {

  // Standard Ellipsoids
  const ELLIPSOIDS = Object.freeze({
    // GRS80 (ITRF96, TUREF, ETRS89)
    GRS80: Object.freeze({
      name: 'GRS80',
      a: 6378137.0,
      invF: 298.257222101,
      f: 1.0 / 298.257222101,
      b: 6378137.0 * (1.0 - 1.0 / 298.257222101),
      e2: (2.0 * (1.0 / 298.257222101)) - (1.0 / 298.257222101) ** 2,
      ep2: ((6378137.0 ** 2) - (6378137.0 * (1.0 - 1.0 / 298.257222101)) ** 2) / ((6378137.0 * (1.0 - 1.0 / 298.257222101)) ** 2)
    }),
    // WGS84 (GPS standard)
    WGS84: Object.freeze({
      name: 'WGS84',
      a: 6378137.0,
      invF: 298.257223563,
      f: 1.0 / 298.257223563,
      b: 6378137.0 * (1.0 - 1.0 / 298.257223563),
      e2: (2.0 * (1.0 / 298.257223563)) - (1.0 / 298.257223563) ** 2,
      ep2: ((6378137.0 ** 2) - (6378137.0 * (1.0 - 1.0 / 298.257223563)) ** 2) / ((6378137.0 * (1.0 - 1.0 / 298.257223563)) ** 2)
    }),
    // Hayford 1924 / International 1924 (ED50)
    HAYFORD1924: Object.freeze({
      name: 'Hayford 1924 / International 1924',
      a: 6378388.0,
      invF: 297.0,
      f: 1.0 / 297.0,
      b: 6378388.0 * (1.0 - 1.0 / 297.0),
      e2: (2.0 * (1.0 / 297.0)) - (1.0 / 297.0) ** 2,
      ep2: ((6378388.0 ** 2) - (6378388.0 * (1.0 - 1.0 / 297.0)) ** 2) / ((6378388.0 * (1.0 - 1.0 / 297.0)) ** 2)
    })
  });

  // Universal Angular Unit Conversions
  const deg2rad = deg => (deg * Math.PI) / 180.0;
  const rad2deg = rad => (rad * 180.0) / Math.PI;
  const gon2deg = gon => gon * 0.9;
  const deg2gon = deg => deg / 0.9;
  const gon2rad = gon => (gon * Math.PI) / 200.0;
  const rad2gon = rad => (rad * 200.0) / Math.PI;

  return {
    ELLIPSOIDS,
    deg2rad,
    rad2deg,
    gon2deg,
    deg2gon,
    gon2rad,
    rad2gon
  };
}));
