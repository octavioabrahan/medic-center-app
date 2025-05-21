import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { SiteFrame } from '../../../components/SiteFrame';
import ArrowLeft from '../../../assets/ArrowLeft.svg';
import RadioField from '../../../components/Inputs/RadioField';

// Styled components based on the Figma design
const HeroNewsletter = styled.div`
  background: rgba(32, 55, 122, 0.02);
  padding: var(--sds-size-space-800, 32px) var(--sds-size-space-600, 24px);
  display: flex;
  flex-direction: column;
  gap: var(--sds-size-space-800, 32px);
  align-items: center;
  justify-content: flex-start;
  align-self: stretch;
  flex: 1;
  position: relative;
`;

const Frame62 = styled.div`
  display: flex;
  flex-direction: column;
  gap: 32px;
  align-items: flex-start;
  justify-content: flex-start;
  width: 960px;
  position: relative;
  
  @media (max-width: 992px) {
    width: 100%;
  }
`;

const ButtonGroup = styled.div`
  display: flex;
  flex-direction: row;
  gap: var(--sds-size-space-400, 16px);
  align-items: center;
  justify-content: flex-start;
  align-self: stretch;
  position: relative;
`;

const BackButton = styled.button`
  border-radius: var(--sds-size-radius-200, 8px);
  padding: var(--sds-size-space-300, 12px);
  display: flex;
  flex-direction: row;
  gap: var(--sds-size-space-200, 8px);
  align-items: center;
  justify-content: center;
  position: relative;
  overflow: hidden;
  background: transparent;
  border: none;
  cursor: pointer;
  
  &:hover {
    background: var(--sds-color-background-default-default-hover);
  }
`;

const ButtonText = styled.span`
  color: var(--sds-color-text-neutral-default, #303030);
  text-align: left;
  font-family: var(--single-line-body-base-font-family, "Inter-Regular", sans-serif);
  font-size: var(--single-line-body-base-font-size, 16px);
  line-height: var(--single-line-body-base-line-height, 100%);
  font-weight: var(--single-line-body-base-font-weight, 400);
  position: relative;
`;

const TextContentTitle = styled.div`
  display: flex;
  flex-direction: column;
  gap: var(--sds-size-space-200, 8px);
  align-items: center;
  justify-content: flex-start;
  align-self: stretch;
  position: relative;
`;

const Title = styled.h2`
  color: var(--sds-color-text-default-default, #1e1e1e);
  text-align: center;
  font-family: var(--heading-font-family, "Inter-SemiBold", sans-serif);
  font-size: var(--heading-font-size, 24px);
  line-height: var(--heading-line-height, 120%);
  letter-spacing: var(--heading-letter-spacing, -0.02em);
  font-weight: var(--heading-font-weight, 600);
  position: relative;
  align-self: stretch;
  margin: 0;
`;

const Subtitle = styled.p`
  color: var(--sds-color-text-default-secondary, #757575);
  text-align: center;
  font-family: var(--subheading-font-family, "Inter-Regular", sans-serif);
  font-size: var(--subheading-font-size, 20px);
  line-height: var(--subheading-line-height, 120%);
  font-weight: var(--subheading-font-weight, 400);
  position: relative;
  align-self: stretch;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0;
`;

const Frame7 = styled.div`
  display: flex;
  flex-direction: row;
  gap: 32px;
  align-items: flex-start;
  justify-content: flex-start;
  align-self: stretch;
  position: relative;
  
  @media (max-width: 768px) {
    flex-direction: column;
  }
`;

const ChoiceCard = styled.div`
  background: ${props => props.selected ? 'var(--sds-color-background-brand-tertiary)' : 'var(--sds-color-background-default-default, #ffffff)'};
  border-radius: var(--sds-size-radius-200, 8px);
  border: 1px solid ${props => props.selected ? 'var(--sds-color-border-brand-default)' : 'var(--sds-color-border-default-default, #d9d9d9)'};
  padding: var(--sds-size-space-300, 12px);
  display: flex;
  flex-direction: row;
  align-items: flex-start;
  justify-content: flex-start;
  align-self: stretch;
  flex: 1;
  position: relative;
  cursor: pointer;
  transition: background-color 0.2s, border-color 0.2s;
  
  /* Style the RadioField inside the ChoiceCard */
  & .radio-field {
    width: 100%;
  }
  
  &:hover {
    background: ${props => props.selected ? 
      'var(--sds-color-background-brand-tertiary)' : 
      'var(--sds-color-background-default-default-hover, #f5f5f5)'};
  }
`;

