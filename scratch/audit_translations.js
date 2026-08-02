const fs = require('fs');
const path = require('path');
const babel = require('@babel/core');

const LOCALES_DIR = path.join(__dirname, '..', 'src', 'locales');

function loadLocale(code) {
  const filePath = path.join(LOCALES_DIR, `${code}.js`);
  const { code: transformed } = babel.transformFileSync(filePath, {
    presets: [['next/babel']],
  });
  const module = { exports: {} };
  new Function('module', 'exports', 'require', transformed)(module, module.exports, require);
  return module.exports[code] || module.exports.default;
}

function flatten(obj, prefix = '', out = new Map()) {
  for (const [key, value] of Object.entries(obj)) {
    const pathStr = prefix ? `${prefix}.${key}` : key;
    if (Array.isArray(value)) {
      value.forEach((v, idx) => {
        if (typeof v === 'string') out.set(`${pathStr}[${idx}]`, v);
        else if (v && typeof v === 'object') flatten(v, `${pathStr}[${idx}]`, out);
      });
    } else if (value && typeof value === 'object') {
      flatten(value, pathStr, out);
    } else if (typeof value === 'string') {
      out.set(pathStr, value);
    }
  }
  return out;
}

function audit() {
  const files = fs.readdirSync(LOCALES_DIR).filter(f => f.endsWith('.js'));
  const localesMap = {};
  files.forEach(f => {
    const code = f.replace('.js', '');
    localesMap[code] = flatten(loadLocale(code));
  });

  const enMap = localesMap['en'];

  for (const [code, map] of Object.entries(localesMap)) {
    let emptyCount = 0;
    let untranslatedMatchesEn = 0;

    for (const [key, val] of map.entries()) {
      if (!val || val.trim() === '') {
        emptyCount++;
        console.log(`[EMPTY] ${code}: ${key}`);
      }
      if (code !== 'en' && val === enMap.get(key) && val.length > 5 && !key.includes('code') && !key.includes('url') && !key.includes('email') && !key.includes('phone') && !key.includes('symbol') && !key.includes('name') && !key.includes('MNC') && !val.includes('MNC')) {
        untranslatedMatchesEn++;
      }
    }
    console.log(`Summary for ${code}.js: Total strings = ${map.size}, Empty = ${emptyCount}, Matches EN = ${untranslatedMatchesEn}`);
  }
}

audit();
