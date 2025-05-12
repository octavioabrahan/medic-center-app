// convert-tokens.js
// Script para convertir tokens Figma a formato Style Dictionary
const fs = require('fs');
const path = require('path');

const INPUT_DIR = path.join(__dirname, 'tokens');
const OUTPUT_DIR = path.join(__dirname, 'tokens-sd');

// Asegúrate de que exista la carpeta de salida
if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR);
}

// Convierte {r,g,b,a} a hex (incluye alpha si <1)
function rgbaToHex({ r, g, b, a }) {
  const to255 = v => Math.round(v * 255);
  const hex = n => n.toString(16).padStart(2, '0');
  let hexColor = `#${hex(to255(r))}${hex(to255(g))}${hex(to255(b))}`;
  if (a !== undefined && a < 1) {
    hexColor += hex(to255(a));
  }
  return hexColor;
}

// Procesa sólo los tokens tipo COLOR
function parseColorTokens(variables) {
  const result = {};
  for (const v of variables) {
    if (v.type === 'COLOR' && v.resolvedValuesByMode) {
      const modeKey = Object.keys(v.resolvedValuesByMode)[0];
      const resolved = v.resolvedValuesByMode[modeKey]?.resolvedValue;
      if (resolved && typeof resolved === 'object' && 'r' in resolved) {
        // Extrae el nombre de variable CSS, p.ej. --sds-color-brand-500
        const cssVar = v.codeSyntax?.WEB
          ? v.codeSyntax.WEB.replace(/^var\(--/, '').replace(/\)$/, '')
          : v.name.toLowerCase().replace(/\s+/g, '-');
        result[cssVar] = { value: rgbaToHex(resolved) };
      }
    }
  }
  return result;
}

// Procesa sólo los tokens tipo FLOAT, les añade 'px'
function parseNumericTokens(variables) {
  const result = {};
  for (const v of variables) {
    if (v.type === 'FLOAT' && v.resolvedValuesByMode) {
      const modeKey = Object.keys(v.resolvedValuesByMode)[0];
      const number = v.resolvedValuesByMode[modeKey]?.resolvedValue;
      if (typeof number === 'number') {
        // Convierte el name a kebab-case, p.ej. "Radius/100" -> "radius-100"
        const key = v.name
          .toLowerCase()
          .replace(/\//g, '-')
          .replace(/\s+/g, '-');
        result[key] = { value: `${number}px` };
      }
    }
  }
  return result;
}

// Convierte un único archivo de tokens
function convertFile(file) {
  const inputPath = path.join(INPUT_DIR, file);
  const outputPath = path.join(OUTPUT_DIR, file);
  const data = JSON.parse(fs.readFileSync(inputPath, 'utf8'));

  if (!Array.isArray(data.variables)) {
    console.warn(`⚠️  Saltado (no es array de variables): ${file}`);
    return;
  }

  const colorTokens   = parseColorTokens(data.variables);
  const numericTokens = parseNumericTokens(data.variables);

  const styleDictFormat = {};
  if (Object.keys(colorTokens).length) {
    styleDictFormat.color = colorTokens;
  }
  if (Object.keys(numericTokens).length) {
    styleDictFormat.size = numericTokens;
  }

  fs.writeFileSync(outputPath, JSON.stringify(styleDictFormat, null, 2));
  console.log(`✅ Convertido: ${file}`);
}

// Ejecuta la conversión en lote
fs.readdirSync(INPUT_DIR)
  .filter(f => f.endsWith('.json'))
  .forEach(convertFile);

console.log('🎉 Conversión terminada. Archivos listos en tokens-sd/');
