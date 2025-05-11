import React from 'react';
import '../../styles/variables.css';

const ProfesionalesTest = () => {
  return (
    <div style={{width: 1106, height: 768, position: 'relative'}}>
      {/* Header con título y botones */}
      <div style={{width: 1042, paddingBottom: 12, left: 32, top: 32, position: 'absolute', borderBottom: '1px var(--Border-Default-Default, #D9D9D9) solid', justifyContent: 'space-between', alignItems: 'center', display: 'inline-flex'}}>
        <div style={{paddingTop: 8, paddingBottom: 4, paddingLeft: 16, paddingRight: 16, borderRadius: 8, flexDirection: 'column', justifyContent: 'flex-start', alignItems: 'flex-start', display: 'inline-flex'}}>
          <div style={{justifyContent: 'flex-start', alignItems: 'flex-start', display: 'inline-flex'}}>
            <div style={{color: 'var(--Text-Default-Default, #1E1E1E)', fontSize: 16, fontFamily: 'Inter', fontWeight: '600', lineHeight: 22.40, wordWrap: 'break-word'}}>Profesionales</div>
          </div>
        </div>
        <div style={{justifyContent: 'flex-start', alignItems: 'center', gap: 16, display: 'flex'}}>
          <div data-has-icon-start="false" data-size="Medium" data-state="Default" data-variant="Neutral" style={{padding: 12, background: 'var(--Background-Neutral-Tertiary, #E3E3E3)', overflow: 'hidden', borderRadius: 8, outline: '1px var(--Border-Neutral-Secondary, #767676) solid', outlineOffset: '-1px', justifyContent: 'center', alignItems: 'center', gap: 8, display: 'flex'}}>
            <div style={{color: 'var(--Text-Default-Default, #1E1E1E)', fontSize: 16, fontFamily: 'Inter', fontWeight: '400', lineHeight: 22.40, wordWrap: 'break-word'}}>Crear especialidad</div>
          </div>
          <div data-has-icon-start="true" data-size="Medium" data-state="Default" data-variant="Primary" style={{padding: 12, background: 'var(--Background-Brand-Default, #20377A)', overflow: 'hidden', borderRadius: 8, outline: '1px var(--Border-Brand-Default, #20377A) solid', outlineOffset: '-1px', justifyContent: 'center', alignItems: 'center', gap: 8, display: 'flex'}}>
            <div style={{width: 16, height: 16, position: 'relative', overflow: 'hidden'}}>
              <div style={{width: 14.37, height: 12.80, left: 0.83, top: 1.60, position: 'absolute', background: 'var(--Icon-Brand-On-Brand, #F0F3FF)'}}></div>
            </div>
            <div style={{color: 'var(--Text-Brand-On-Brand, #F0F3FF)', fontSize: 16, fontFamily: 'Inter', fontWeight: '400', lineHeight: 22.40, wordWrap: 'break-word'}}>Agregar nuevo profesional</div>
          </div>
        </div>
      </div>

      {/* Sección de filtros y búsqueda */}
      <div style={{width: 1042, left: 32, top: 108, position: 'absolute', justifyContent: 'flex-start', alignItems: 'center', gap: 24, display: 'inline-flex'}}>
        <div style={{width: 327, justifyContent: 'flex-start', alignItems: 'center', gap: 24, display: 'flex'}}>
          <div data-state="Default" data-value-type="Placeholder" style={{flex: '1 1 0', paddingLeft: 16, paddingRight: 16, paddingTop: 12, paddingBottom: 12, background: 'var(--Background-Default-Default, white)', overflow: 'hidden', borderRadius: 9999, outline: '1px var(--Border-Default-Default, #D9D9D9) solid', outlineOffset: '-0.50px', justifyContent: 'flex-start', alignItems: 'center', gap: 8, display: 'flex'}}>
            <div style={{flex: '1 1 0', color: 'var(--Text-Default-Tertiary, #B3B3B3)', fontSize: 16, fontFamily: 'Inter', fontWeight: '400', lineHeight: 16, wordWrap: 'break-word'}}>Buscar por nombre</div>
            <div data-size="16" style={{width: 16, height: 16, position: 'relative', overflow: 'hidden'}}>
              <div style={{width: 12, height: 12, left: 2, top: 2, position: 'absolute', outline: '1.60px var(--Icon-Default-Default, #1E1E1E) solid', outlineOffset: '-0.80px'}}></div>
            </div>
          </div>
        </div>
        <div data-has-description="false" data-has-error="true" data-has-label="false" data-open="false" data-state="Default" data-value-type="Default" style={{flex: '1 1 0', flexDirection: 'column', justifyContent: 'flex-start', alignItems: 'flex-start', gap: 8, display: 'inline-flex'}}>
          <div style={{alignSelf: 'stretch', height: 40, minWidth: 240, paddingTop: 12, paddingBottom: 12, paddingLeft: 16, paddingRight: 12, background: 'var(--Background-Default-Default, white)', borderRadius: 8, outline: '1px var(--Border-Default-Default, #D9D9D9) solid', outlineOffset: '-0.50px', justifyContent: 'flex-start', alignItems: 'center', gap: 8, display: 'inline-flex'}}>
            <div style={{flex: '1 1 0', color: 'var(--Text-Default-Default, #1E1E1E)', fontSize: 16, fontFamily: 'Inter', fontWeight: '400', lineHeight: 16, wordWrap: 'break-word'}}>Todas las especialidades</div>
            <div data-size="16" style={{width: 16, height: 16, position: 'relative', overflow: 'hidden'}}>
              <div style={{width: 8, height: 4, left: 4, top: 6, position: 'absolute', outline: '1.60px var(--Icon-Default-Default, #1E1E1E) solid', outlineOffset: '-0.80px'}}></div>
            </div>
          </div>
        </div>
        <div data-has-description="false" data-state="Disabled" data-value-type="Unchecked" style={{flexDirection: 'column', justifyContent: 'flex-start', alignItems: 'flex-start', display: 'inline-flex'}}>
          <div style={{justifyContent: 'flex-start', alignItems: 'center', gap: 12, display: 'inline-flex'}}>
            <div style={{width: 16, height: 16, background: 'var(--Background-Disabled-Default, #D9D9D9)', borderRadius: 4, outline: '1px var(--border-disabled-secondary, #B2B2B2) solid', outlineOffset: '-1px', justifyContent: 'center', alignItems: 'center', gap: 10, display: 'flex'}}></div>
            <div style={{color: 'var(--Text-Default-Default, #1E1E1E)', fontSize: 16, fontFamily: 'Inter', fontWeight: '400', lineHeight: 22.40, wordWrap: 'break-word'}}>Mostrar archivados</div>
          </div>
        </div>
        <div style={{justifyContent: 'flex-start', alignItems: 'flex-start', gap: 8, display: 'flex'}}>
          <div data-show-icon="true" data-state="On" style={{padding: 8, background: 'var(--Background-Brand-Secondary, #E6E6E6)', borderRadius: 8, justifyContent: 'center', alignItems: 'center', gap: 8, display: 'flex'}}>
            <div data-size="16" style={{width: 16, height: 16, position: 'relative', overflow: 'hidden'}}>
              <div style={{width: 10.67, height: 7.33, left: 2.67, top: 4, position: 'absolute', outline: '1.60px var(--Icon-Brand-On-Brand-Secondary, #1E1E1E) solid', outlineOffset: '-0.80px'}}></div>
            </div>
            <div style={{justifyContent: 'center', display: 'flex', flexDirection: 'column', color: 'var(--Text-Brand-On-Brand-Secondary, #1E1E1E)', fontSize: 16, fontFamily: 'Inter', fontWeight: '400', lineHeight: 16, wordWrap: 'break-word'}}>A → Z</div>
          </div>
          <div data-show-icon="true" data-state="Off" style={{padding: 8, background: 'var(--Background-Brand-Tertiary, #F5F5F5)', borderRadius: 8, justifyContent: 'center', alignItems: 'center', gap: 8, display: 'flex'}}>
            <div style={{justifyContent: 'center', display: 'flex', flexDirection: 'column', color: 'var(--Text-Brand-Tertiary, #757575)', fontSize: 16, fontFamily: 'Inter', fontWeight: '400', lineHeight: 16, wordWrap: 'break-word'}}>Z → A</div>
          </div>
        </div>
      </div>

      {/* Tabla de profesionales */}
      <div style={{width: 1042, left: 32, top: 172, position: 'absolute', overflow: 'hidden', borderRadius: 8, outline: '1px var(--Border-Default-Default, #D9D9D9) solid', outlineOffset: '-1px', justifyContent: 'flex-start', alignItems: 'center', display: 'inline-flex'}}>
        {/* Columna de Cédula */}
        <div style={{alignSelf: 'stretch', flexDirection: 'column', justifyContent: 'flex-start', alignItems: 'flex-start', display: 'inline-flex'}}>
          <div style={{alignSelf: 'stretch', paddingLeft: 12, paddingRight: 12, paddingTop: 8, paddingBottom: 8, background: 'var(--Schemes-Surface-Bright, #FAF8FF)', borderBottom: '1px var(--Border-Default-Default, #D9D9D9) solid', flexDirection: 'column', justifyContent: 'center', alignItems: 'flex-start', display: 'flex'}}>
            <div style={{justifyContent: 'center', alignItems: 'center', display: 'inline-flex'}}>
              <div style={{color: 'var(--Text-Default-Default, #1E1E1E)', fontSize: 14, fontFamily: 'Inter', fontWeight: '600', lineHeight: 19.60, wordWrap: 'break-word'}}>Cédula</div>
            </div>
          </div>
          {Array(6).fill().map((_, index) => (
            <div key={`cedula-${index}`} style={{alignSelf: 'stretch', flex: '1 1 0', paddingLeft: 12, paddingRight: 12, paddingTop: 8, paddingBottom: 8, background: 'var(--Schemes-Surface-Container-Lowest, white)', borderBottom: '1px var(--Border-Default-Default, #D9D9D9) solid', flexDirection: 'column', justifyContent: 'center', alignItems: 'flex-start', display: 'flex'}}>
              <div style={{justifyContent: 'center', alignItems: 'center', display: 'inline-flex'}}>
                <div style={{color: 'var(--Text-Default-Default, #1E1E1E)', fontSize: 16, fontFamily: 'Inter', fontWeight: '400', lineHeight: 22.40, wordWrap: 'break-word'}}>00.000.000</div>
              </div>
            </div>
          ))}
        </div>

        {/* Columna de Profesional */}
        <div style={{flex: '1 1 0', flexDirection: 'column', justifyContent: 'flex-start', alignItems: 'flex-start', display: 'inline-flex'}}>
          <div style={{alignSelf: 'stretch', paddingLeft: 12, paddingRight: 12, paddingTop: 8, paddingBottom: 8, background: 'var(--Schemes-Surface-Bright, #FAF8FF)', borderBottom: '1px var(--Border-Default-Default, #D9D9D9) solid', flexDirection: 'column', justifyContent: 'center', alignItems: 'flex-start', display: 'flex'}}>
            <div style={{justifyContent: 'center', alignItems: 'center', display: 'inline-flex'}}>
              <div style={{color: 'var(--Text-Default-Default, #1E1E1E)', fontSize: 14, fontFamily: 'Inter', fontWeight: '600', lineHeight: 19.60, wordWrap: 'break-word'}}>Profesional</div>
            </div>
          </div>
          <div style={{alignSelf: 'stretch', height: 58, paddingLeft: 12, paddingRight: 12, paddingTop: 8, paddingBottom: 8, background: 'var(--Schemes-Surface-Container-Lowest, white)', borderBottom: '1px var(--Border-Default-Default, #D9D9D9) solid', flexDirection: 'column', justifyContent: 'center', alignItems: 'flex-start', display: 'flex'}}>
            <div style={{justifyContent: 'center', alignItems: 'center', display: 'inline-flex'}}>
              <div style={{color: 'var(--Text-Default-Default, #1E1E1E)', fontSize: 16, fontFamily: 'Inter', fontWeight: '400', lineHeight: 22.40, wordWrap: 'break-word'}}>ENDHER CASTILLO</div>
            </div>
          </div>
          <div style={{alignSelf: 'stretch', height: 58, paddingLeft: 12, paddingRight: 12, paddingTop: 8, paddingBottom: 8, background: 'var(--Schemes-Surface-Container-Lowest, white)', borderBottom: '1px var(--Border-Default-Default, #D9D9D9) solid', flexDirection: 'column', justifyContent: 'center', alignItems: 'flex-start', display: 'flex'}}>
            <div style={{justifyContent: 'center', alignItems: 'center', display: 'inline-flex'}}>
              <div style={{color: 'var(--Text-Default-Default, #1E1E1E)', fontSize: 16, fontFamily: 'Inter', fontWeight: '400', lineHeight: 22.40, wordWrap: 'break-word'}}>BERENICE FIGUEREDO</div>
            </div>
          </div>
          <div style={{alignSelf: 'stretch', height: 58, paddingLeft: 12, paddingRight: 12, paddingTop: 8, paddingBottom: 8, background: 'var(--Schemes-Surface-Container-Lowest, white)', borderBottom: '1px var(--Border-Default-Default, #D9D9D9) solid', flexDirection: 'column', justifyContent: 'center', alignItems: 'flex-start', display: 'flex'}}>
            <div style={{justifyContent: 'center', alignItems: 'center', display: 'inline-flex'}}>
              <div style={{color: 'var(--Text-Default-Default, #1E1E1E)', fontSize: 16, fontFamily: 'Inter', fontWeight: '400', lineHeight: 22.40, wordWrap: 'break-word'}}>LUIS AMAYA</div>
            </div>
          </div>
          <div style={{alignSelf: 'stretch', height: 58, paddingLeft: 12, paddingRight: 12, paddingTop: 8, paddingBottom: 8, background: 'var(--Schemes-Surface-Container-Lowest, white)', borderBottom: '1px var(--Border-Default-Default, #D9D9D9) solid', flexDirection: 'column', justifyContent: 'center', alignItems: 'flex-start', display: 'flex'}}>
            <div style={{justifyContent: 'center', alignItems: 'center', display: 'inline-flex'}}>
              <div style={{color: 'var(--Text-Default-Default, #1E1E1E)', fontSize: 16, fontFamily: 'Inter', fontWeight: '400', lineHeight: 22.40, wordWrap: 'break-word'}}>YOHANKARELYS FERNANDEZ</div>
            </div>
          </div>
          <div style={{alignSelf: 'stretch', height: 58, paddingLeft: 12, paddingRight: 12, paddingTop: 8, paddingBottom: 8, background: 'var(--Schemes-Surface-Container-Lowest, white)', borderBottom: '1px var(--Border-Default-Default, #D9D9D9) solid', flexDirection: 'column', justifyContent: 'center', alignItems: 'flex-start', display: 'flex'}}>
            <div style={{justifyContent: 'center', alignItems: 'center', display: 'inline-flex'}}>
              <div style={{color: 'var(--Text-Default-Default, #1E1E1E)', fontSize: 16, fontFamily: 'Inter', fontWeight: '400', lineHeight: 22.40, wordWrap: 'break-word'}}>EVA PAEZ</div>
            </div>
          </div>
          <div style={{alignSelf: 'stretch', height: 58, paddingLeft: 12, paddingRight: 12, paddingTop: 8, paddingBottom: 8, background: 'var(--Schemes-Surface-Container-Lowest, white)', borderBottom: '1px var(--Border-Default-Default, #D9D9D9) solid', flexDirection: 'column', justifyContent: 'center', alignItems: 'flex-start', display: 'flex'}}>
            <div style={{justifyContent: 'center', alignItems: 'center', display: 'inline-flex'}}>
              <div style={{color: 'var(--Text-Default-Default, #1E1E1E)', fontSize: 16, fontFamily: 'Inter', fontWeight: '400', lineHeight: 22.40, wordWrap: 'break-word'}}>MARIANGEL MONTES</div>
            </div>
          </div>
        </div>

        {/* Columna de Especialidad */}
        <div style={{flexDirection: 'column', justifyContent: 'flex-start', alignItems: 'flex-start', display: 'inline-flex'}}>
          <div style={{alignSelf: 'stretch', paddingLeft: 12, paddingRight: 12, paddingTop: 8, paddingBottom: 8, background: 'var(--Schemes-Surface-Bright, #FAF8FF)', borderBottom: '1px var(--Border-Default-Default, #D9D9D9) solid', flexDirection: 'column', justifyContent: 'center', alignItems: 'flex-start', display: 'flex'}}>
            <div style={{justifyContent: 'center', alignItems: 'center', display: 'inline-flex'}}>
              <div style={{color: 'var(--Text-Default-Default, #1E1E1E)', fontSize: 14, fontFamily: 'Inter', fontWeight: '600', lineHeight: 19.60, wordWrap: 'break-word'}}>Especialidad</div>
            </div>
          </div>
          <div style={{alignSelf: 'stretch', height: 58, paddingLeft: 12, paddingRight: 12, paddingTop: 8, paddingBottom: 8, background: 'var(--Schemes-Surface-Container-Lowest, white)', borderBottom: '1px var(--Border-Default-Default, #D9D9D9) solid', flexDirection: 'column', justifyContent: 'center', alignItems: 'flex-start', display: 'flex'}}>
            <div style={{alignSelf: 'stretch', justifyContent: 'flex-start', alignItems: 'center', display: 'inline-flex'}}>
              <div style={{color: 'var(--Text-Default-Default, #1E1E1E)', fontSize: 16, fontFamily: 'Inter', fontWeight: '400', lineHeight: 22.40, wordWrap: 'break-word'}}>CARDIOLOGIA</div>
            </div>
          </div>
          <div style={{height: 58, paddingLeft: 12, paddingRight: 12, paddingTop: 8, paddingBottom: 8, background: 'var(--Schemes-Surface-Container-Lowest, white)', borderBottom: '1px var(--Border-Default-Default, #D9D9D9) solid', flexDirection: 'column', justifyContent: 'center', alignItems: 'flex-start', display: 'flex'}}>
            <div style={{alignSelf: 'stretch', justifyContent: 'flex-start', alignItems: 'center', display: 'inline-flex'}}>
              <div style={{color: 'var(--Text-Default-Default, #1E1E1E)', fontSize: 16, fontFamily: 'Inter', fontWeight: '400', lineHeight: 22.40, wordWrap: 'break-word'}}>MASTOLOGIA</div>
            </div>
          </div>
          <div style={{alignSelf: 'stretch', height: 58, paddingLeft: 12, paddingRight: 12, paddingTop: 8, paddingBottom: 8, background: 'var(--Schemes-Surface-Container-Lowest, white)', borderBottom: '1px var(--Border-Default-Default, #D9D9D9) solid', flexDirection: 'column', justifyContent: 'center', alignItems: 'flex-start', display: 'flex'}}>
            <div style={{alignSelf: 'stretch', justifyContent: 'flex-start', alignItems: 'center', display: 'inline-flex'}}>
              <div style={{color: 'var(--Text-Default-Default, #1E1E1E)', fontSize: 16, fontFamily: 'Inter', fontWeight: '400', lineHeight: 22.40, wordWrap: 'break-word'}}>CIRUGIA GENERAL</div>
            </div>
          </div>
          <div style={{alignSelf: 'stretch', height: 58, paddingLeft: 12, paddingRight: 12, paddingTop: 8, paddingBottom: 8, background: 'var(--Schemes-Surface-Container-Lowest, white)', borderBottom: '1px var(--Border-Default-Default, #D9D9D9) solid', flexDirection: 'column', justifyContent: 'center', alignItems: 'flex-start', display: 'flex'}}>
            <div style={{alignSelf: 'stretch', justifyContent: 'flex-start', alignItems: 'center', display: 'inline-flex'}}>
              <div style={{color: 'var(--Text-Default-Default, #1E1E1E)', fontSize: 16, fontFamily: 'Inter', fontWeight: '400', lineHeight: 22.40, wordWrap: 'break-word'}}>DERMATOLOGIA</div>
            </div>
          </div>
          <div style={{alignSelf: 'stretch', height: 58, paddingLeft: 12, paddingRight: 12, paddingTop: 8, paddingBottom: 8, background: 'var(--Schemes-Surface-Container-Lowest, white)', borderBottom: '1px var(--Border-Default-Default, #D9D9D9) solid', flexDirection: 'column', justifyContent: 'center', alignItems: 'flex-start', display: 'flex'}}>
            <div style={{alignSelf: 'stretch', justifyContent: 'flex-start', alignItems: 'center', display: 'inline-flex'}}>
              <div style={{color: 'var(--Text-Default-Default, #1E1E1E)', fontSize: 16, fontFamily: 'Inter', fontWeight: '400', lineHeight: 22.40, wordWrap: 'break-word'}}>ECOGRAFISTA</div>
            </div>
          </div>
          <div style={{alignSelf: 'stretch', height: 58, paddingLeft: 12, paddingRight: 12, paddingTop: 8, paddingBottom: 8, background: 'var(--Schemes-Surface-Container-Lowest, white)', borderBottom: '1px var(--Border-Default-Default, #D9D9D9) solid', flexDirection: 'column', justifyContent: 'center', alignItems: 'flex-start', display: 'flex'}}>
            <div style={{alignSelf: 'stretch', justifyContent: 'flex-start', alignItems: 'center', display: 'inline-flex'}}>
              <div style={{color: 'var(--Text-Default-Default, #1E1E1E)', fontSize: 16, fontFamily: 'Inter', fontWeight: '400', lineHeight: 22.40, wordWrap: 'break-word'}}>ESTUDIO</div>
            </div>
          </div>
        </div>

        {/* Columna de Categoría */}
        <div style={{flexDirection: 'column', justifyContent: 'flex-start', alignItems: 'flex-start', display: 'inline-flex'}}>
          <div style={{alignSelf: 'stretch', paddingLeft: 12, paddingRight: 12, paddingTop: 8, paddingBottom: 8, background: 'var(--Schemes-Surface-Bright, #FAF8FF)', borderBottom: '1px var(--Border-Default-Default, #D9D9D9) solid', flexDirection: 'column', justifyContent: 'center', alignItems: 'flex-start', display: 'flex'}}>
            <div style={{justifyContent: 'center', alignItems: 'center', display: 'inline-flex'}}>
              <div style={{color: 'var(--Text-Default-Default, #1E1E1E)', fontSize: 14, fontFamily: 'Inter', fontWeight: '600', lineHeight: 19.60, wordWrap: 'break-word'}}>Categoría</div>
            </div>
          </div>
          <div style={{alignSelf: 'stretch', height: 58, paddingLeft: 12, paddingRight: 12, paddingTop: 8, paddingBottom: 8, background: 'var(--Schemes-Surface-Container-Lowest, white)', borderBottom: '1px var(--Border-Default-Default, #D9D9D9) solid', flexDirection: 'column', justifyContent: 'center', alignItems: 'flex-start', display: 'flex'}}>
            <div style={{alignSelf: 'stretch', justifyContent: 'flex-start', alignItems: 'center', display: 'inline-flex'}}>
              <div style={{color: 'var(--Text-Default-Default, #1E1E1E)', fontSize: 16, fontFamily: 'Inter', fontWeight: '400', lineHeight: 22.40, wordWrap: 'break-word'}}>Consulta, Estudio</div>
            </div>
          </div>
          <div style={{height: 58, paddingLeft: 12, paddingRight: 12, paddingTop: 8, paddingBottom: 8, background: 'var(--Schemes-Surface-Container-Lowest, white)', borderBottom: '1px var(--Border-Default-Default, #D9D9D9) solid', flexDirection: 'column', justifyContent: 'center', alignItems: 'flex-start', display: 'flex'}}>
            <div style={{alignSelf: 'stretch', justifyContent: 'flex-start', alignItems: 'center', display: 'inline-flex'}}>
              <div style={{color: 'var(--Text-Default-Default, #1E1E1E)', fontSize: 16, fontFamily: 'Inter', fontWeight: '400', lineHeight: 22.40, wordWrap: 'break-word'}}>Consulta, Estudio</div>
            </div>
          </div>
          <div style={{alignSelf: 'stretch', height: 58, paddingLeft: 12, paddingRight: 12, paddingTop: 8, paddingBottom: 8, background: 'var(--Schemes-Surface-Container-Lowest, white)', borderBottom: '1px var(--Border-Default-Default, #D9D9D9) solid', flexDirection: 'column', justifyContent: 'center', alignItems: 'flex-start', display: 'flex'}}>
            <div style={{alignSelf: 'stretch', justifyContent: 'flex-start', alignItems: 'center', display: 'inline-flex'}}>
              <div style={{color: 'var(--Text-Default-Default, #1E1E1E)', fontSize: 16, fontFamily: 'Inter', fontWeight: '400', lineHeight: 22.40, wordWrap: 'break-word'}}>Consulta</div>
            </div>
          </div>
          <div style={{alignSelf: 'stretch', height: 58, paddingLeft: 12, paddingRight: 12, paddingTop: 8, paddingBottom: 8, background: 'var(--Schemes-Surface-Container-Lowest, white)', borderBottom: '1px var(--Border-Default-Default, #D9D9D9) solid', flexDirection: 'column', justifyContent: 'center', alignItems: 'flex-start', display: 'flex'}}>
            <div style={{alignSelf: 'stretch', justifyContent: 'flex-start', alignItems: 'center', display: 'inline-flex'}}>
              <div style={{color: 'var(--Text-Default-Default, #1E1E1E)', fontSize: 16, fontFamily: 'Inter', fontWeight: '400', lineHeight: 22.40, wordWrap: 'break-word'}}>Consulta</div>
            </div>
          </div>
          <div style={{alignSelf: 'stretch', height: 58, paddingLeft: 12, paddingRight: 12, paddingTop: 8, paddingBottom: 8, background: 'var(--Schemes-Surface-Container-Lowest, white)', borderBottom: '1px var(--Border-Default-Default, #D9D9D9) solid', flexDirection: 'column', justifyContent: 'center', alignItems: 'flex-start', display: 'flex'}}>
            <div style={{alignSelf: 'stretch', justifyContent: 'flex-start', alignItems: 'center', display: 'inline-flex'}}>
              <div style={{color: 'var(--Text-Default-Default, #1E1E1E)', fontSize: 16, fontFamily: 'Inter', fontWeight: '400', lineHeight: 22.40, wordWrap: 'break-word'}}>Consulta</div>
            </div>
          </div>
          <div style={{alignSelf: 'stretch', height: 58, paddingLeft: 12, paddingRight: 12, paddingTop: 8, paddingBottom: 8, background: 'var(--Schemes-Surface-Container-Lowest, white)', borderBottom: '1px var(--Border-Default-Default, #D9D9D9) solid', flexDirection: 'column', justifyContent: 'center', alignItems: 'flex-start', display: 'flex'}}>
            <div style={{alignSelf: 'stretch', justifyContent: 'flex-start', alignItems: 'center', display: 'inline-flex'}}>
              <div style={{color: 'var(--Text-Default-Default, #1E1E1E)', fontSize: 16, fontFamily: 'Inter', fontWeight: '400', lineHeight: 22.40, wordWrap: 'break-word'}}>Estudio</div>
            </div>
          </div>
        </div>

        {/* Columna de Precio USD */}
        <div style={{flexDirection: 'column', justifyContent: 'flex-start', alignItems: 'flex-start', display: 'inline-flex'}}>
          <div style={{paddingLeft: 12, paddingRight: 12, paddingTop: 8, paddingBottom: 8, background: 'var(--Schemes-Surface-Bright, #FAF8FF)', borderBottom: '1px var(--Border-Default-Default, #D9D9D9) solid', flexDirection: 'column', justifyContent: 'center', alignItems: 'flex-start', display: 'flex'}}>
            <div style={{justifyContent: 'center', alignItems: 'center', display: 'inline-flex'}}>
              <div style={{fontSize: 14, fontFamily: 'Inter', fontWeight: '600', lineHeight: 19.60, wordWrap: 'break-word'}}>Precio USD</div>
            </div>
          </div>
          {Array(6).fill().map((_, index) => (
            <div key={`precio-${index}`} style={{alignSelf: 'stretch', height: 58, paddingLeft: 12, paddingRight: 12, paddingTop: 8, paddingBottom: 8, background: 'var(--Schemes-Surface-Container-Lowest, white)', borderBottom: '1px var(--Border-Default-Default, #D9D9D9) solid', justifyContent: 'flex-start', alignItems: 'center', display: 'inline-flex'}}>
              <div data-size="Small" data-state="Default" data-variant="Subtle" style={{padding: 8, overflow: 'hidden', borderRadius: 32, justifyContent: 'center', alignItems: 'center', display: 'flex'}}>
                <div data-size="20" style={{width: 20, height: 20, position: 'relative', overflow: 'hidden'}}>
                  <div style={{width: 16.77, height: 16.77, left: 1.67, top: 1.57, position: 'absolute', outline: '2px var(--Icon-Default-Default, #1E1E1E) solid', outlineOffset: '-1px'}}></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Notificación de profesional agregado */}
      <div data-dismissible="false" data-has-button="false" data-has-icon="true" data-variant="Message" style={{padding: 16, left: 439, top: 694, position: 'absolute', background: 'var(--Background-Default-Default, white)', boxShadow: '0px 4px 4px -4px rgba(12, 12, 13, 0.05)', borderRadius: 8, outline: '1px var(--Border-Default-Secondary, #757575) solid', outlineOffset: '-1px', justifyContent: 'flex-start', alignItems: 'center', gap: 12, display: 'inline-flex'}}>
        <div style={{justifyContent: 'flex-start', alignItems: 'flex-start', gap: 12, display: 'flex'}}>
          <div data-size="20" style={{width: 20, height: 20, position: 'relative', overflow: 'hidden'}}>
            <div style={{width: 13.33, height: 9.17, left: 3.33, top: 5, position: 'absolute', outline: '2px var(--Icon-Default-Default, #1E1E1E) solid', outlineOffset: '-1px'}}></div>
          </div>
          <div style={{flexDirection: 'column', justifyContent: 'flex-start', alignItems: 'flex-start', gap: 16, display: 'inline-flex'}}>
            <div style={{alignSelf: 'stretch', flexDirection: 'column', justifyContent: 'flex-start', alignItems: 'flex-start', gap: 4, display: 'flex'}}>
              <div style={{color: 'var(--Text-Default-Default, #1E1E1E)', fontSize: 16, fontFamily: 'Inter', fontWeight: '600', lineHeight: 22.40, wordWrap: 'break-word'}}>Profesional agregado</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfesionalesTest;
