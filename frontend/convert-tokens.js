// convert-tokens.js
// Script para convertir tokens Figma a formato Style Dictionary
const fs = require('fs');
const path = require('path');

const INPUT_DIR = path.join(__dirname, 'tokens');
const OUTPUT_DIR = path.join(__dirname, 'tokens-sd');

if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR);
}

// Convierte un objeto {r,g,b,a} a hex (incluye alpha si < 1)
function rgbaToHex({ r, g, b, a }) {
  const to255 = v => Math.round(v * 255);
  const hex = n => n.toString(16).padStart(2, '0');
  let hexColor = `#${hex(to255(r))}${hex(to255(g))}${hex(to255(b))}`;
  if (a !== undefined && a < 1) {
    hexColor += hex(to255(a));
  }
  return hexColor;
}

// Procesa los color tokens
function parseColorTokens(variables) {
  const result = {};
  for (const v of variables) {
    if (v.codeSyntax && v.codeSyntax.WEB && v.resolvedValuesByMode) {
      const modeKey = Object.keys(v.resolvedValuesByMode)[0];
      const resolved = v.resolvedValuesByMode[modeKey]?.resolvedValue;
      if (resolved && typeof resolved === 'object' && 'r' in resolved) {
        // Extrae el nombre de la variable CSS, p.ej. --sds-color-brand-500
        const cssVar = v.codeSyntax.WEB.replace(/^var\(--/, '').replace(/\)$/, '');
        result[cssVar] = { value: rgbaToHex(resolved) };
      }
    }
  }
  return result;
}

// Procesa los tokens numéricos (FLOAT) y les añade 'px'
function parseNumericTokens(variables) {
  const result = {};
  for (const v of variables) {
    if (v.type === 'FLOAT' && v.resolvedValuesByMode) {
      const modeKey = Object.keys(v.resolvedValuesByMode)[0];
      const number = v.resolvedValuesByMode[modeKey]?.resolvedValue;
      if (typeof number === 'number') {
        // Convertir name a kebab-case, p.ej. "Radius/100" -> "radius-100"
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

function convertFile(file) {
  const inputPath = path.join(INPUT_DIR, file);
  const outputPath = path.join(OUTPUT_DIR, file);
  const data = JSON.parse(fs.readFileSync(inputPath, 'utf8'));

  if (!Array.isArray(data.variables)) {
    console.log(`❌ Saltado (sin "variables"): ${file}`);
    return;
  }

  // Separamos color y numeric
  const colorTokens   = parseColorTokens(data.variables);
  const numericTokens = parseNumericTokens(data.variables);

  // Construimos el objeto final para Style Dictionary
  const styleDictFormat = {};
  if (Object.keys(colorTokens).length)       styleDictFormat.color      = colorTokens;
  if (Object.keys(numericTokens).length)     styleDictFormat.size       = numericTokens;
  if (Object.keys(typographyTokens).length)  styleDictFormat.typography = typographyTokens;
  if (Object.keys(responsiveTokens).length)  styleDictFormat.responsive = responsiveTokens;


  fs.writeFileSync(outputPath, JSON.stringify(styleDictFormat, null, 2));
  console.log(`✅ Convertido: ${file}`);
}

// Ejecuta la conversión para cada JSON en tokens/
fs.readdirSync(INPUT_DIR)
  .filter(f => f.endsWith('.json'))
  .forEach(convertFile);

console.log('🎉 Conversión terminada. Archivos listos en tokens-sd/');
