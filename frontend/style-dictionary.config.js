// style-dictionary.config.js
const StyleDictionary = require('style-dictionary');

// 1) Define transforms extra:
StyleDictionary.registerTransform({
  name: 'size/px',
  type: 'value',
  matcher: token => token.attributes.category === 'size',
  transformer: token => `${token.value}`
});

StyleDictionary.registerTransform({
  name: 'typography/px',
  type: 'value',
  matcher: token => token.attributes.category === 'typography' &&
                    token.attributes.type === 'fontSize',
  transformer: token => `${token.value}`
});

StyleDictionary.registerTransform({
  name: 'typography/none',
  type: 'value',
  matcher: token => token.attributes.category === 'typography' &&
                    (token.attributes.type === 'fontWeight' ||
                     token.attributes.type === 'fontFamily'),
  transformer: token => token.value
});

// 2) Crea un transformGroup que combine los tuyos con los built-in:
StyleDictionary.registerTransformGroup({
  name: 'custom/css',
  transforms: [
    'attribute/cti',     // añade atributos category, type, item
    'name/cti/kebab',    // convierte el name a kebab-case
    'size/px',           // nuestro float → px
    'typography/px',     // fontSize → px
    'typography/none',   // fontWeight & fontFamily → raw
    'color/css'          // color → hex/rgba
  ]
});

module.exports = {
  source: ['tokens-sd/**/*.json'],
  platforms: {
    css: {
      transformGroup: 'custom/css',
      buildPath: 'src/styles/',
      files: [
        {
          destination: 'tokens.css',
          format: 'css/variables',
          options: {
            // opcional: prefijo para todas las vars, p.e. 'sds'
            prefix: 'sds'
          }
        }
      ]
    },
    // si quieres un JS module con los tokens:
    js: {
      transformGroup: 'custom/css',
      buildPath: 'src/styles/',
      files: [
        {
          destination: 'tokens.js',
          format: 'javascript/es6',
          options: {
            outputReferences: true
          }
        }
      ]
    }
  }
};
