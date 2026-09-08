/**
 * Test Helper: Motorları Node.js ortamına yükler
 * Tarayıcı global'lerini simüle ederek class-based motorların Node.js'de çalışmasını sağlar.
 */

// Mock DOMParser for Node.js test environment (KML / GPX parser support)
class MockElement {
  constructor(tagName, attributes = {}, text = '') {
    this.tagName = tagName;
    this.attributes = attributes;
    this.children = [];
    this._text = text;
  }
  get textContent() {
    if (this.children.length > 0) {
      return this.children.map(c => c.textContent).join('');
    }
    return this._text;
  }
  getAttribute(name) {
    return this.attributes[name] !== undefined ? this.attributes[name] : null;
  }
  getElementsByTagName(tag) {
    const results = [];
    const matchTag = tag.toLowerCase();
    function search(el) {
      for (const child of el.children) {
        if (child.tagName && (child.tagName.toLowerCase() === matchTag || matchTag === '*')) {
          results.push(child);
        }
        search(child);
      }
    }
    search(this);
    return results;
  }
}

function parseXmlToMockDOM(xmlStr) {
  const root = new MockElement('#document');
  const stack = [root];
  const tagRegex = /<(\/?)([\w:]+)([^>]*?)(\/?)>|([^<]+)/g;
  let match;
  while ((match = tagRegex.exec(xmlStr)) !== null) {
    const isClosing = match[1] === '/';
    const tagName = match[2];
    const attrStr = match[3];
    const isSelfClosing = match[4] === '/';
    const textContent = match[5];

    if (textContent) {
      const parent = stack[stack.length - 1];
      if (parent) {
        parent.children.push(new MockElement('#text', {}, textContent));
      }
    } else if (tagName) {
      if (isClosing) {
        while (stack.length > 1) {
          const popped = stack.pop();
          if (popped.tagName && popped.tagName.toLowerCase() === tagName.toLowerCase()) break;
        }
      } else {
        const attrs = {};
        if (attrStr) {
          const attrRegex = /([\w:]+)=["']([^"']*)["']/g;
          let am;
          while ((am = attrRegex.exec(attrStr)) !== null) {
            attrs[am[1]] = am[2];
          }
        }
        const el = new MockElement(tagName, attrs);
        const parent = stack[stack.length - 1];
        if (parent) parent.children.push(el);
        if (!isSelfClosing) {
          stack.push(el);
        }
      }
    }
  }
  return root;
}

if (typeof global.DOMParser === 'undefined') {
  global.DOMParser = class DOMParser {
    parseFromString(xmlStr) {
      return parseXmlToMockDOM(xmlStr);
    }
  };
}

// GeodesyConstants'ı yükle — GeodesyEngine buna bağımlı
const HaritaGeodesy = require('../web/js/core/geodesyConstants.js');
global.HaritaGeodesy = HaritaGeodesy;
global.GEODETIC_CONSTANTS = HaritaGeodesy.ELLIPSOIDS;
global.deg2rad = HaritaGeodesy.deg2rad;
global.rad2deg = HaritaGeodesy.rad2deg;
global.gon2deg = HaritaGeodesy.gon2deg;
global.deg2gon = HaritaGeodesy.deg2gon;

// GeometryUtils (paftaIndexEngine bağımlılığı)
const GeometryUtils = require('../web/js/core/geometryUtils.js');
global.GeometryUtils = GeometryUtils;

// TG20 Model Data (Node.js test ortamı için)
try {
  const tg20Model = require('../web/data/tg20Data.json');
  global.TG20_GEOID_MODEL = tg20Model;
  if (typeof global.window === 'undefined') {
    global.window = {};
  }
  global.window.TG20_GEOID_MODEL = tg20Model;
} catch (e) {
  // Model data optional
}

// Motor yüklemeleri
const GeodesyEngine = require('../web/js/modules/geodesyEngine.js');
try {
  const epsgData = require('../web/data/epsg_registry.json');
  GeodesyEngine.epsgData = epsgData;
  GeodesyEngine.epsgRegistry = {};
  for (const sys of epsgData.systems) {
    GeodesyEngine.epsgRegistry[sys.code] = sys;
  }
} catch (e) {}

const Tg20GeoidEngine = require('../web/js/modules/tg20GeoidEngine.js');
const GnssFormatEngine = require('../web/js/modules/gnssFormatEngine.js');
const PaftaIndexEngine = require('../web/js/modules/paftaIndexEngine.js');
const UniversalFormatConverterEngine = require('../web/js/modules/universalFormatConverterEngine.js');
const { UniversalRinexInspector, RinexPowerEngine, RinexMergerEngine } = require('../web/js/modules/rinexPowerEngine.js');
global.UniversalRinexInspector = UniversalRinexInspector;
global.RinexPowerEngine = RinexPowerEngine;
global.RinexMergerEngine = RinexMergerEngine;

// GnssFormatEngine GeodesyEngine'e bağımlı
global.GeodesyEngine = GeodesyEngine;

module.exports = {
  HaritaGeodesy,
  GeodesyEngine,
  Tg20GeoidEngine,
  GnssFormatEngine,
  PaftaIndexEngine,
  UniversalFormatConverterEngine,
  UniversalRinexInspector,
  RinexPowerEngine,
  RinexMergerEngine,
  GeometryUtils,
};
