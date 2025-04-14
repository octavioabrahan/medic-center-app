import React from 'react';

const VistaFigmaPaso2 = () => {
  return (
    <div style={{width: '100%', height: '100%', flexDirection: 'column', justifyContent: 'flex-start', alignItems: 'flex-start', gap: 32, display: 'inline-flex'}}>
      {/* Botón volver */}
      <div style={{width: 960, justifyContent: 'flex-start', alignItems: 'center', gap: 16, display: 'inline-flex'}}>
        <div style={{padding: 12, overflow: 'hidden', borderRadius: 8, justifyContent: 'center', alignItems: 'center', gap: 8, display: 'flex'}}>
          <div style={{width: 16, height: 16, position: 'relative', overflow: 'hidden'}}>
            <div style={{width: 9.33, height: 9.33, left: 3.33, top: 3.33, position: 'absolute', outline: '1.60px #1E1E1E solid', outlineOffset: '-0.80px'}} />
          </div>
          <div style={{color: '#303030', fontSize: 16, fontFamily: 'Inter', fontWeight: '400', lineHeight: 16}}>Volver al paso anterior</div>
        </div>
      </div>

      {/* Título */}
      <div style={{width: 960, flexDirection: 'column', justifyContent: 'flex-start', alignItems: 'center', gap: 8, display: 'flex'}}>
        <div style={{textAlign: 'center', color: '#20377A', fontSize: 24, fontFamily: 'Inter', fontWeight: '600', lineHeight: '28.80px'}}>Selecciona la especialidad, el médico y el día.</div>
      </div>

      {/* Tipo de atención */}
      <div style={{width: 960, flexDirection: 'column', justifyContent: 'flex-start', alignItems: 'flex-start', gap: 8, display: 'flex'}}>
        <div style={{color: '#1E1E1E', fontSize: 16}}>Selecciona el tipo de atención</div>
        <div style={{display: 'inline-flex', gap: 24}}>
          {/* Consulta médica */}
          <div style={{padding: 12, background: 'white', borderRadius: 8, outline: '1px #D9D9D9 solid', display: 'flex', gap: 24}}>
            <div style={{display: 'inline-flex', flexDirection: 'column'}}>
              <div style={{display: 'inline-flex', gap: 12, alignItems: 'center'}}>
                <div style={{width: 16, height: 16, background: 'white', borderRadius: 9999, outline: '1px #20377A solid'}}>
                  <div style={{width: 10, height: 10, margin: 3, background: '#14214B', borderRadius: 9999}}></div>
                </div>
                <div style={{color: '#1E1E1E', fontSize: 16}}>Consulta médica</div>
              </div>
            </div>
          </div>
          {/* Estudio */}
          <div style={{padding: 12, background: 'white', borderRadius: 8, outline: '1px #D9D9D9 solid', display: 'flex', gap: 24}}>
            <div style={{display: 'inline-flex', flexDirection: 'column'}}>
              <div style={{display: 'inline-flex', gap: 12, alignItems: 'center'}}>
                <div style={{width: 16, height: 16, background: 'white', borderRadius: 9999, outline: '1px #20377A solid'}}></div>
                <div style={{color: '#1E1E1E', fontSize: 16}}>Estudio</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Campos Especialidad y Profesional */}
      <div style={{width: 960, display: 'inline-flex', gap: 24}}>
        {["Especialidad", "Profesional"].map((label, idx) => (
          <div key={idx} style={{display: 'inline-flex', flexDirection: 'column', gap: 8, flex: '1 1 0'}}>
            <div style={{color: '#1E1E1E', fontSize: 16}}>{label}</div>
            <div style={{height: 40, minWidth: 240, padding: '12px 12px 12px 16px', background: 'white', borderRadius: 8, outline: '1px #D9D9D9 solid', display: 'inline-flex', alignItems: 'center', gap: 8}}>
              <div style={{flex: '1 1 0', color: '#1E1E1E', fontSize: 16}}>{label === 'Especialidad' ? 'PEDIATRIA' : 'ILLICHS SUAREZ'}</div>
              <div style={{width: 16, height: 16}}>
                <div style={{width: 8, height: 4, margin: '6px 4px', outline: '1.60px #1E1E1E solid'}} />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Botón continuar */}
      <div style={{width: 960, justifyContent: 'flex-end', alignItems: 'center', gap: 16, display: 'inline-flex'}}>
        <div style={{padding: 12, background: '#20377A', color: '#F0F3FF', borderRadius: 8, display: 'flex', justifyContent: 'center', alignItems: 'center'}}>
          <div style={{fontSize: 16}}>Continuar</div>
        </div>
      </div>
    </div>
  );
};

export default VistaFigmaPaso2;