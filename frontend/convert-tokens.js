// Script para convertir tokens Figma a formato Style Dictionary
const fs = require('fs');
const path = require('path');

const INPUT_DIR = path.join(__dirname, 'tokens');
const OUTPUT_DIR = path.join(__dirname, 'tokens-sd');

if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR);
}

function rgbaToHex({ r, g, b, a }) {
  const to255 = v => Math.round(v * 255);
  const hex = n => n.toString(16).padStart(2, '0');
  let hexColor = `#${hex(to255(r))}${hex(to255(g))}${hex(to255(b))}`;
  if (a !== undefined && a < 1) {
    hexColor += hex(to255(a));
  }
  return hexColor;
}

function parseColorTokens(variables) {
  const result = {};
  for (const v of variables) {
    if (v.codeSyntax && v.codeSyntax.WEB && v.resolvedValuesByMode) {
      // Usar el modo claro (primer key)
      const modeKey = Object.keys(v.resolvedValuesByMode)[0];
      const resolved = v.resolvedValuesByMode[modeKey]?.resolvedValue;
      if (resolved) {
        // Extraer nombre de variable CSS
        const cssVar = v.codeSyntax.WEB.replace('var(--', '').replace(')', '');
        // Guardar en estructura Style Dictionary
        result[cssVar] = { value: rgbaToHex(resolved) };
      }
    }
  }
  return { color: result };
}

function convertFile(file) {
  const inputPath = path.join(INPUT_DIR, file);
  const outputPath = path.join(OUTPUT_DIR, file);
  const data = JSON.parse(fs.readFileSync(inputPath, 'utf8'));
  if (Array.isArray(data.variables)) {
    // Color tokens
    const converted = parseColorTokens(data.variables);
    fs.writeFileSync(outputPath, JSON.stringify(converted, null, 2));
    console.log(`Convertido: ${file}`);
  } else {
    // Otros tipos: copiar sin cambios o implementar lógica adicional
    fs.writeFileSync(outputPath, JSON.stringify({}, null, 2));
    console.log(`Saltado (no implementado): ${file}`);
  }
}

fs.readdirSync(INPUT_DIR)
  .filter(f => f.endsWith('.json'))
  .forEach(convertFile);

console.log('Conversión terminada. Archivos listos en tokens-sd/');
