const fs = require('fs');
const path = require('path');
const babel = require('@babel/core');

const LOCALES_DIR = path.join(__dirname, '..', 'src', 'locales');

function loadLocale(code) {
  const filePath = path.join(LOCALES_DIR, `${code}.js`);
  const { code: transformed } = babel.transformFileSync(filePath, { presets: [['next/babel']] });
  const module = { exports: {} };
  new Function('module', 'exports', 'require', transformed)(module, module.exports, require);
  return module.exports[code] || module.exports.default;
}

function scan(obj, prefix = '', out = []) {
  for (const [key, value] of Object.entries(obj)) {
    const p = prefix ? `${prefix}.${key}` : key;
    if (Array.isArray(value)) {
      value.forEach((item, i) => {
        if (typeof item === 'object' && item !== null) {
          scan(item, `${p}[${i}]`, out);
        } else {
          out.push({ path: `${p}[${i}]`, val: item });
        }
      });
    } else if (typeof value === 'object' && value !== null) {
      scan(value, p, out);
    } else {
      out.push({ path: p, val: value });
    }
  }
  return out;
}

function run() {
  const files = fs.readdirSync(LOCALES_DIR).filter(f => f.endsWith('.js'));
  const data = {};
  files.forEach(f => {
    const code = f.replace('.js', '');
    data[code] = scan(loadLocale(code));
  });

  const enPaths = new Map(data['en'].map(x => [x.path, x.val]));

  files.forEach(f => {
    const code = f.replace('.js', '');
    const list = data[code];
    const pathMap = new Map(list.map(x => [x.path, x.val]));

    const missing = [];
    const empty = [];

    for (const [p, enVal] of enPaths.entries()) {
      if (!pathMap.has(p)) {
        missing.push(p);
      } else {
        const v = pathMap.get(p);
        if (v === '' || v === null || v === undefined) {
          empty.push(p);
        }
      }
    }

    console.log(`=== Locale: ${code} ===`);
    console.log(`Missing keys vs en.js: ${missing.length}`);
    if (missing.length > 0) console.log('  Missing:', missing);
    console.log(`Empty values: ${empty.length}`);
    if (empty.length > 0) console.log('  Empty:', empty);
    console.log('');
  });
}

run();