/* No longer needed - using RadioField component */

const ButtonGroup2 = styled.div`
  display: flex;
  flex-direction: row;
  gap: var(--sds-size-space-400, 16px);
  align-items: center;
  justify-content: flex-end;
  align-self: stretch;
  position: relative;
`;

const ContinueButton = styled.button`
  background: var(--sds-color-background-brand-default, #20377a);
  border-radius: var(--sds-size-radius-200, 8px);
  border: 1px solid var(--sds-color-border-brand-default, #20377a);
  padding: var(--sds-size-space-300, 12px);
  display: flex;
  flex-direction: row;
  gap: var(--sds-size-space-200, 8px);
  align-items: center;
  justify-content: center;
  position: relative;
  overflow: hidden;
  cursor: ${props => props.disabled ? 'not-allowed' : 'pointer'};
  opacity: ${props => props.disabled ? '0.7' : '1'};
  
  &:hover {
    background: ${props => props.disabled ? 'var(--sds-color-background-brand-default, #20377a)' : 'var(--sds-color-background-brand-hover, #14214b)'};
  }
`;

const ButtonText2 = styled.div`
  color: var(--sds-color-text-brand-on-brand, #f0f3ff);
  text-align: left;
  font-family: var(--single-line-body-base-font-family, "Inter-Regular", sans-serif);
  font-size: var(--single-line-body-base-font-size, 16px);
  line-height: var(--single-line-body-base-line-height, 100%);
  font-weight: var(--single-line-body-base-font-weight, 400);
  position: relative;
`;

const AgendamientoIndex = () => {
  const [seleccion, setSeleccion] = useState('');
  const navigate = useNavigate();

  const continuar = () => {
    if (seleccion === 'privado') navigate('/agendamiento/privado');
    else if (seleccion === 'convenio') navigate('/agendamiento/convenio');
  };

  return (
    <SiteFrame>
      <HeroNewsletter>
        <Frame62>
          <ButtonGroup>
            <BackButton onClick={() => navigate('/')}>
              <img src={ArrowLeft} alt="Arrow Left" className="arrow-left" />
              <ButtonText>Volver a la página principal</ButtonText>
            </BackButton>
          </ButtonGroup>

        <TextContentTitle>
          <Title>¿Cómo se pagará la cita?</Title>
          <Subtitle>
            Selecciona la opción que corresponde al tipo de atención de la persona
            que se va a atender. Esto nos permitirá mostrar solo los pasos y
            documentos necesarios según cada caso.
          </Subtitle>
        </TextContentTitle>

        <Frame7>
          <ChoiceCard
            selected={seleccion === 'privado'}
            onClick={() => setSeleccion('privado')}
          >
            <RadioField
              label="Atención particular"
              description="La persona pagará la consulta directamente, con o sin seguro médico."
              checked={seleccion === 'privado'}
              name="tipo-atencion"
              onChange={() => setSeleccion('privado')}
            />
          </ChoiceCard>
          
          <ChoiceCard
            selected={seleccion === 'convenio'}
            onClick={() => setSeleccion('convenio')}
          >
            <RadioField
              label="Atención por convenio"
              description="La persona trabaja en una empresa o institución que tiene convenio con el centro médico."
              checked={seleccion === 'convenio'}
              name="tipo-atencion"
              onChange={() => setSeleccion('convenio')}
            />
          </ChoiceCard>
        </Frame7>
        
        <ButtonGroup2>
          <ContinueButton
            onClick={continuar}
            disabled={!seleccion}
          >
            <ButtonText2>Continuar</ButtonText2>
          </ContinueButton>
        </ButtonGroup2>
      </Frame62>
    </HeroNewsletter>
    </SiteFrame>
  );
};

export default AgendamientoIndex;
