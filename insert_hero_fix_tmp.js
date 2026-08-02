const fs = require("fs");
const parser = require("@babel/parser");
const traverse = require("@babel/traverse").default;

const code = process.argv[2];
const data = JSON.parse(fs.readFileSync(process.argv[3], "utf8"))[code];
const localeFile = `src/locales/${code}.js`;

const KEYS = ["taglineLine1","taglineLine2","liveDescription","requestConsultationCta","viewWorkCta","calculateCostCta","freeBadge"];

const src = fs.readFileSync(localeFile, "utf8");
const ast = parser.parse(src, { sourceType: "module" });

let rootObj = null;
traverse(ast, {
  ExportNamedDeclaration(path) {
    const decl = path.node.declaration;
    if (!decl || decl.type !== "VariableDeclaration") return;
    rootObj = decl.declarations[0].init;
  },
});
if (!rootObj) throw new Error(`root object not found`);

const heroProp = rootObj.properties.find(p => p.key.name === "hero");
if (!heroProp) throw new Error(`hero namespace not found in ${localeFile}`);
const heroObj = heroProp.value;
const anchorProp = heroObj.properties.find(p => p.key.name === "description");
if (!anchorProp) throw new Error(`hero.description anchor not found in ${localeFile}`);

let text = "";
for (const k of KEYS) {
  if (!(k in data)) throw new Error(`data missing ${k} for ${code}`);
  text += `\n    ${k}: ${JSON.stringify(data[k])},`;
}
text = text.replace(/,$/, "");

let end = anchorProp.end;
let out;
if (src[end] === ",") {
  out = src.slice(0, end + 1) + text + src.slice(end + 1);
} else {
  out = src.slice(0, end) + "," + text + src.slice(end);
}

fs.writeFileSync(localeFile, out, "utf8");
console.log(`${code}.js updated OK`);
