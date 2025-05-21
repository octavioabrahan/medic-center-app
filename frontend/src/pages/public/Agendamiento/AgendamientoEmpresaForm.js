import React, { useState, useEffect } from 'react';
import axios from 'axios';
import styled from 'styled-components';
import { SiteFrame } from '../../../components/SiteFrame';
import { Button } from '../../../components/Button/Button';
import ArrowLeft from '../../../assets/ArrowLeft.svg';
import RadioField from '../../../components/Inputs/RadioField';
import CalendarioFechasDisponiblesDayPicker from '../../../components/public/CalendarioFechasDisponiblesDayPicker';
import ArchivoAdjuntoForm from '../../../components/public/ArchivoAdjuntoForm';

// Styled components based on the Figma design
const HeroNewsletter = styled.div`
  background: rgba(32, 55, 122, 0.02);
  padding: var(--var-sds-size-space-800, 32px) var(--var-sds-size-space-600, 24px);
  display: flex;
  flex-direction: column;
  gap: var(--var-sds-size-space-800, 32px);
  align-items: center;
  justify-content: flex-start;
  align-self: stretch;
  flex-shrink: 0;
  position: relative;
  width: 100%;
  min-height: calc(100vh - 60px); /* Adjust based on header height if needed */
  box-sizing: border-box;
  
  * {
    box-sizing: border-box;
  }
`;

const FormContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 32px;
  align-items: flex-start;
  justify-content: flex-start;
  width: 100%;
  max-width: 960px;
  position: relative;
  
  @media (max-width: 992px) {
    width: 100%;
  }
  
  .button-group {
    display: flex;
    flex-direction: row;
    gap: var(--var-sds-size-space-400, 16px);
    align-items: center;
    justify-content: flex-start;
    flex-shrink: 0;
    width: 960px;
    position: relative;
  }
  
  .text-content-title {
    display: flex;
    flex-direction: column;
    gap: var(--var-sds-size-space-200, 8px);
    align-items: center;
    justify-content: flex-start;
    flex-shrink: 0;
    width: 960px;
    position: relative;
  }
  
  .frame-39, .frame-65, .frame-38 {
    display: flex;
    flex-direction: column;
    gap: var(--var-sds-size-space-200, 8px);
    align-items: flex-start;
    justify-content: flex-start;
    flex-shrink: 0;
    width: 960px;
    position: relative;
  }
  
  .frame-7 {
    display: flex;
    flex-direction: row;
    gap: var(--var-sds-size-space-600, 24px);
    align-items: flex-start;
    justify-content: flex-start;
    align-self: stretch;
    flex-shrink: 0;
    position: relative;
  }
  
  .frame-21 {
    display: flex;
    flex-direction: row;
    gap: var(--var-sds-size-space-600, 24px);
    align-items: flex-start;
    justify-content: flex-start;
    align-self: stretch;
    flex-shrink: 0;
    position: relative;
  }
  
  .frame-13 {
    display: flex;
    flex-direction: column;
    gap: var(--var-sds-size-space-300, 12px);
    align-items: center;
    justify-content: flex-start;
    flex: 1;
    position: relative;
  }
  
  .selecciona-el-tipo-de-atenci-n {
    color: var(--var-sds-color-text-default-default, #1e1e1e);
    text-align: left;
    font-family: var(--body-base-font-family, "Inter-Regular", sans-serif);
    font-size: var(--body-base-font-size, 16px);
    line-height: var(--body-base-line-height, 140%);
    font-weight: var(--body-base-font-weight, 400);
    position: relative;
    align-self: stretch;
  }
  
  .title2 {
    color: var(--var-sds-color-text-default-default, #1e1e1e);
    text-align: left;
    font-family: var(--body-base-font-family, "Inter-Regular", sans-serif);
    font-size: var(--body-base-font-size, 16px);
    line-height: var(--body-base-line-height, 140%);
    font-weight: var(--body-base-font-weight, 400);
    position: relative;
    align-self: stretch;
  }
  
  .button-group2 {
    display: flex;
    flex-direction: row;
    gap: var(--var-sds-size-space-400, 16px);
    align-items: center;
    justify-content: flex-end;
    flex-shrink: 0;
    width: 960px;
    position: relative;
  }
  
  @media (max-width: 992px) {
    .button-group, .text-content-title, .frame-39, .frame-65, .frame-38, .button-group2 {
      width: 100%;
    }
    
    .frame-21, .frame-7 {
      flex-direction: column;
    }
  }
`;

const BackButton = styled.button`
  border-radius: var(--var-sds-size-radius-200, 8px);
  padding: var(--var-sds-size-space-300, 12px);
  display: flex;
  flex-direction: row;
  gap: var(--var-sds-size-space-200, 8px);
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  position: relative;
  overflow: hidden;
  background: transparent;
  border: none;
  cursor: pointer;
  
  &:hover {
    background: var(--sds-color-background-default-default-hover);
  }
  
  img.arrow-left {
    flex-shrink: 0;
    width: 16px;
    height: 16px;
    position: relative;
    overflow: visible;
  }
`;

const ButtonText = styled.span`
  color: var(--var-sds-color-text-neutral-default, #303030);
  text-align: left;
  font-family: var(--single-line-body-base-font-family, "Inter-Regular", sans-serif);
  font-size: var(--single-line-body-base-font-size, 16px);
  line-height: var(--single-line-body-base-line-height, 100%);
  font-weight: var(--single-line-body-base-font-weight, 400);
  position: relative;
`;

const FormTitle = styled.h2`
  color: var(--var-sds-color-text-brand-default, #20377a);
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

const FormSubtitle = styled.p`
  color: var(--var-sds-color-text-default-secondary, #757575);
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
  margin: 0 0 16px 0;
`;

const FormSection = styled.section`
  display: flex;
  flex-direction: column;
  gap: var(--var-sds-size-space-300, 12px);
  align-items: flex-start;
  justify-content: flex-start;
  width: 100%;
  flex-shrink: 0;
  max-width: 966px;
  position: relative;
`;

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: var(--var-sds-size-space-200, 8px);
  align-items: flex-start;
  justify-content: flex-start;
  align-self: stretch;
  flex-shrink: 0;
  position: relative;
  width: 100%;
`;

const FormLabel = styled.label`
  color: var(--var-sds-color-text-default-default, #1e1e1e);
  text-align: left;
  font-family: var(--body-base-font-family, "Inter-Regular", sans-serif);
  font-size: var(--body-base-font-size, 16px);
  line-height: var(--body-base-line-height, 140%);
  font-weight: var(--body-base-font-weight, 400);
  position: relative;
  align-self: stretch;

  &.label2 {
    color: var(--var-sds-color-text-default-default, #1e1e1e);
    text-align: left;
    font-family: var(--body-base-font-family, "Inter-Regular", sans-serif);
    font-size: var(--body-base-font-size, 16px);
    line-height: var(--body-base-line-height, 140%);
    font-weight: var(--body-base-font-weight, 400);
    position: relative;
    align-self: stretch;
  }
`;

const FormInput = styled.input`
  background: var(--var-sds-color-background-default-default, #ffffff);
  border-radius: var(--var-sds-size-radius-200, 8px);
  border-style: solid;
  border-color: var(--var-sds-color-border-default-default, #d9d9d9);
  border-width: 1px;
  padding: var(--var-sds-size-space-300, 12px) var(--var-sds-size-space-400, 16px) var(--var-sds-size-space-300, 12px) var(--var-sds-size-space-400, 16px);
  display: flex;
  flex-direction: row;
  gap: 0px;
  align-items: center;
  justify-content: flex-start;
  align-self: stretch;
  flex-shrink: 0;
  min-width: 240px;
  position: relative;
  overflow: hidden;
  font-family: var(--single-line-body-base-font-family, "Inter-Regular", sans-serif);
  font-size: var(--single-line-body-base-font-size, 16px);
  line-height: var(--single-line-body-base-line-height, 100%);
  font-weight: var(--single-line-body-base-font-weight, 400);
  color: var(--var-sds-color-text-default-default, #1e1e1e);
  width: 100%;
  
  &:focus {
    outline: none;
    border-color: var(--var-sds-color-border-brand-default, #20377a);
    box-shadow: 0 0 0 1px var(--var-sds-color-border-brand-default, #20377a);
  }
`;

const FormSelect = styled.select`
  background: var(--var-sds-color-background-default-default, #ffffff);
  border-radius: var(--var-sds-size-radius-200, 8px);
  border-style: solid;
  border-color: var(--var-sds-color-border-default-default, #d9d9d9);
  border-width: 1px;
  padding: var(--var-sds-size-space-300, 12px) var(--var-sds-size-space-300, 12px) var(--var-sds-size-space-300, 12px) var(--var-sds-size-space-400, 16px);
  display: flex;
  flex-direction: row;
  gap: var(--var-sds-size-space-200, 8px);
  align-items: center;
  justify-content: flex-start;
  align-self: stretch;
  flex-shrink: 0;
  height: 40px;
  min-width: 240px;
  position: relative;
  font-family: var(--single-line-body-base-font-family, "Inter-Regular", sans-serif);
  font-size: var(--single-line-body-base-font-size, 16px);
  line-height: var(--single-line-body-base-line-height, 100%);
  font-weight: var(--single-line-body-base-font-weight, 400);
  color: var(--var-sds-color-text-default-default, #1e1e1e);
  width: 100%;
  
  &:focus {
    outline: none;
    border-color: var(--var-sds-color-border-brand-default, #20377a);
    box-shadow: 0 0 0 1px var(--var-sds-color-border-brand-default, #20377a);
  }
  
  &.select {
    background: var(--var-sds-color-background-default-default, #ffffff);
    border-radius: var(--var-sds-size-radius-200, 8px);
    border-style: solid;
    border-color: var(--var-sds-color-border-default-default, #d9d9d9);
    border-width: 1px;
    padding: var(--var-sds-size-space-300, 12px) var(--var-sds-size-space-300, 12px) var(--var-sds-size-space-300, 12px) var(--var-sds-size-space-400, 16px);
    display: flex;
    flex-direction: row;
    gap: var(--var-sds-size-space-200, 8px);
    align-items: center;
    justify-content: flex-start;
    align-self: stretch;
    flex-shrink: 0;
    height: 40px;
    min-width: 240px;
    position: relative;
  }
  
  option.value {
    color: var(--var-sds-color-text-default-tertiary, #b3b3b3);
    text-align: left;
    font-family: var(--single-line-body-base-font-family, "Inter-Regular", sans-serif);
    font-size: var(--single-line-body-base-font-size, 16px);
    line-height: var(--single-line-body-base-line-height, 100%);
    font-weight: var(--single-line-body-base-font-weight, 400);
    position: relative;
    flex: 1;
  }
`;

const CheckboxLabel = styled.label`
  display: flex;
  flex-direction: row;
  gap: var(--var-sds-size-space-300, 12px);
  align-items: center;
  justify-content: flex-start;
  align-self: stretch;
  flex-shrink: 0;
  position: relative;
  cursor: pointer;
  color: var(--var-sds-color-text-default-default, #1e1e1e);
  font-family: var(--body-base-font-family, "Inter-Regular", sans-serif);
  font-size: var(--body-base-font-size, 16px);
  line-height: var(--body-base-line-height, 140%);
  font-weight: var(--body-base-font-weight, 400);
`;

const RadioGroup = styled.div`
  display: flex;
  flex-direction: row;
  gap: var(--var-sds-size-space-600, 24px);
  margin-top: 8px;
  align-items: flex-start;
  justify-content: flex-start;
  align-self: stretch;
  flex-shrink: 0;
  
  .radio-field {
    display: flex;
    flex-direction: column;
    gap: 0px;
    align-items: flex-start;
    justify-content: flex-start;
    flex: 1;
    position: relative;
  }
  
  .checkbox-and-label {
    display: flex;
    flex-direction: row;
    gap: var(--var-sds-size-space-300, 12px);
    align-items: center;
    justify-content: flex-start;
    align-self: stretch;
    flex-shrink: 0;
    position: relative;
  }
  
  .radio {
    background: var(--var-sds-color-background-brand-secondary, #ffffff);
    border-radius: var(--var-sds-size-radius-full, 9999px);
    border-style: solid;
    border-color: var(--var-sds-color-border-brand-default, #20377a);
    border-width: 1px;
    flex-shrink: 0;
    width: 16px;
    height: 16px;
    position: relative;
    overflow: hidden;
  }
  
  .radio2 {
    background: var(--var-sds-color-icon-brand-on-brand-secondary, #14214b);
    border-radius: 50%;
    width: 10px;
    height: 10px;
    position: absolute;
    left: 50%;
    translate: -50% -50%;
    top: 50%;
  }
  
  .radio3 {
    background: var(--var-sds-color-background-default-default, #ffffff);
    border-radius: var(--var-sds-size-radius-full, 9999px);
    border-style: solid;
    border-color: var(--var-sds-color-border-brand-tertiary, #20377a);
    border-width: 1px;
    flex-shrink: 0;
    width: 16px;
    height: 16px;
    position: relative;
    overflow: hidden;
  }
  
  .label {
    color: var(--var-sds-color-text-default-default, #1e1e1e);
    text-align: left;
    font-family: var(--body-base-font-family, "Inter-Regular", sans-serif);
    font-size: var(--body-base-font-size, 16px);
    line-height: var(--body-base-line-height, 140%);
    font-weight: var(--body-base-font-weight, 400);
    position: relative;
    flex: 1;
  }
`;

const SectionTitle = styled.h3`
  color: var(--var-sds-color-text-default-default, #1e1e1e);
  font-family: var(--body-strong-font-family, "Inter-SemiBold", sans-serif);
  font-size: 20px;
  line-height: 140%;
  font-weight: var(--body-strong-font-weight, 600);
  margin: 24px 0 16px 0;
`;

const ButtonContainer = styled.div`
  display: flex;
  flex-direction: row;
  gap: var(--var-sds-size-space-400, 16px);
  align-items: center;
  justify-content: flex-end;
  width: 100%;
  flex-shrink: 0;
  max-width: 966px;
  position: relative;
  margin-top: 32px;
`;

const RecomendacionBox = styled.div`
  background: var(--var-sds-color-background-brand-tertiary, #f0f3ff);
  border-radius: var(--var-sds-size-radius-200, 8px);
  padding: 16px;
  display: flex;
  gap: 16px;
  margin: 24px 0;
  width: 100%;
  
  p {
    color: var(--var-sds-color-text-default-default, #1e1e1e);
    font-family: var(--body-base-font-family, "Inter-Regular", sans-serif);
    font-size: var(--body-base-font-size, 16px);
    line-height: var(--body-base-line-height, 140%);
  }
`;

const InfoIcon = styled.span`
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background: var(--var-sds-color-background-brand-default, #20377a);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  flex-shrink: 0;
`;

const ServicesList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-top: 16px;
  width: 100%;
`;

const ServiceItem = styled.div`
  display: flex;
  flex-direction: row;
  gap: var(--var-sds-size-space-300, 12px);
  align-items: center;
  justify-content: flex-start;
  padding: 12px;
  background: var(--var-sds-color-background-default-default, #ffffff);
  border-radius: var(--var-sds-size-radius-200, 8px);
  border: 1px solid var(--var-sds-color-border-default-default, #d9d9d9);
  
  &:hover {
    background: var(--var-sds-color-background-default-default-hover, #f5f5f5);
  }
  
  label {
    color: var(--var-sds-color-text-default-default, #1e1e1e);
    text-align: left;
    font-family: var(--body-base-font-family, "Inter-Regular", sans-serif);
    font-size: var(--body-base-font-size, 16px);
    line-height: var(--body-base-line-height, 140%);
    font-weight: var(--body-base-font-weight, 400);
    position: relative;
    flex: 1;
  }
  
  input[type="checkbox"] {
    flex-shrink: 0;
  }
`;

const CalendarioSection = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
  margin-top: 24px;
`;

const CalendarioContainer = styled.div`
  display: flex;
  gap: 24px;
  flex-wrap: wrap;
  margin-top: 16px;
  
  @media (max-width: 768px) {
    flex-direction: column;
  }
`;

const CalendarioWrapper = styled.div`
  flex: 1;
  min-width: 320px;
`;

const FechaSeleccionadaInfo = styled.div`
  flex: 1;
  min-width: 280px;
  background: var(--var-sds-color-background-default-default, #ffffff);
  border-radius: var(--var-sds-size-radius-200, 8px);
  border: 1px solid var(--var-sds-color-border-default-default, #d9d9d9);
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

const InfoItem = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: var(--var-sds-size-space-300, 12px);
  
  p {
    margin: 0;
    color: var(--var-sds-color-text-default-default, #1e1e1e);
    font-family: var(--body-base-font-family, "Inter-Regular", sans-serif);
    font-size: var(--body-base-font-size, 16px);
    line-height: var(--body-base-line-height, 140%);
    font-weight: var(--body-base-font-weight, 400);
  }
  
  span {
    flex-shrink: 0;
  }
`;

const AlertaInfo = styled.div`
  background: var(--var-sds-color-background-warning-tertiary, #fffbeb);
  border-radius: var(--var-sds-size-radius-200, 8px);
  padding: 16px;
  display: flex;
  gap: 12px;
  margin: 24px 0;
  width: 100%;
  align-items: center;
  
  span {
    font-size: 24px;
    flex-shrink: 0;
  }
  
  p {
    margin: 0;
    color: var(--var-sds-color-text-warning-default, #522504);
    font-family: var(--body-base-font-family, "Inter-Regular", sans-serif);
    font-size: var(--body-base-font-size, 16px);
    line-height: var(--body-base-line-height, 140%);
    font-weight: var(--body-base-font-weight, 400);
  }
`;

const ResumenTarjeta = styled.div`
  background: var(--var-sds-color-background-default-default, #ffffff);
  border-radius: var(--var-sds-size-radius-200, 8px);
  border: 1px solid var(--var-sds-color-border-default-default, #d9d9d9);
  padding: 20px;
  width: 100%;
  margin-top: 16px;
  
  p {
    margin: 8px 0;
    color: var(--var-sds-color-text-default-default, #1e1e1e);
    font-family: var(--body-base-font-family, "Inter-Regular", sans-serif);
    font-size: var(--body-base-font-size, 16px);
    line-height: var(--body-base-line-height, 140%);
    font-weight: var(--body-base-font-weight, 400);
  }
`;

const DatosPersonalesContainer = styled.div`
  display: flex;
  gap: 24px;
  margin-top: 16px;
  width: 100%;
  
  @media (max-width: 768px) {
    flex-direction: column;
  }
`;

const ColumnaDatos = styled.div`
  flex: 1;
  background: var(--var-sds-color-background-default-default, #ffffff);
  border-radius: var(--var-sds-size-radius-200, 8px);
  border: 1px solid var(--var-sds-color-border-default-default, #d9d9d9);
  padding: 20px;
  
  h4 {
    margin: 0 0 16px 0;
    color: var(--var-sds-color-text-default-default, #1e1e1e);
    font-family: var(--body-strong-font-family, "Inter-SemiBold", sans-serif);
    font-size: 18px;
    line-height: 140%;
    font-weight: var(--body-strong-font-weight, 600);
  }
  
  p {
    margin: 8px 0;
    color: var(--var-sds-color-text-default-default, #1e1e1e);
    font-family: var(--body-base-font-family, "Inter-Regular", sans-serif);
    font-size: var(--body-base-font-size, 16px);
    line-height: var(--body-base-line-height, 140%);
    font-weight: var(--body-base-font-weight, 400);
  }
`;

const ConfirmacionFinal = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--var-sds-size-space-800, 32px);
  text-align: center;
  width: 100%;
  
  h2 {
    color: var(--var-sds-color-background-brand-default, #20377a);
  }
`;

const FormAcciones = styled.div`
  display: flex;
  flex-direction: row;
  gap: var(--var-sds-size-space-400, 16px);
  align-items: center;
  justify-content: flex-start;
  width: 100%;
  flex-shrink: 0;
  max-width: 966px;
  position: relative;
  margin-top: 32px;
  
  @media (max-width: 768px) {
    flex-direction: column;
    width: 100%;
  }
`;

const UploadFieldContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: var(--var-sds-size-space-200, 8px);
  align-items: flex-start;
  justify-content: flex-start;
  align-self: stretch;
  flex-shrink: 0;
  position: relative;
`;

const UploadButton = styled.button`
  background: var(--var-sds-color-background-neutral-tertiary, #e3e3e3);
  border-radius: var(--var-sds-size-radius-200, 8px);
  border-style: solid;
  border-color: var(--var-sds-color-border-neutral-secondary, #767676);
  border-width: 1px;
  padding: var(--var-sds-size-space-300, 12px);
  display: flex;
  flex-direction: row;
  gap: var(--var-sds-size-space-200, 8px);
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  position: relative;
  overflow: hidden;
  cursor: pointer;
  
  span {
    color: var(--var-sds-color-text-default-default, #1e1e1e);
    text-align: left;
    font-family: var(--body-base-font-family, "Inter-Regular", sans-serif);
    font-size: var(--body-base-font-size, 16px);
    line-height: var(--body-base-line-height, 140%);
    font-weight: var(--body-base-font-weight, 400);
    position: relative;
  }
`;

// Choice card styling for the radio selection
const ChoiceCard = styled.div`
  background: var(--var-sds-color-background-default-default, #ffffff);
  border-radius: var(--var-sds-size-radius-200, 8px);
  border-style: solid;
  border-color: var(--var-sds-color-border-default-default, #d9d9d9);
  border-width: 1px;
  padding: var(--var-sds-size-space-300, 12px);
  display: flex;
  flex-direction: row;
  gap: var(--var-sds-size-space-600, 24px);
  align-items: center;
  justify-content: flex-start;
  flex: 1;
  max-width: 966px;
  position: relative;
`;

// Weekday styling
const WeekdaysContainer = styled.div`
  border-radius: 8px;
  display: flex;
  flex-direction: row;
  gap: var(--var-sds-size-space-300, 12px);
  align-items: center;
  justify-content: flex-start;
  align-self: stretch;
  flex-shrink: 0;
  position: relative;
  
  .weekday-frame {
    padding: var(--var-sds-size-space-100, 4px);
    display: flex;
    flex-direction: row;
    gap: var(--var-sds-size-space-0, 0px);
    align-items: center;
    justify-content: center;
    flex: 1;
    position: relative;
    
    div {
      color: var(--neutrals-n100, #7b827e);
      text-align: center;
      font-family: var(--subheading-font-family, "Inter-Regular", sans-serif);
      font-size: var(--subheading-font-size, 20px);
      line-height: var(--subheading-line-height, 120%);
      font-weight: var(--subheading-font-weight, 400);
      position: relative;
      width: 26px;
      display: flex;
      align-items: center;
      justify-content: center;
    }
  }
`;

// Calendar day styling
const CalendarDayContainer = styled.div`
  background: var(--default-white, #ffffff);
  border-radius: var(--var-sds-size-radius-200, 8px);
  padding: var(--var-sds-size-space-100, 4px);
  display: flex;
  flex-direction: column;
  gap: var(--var-sds-size-space-100, 4px);
  align-items: center;
  justify-content: center;
  flex: 1;
  position: relative;
  overflow: hidden;
  
  .day {
    color: var(--neutrals-n50, #c2c5c4);
    text-align: center;
    font-family: var(--subheading-font-family, "Inter-Regular", sans-serif);
    font-size: var(--subheading-font-size, 20px);
    line-height: var(--subheading-line-height, 120%);
    font-weight: var(--subheading-font-weight, 400);
    position: relative;
    width: 26px;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  
  .line-1 {
    align-self: stretch;
    flex-shrink: 0;
    height: 0px;
    position: relative;
  }
`;

// Calendar row styling
const CalendarRow = styled.div`
  display: flex;
  flex-direction: row;
  gap: var(--var-sds-size-space-300, 12px);
  align-items: center;
  justify-content: flex-start;
  align-self: stretch;
  flex-shrink: 0;
  position: relative;
`;

// Calendar card styling
const CalendarCard = styled.div`
  background: var(--var-sds-color-background-default-default, #ffffff);
  border-radius: var(--var-sds-size-radius-200, 8px);
  border-style: solid;
  border-color: var(--var-sds-color-border-default-default, #d9d9d9);
  border-width: 1px;
  padding: var(--var-sds-size-space-600, 24px);
  display: flex;
  flex-direction: column;
  gap: var(--var-sds-size-space-600, 24px);
  align-items: flex-start;
  justify-content: flex-start;
  flex: 1;
  min-width: 240px;
  position: relative;
  
  .info-row {
    display: flex;
    flex-direction: row;
    gap: var(--var-sds-size-space-200, 8px);
    align-items: center;
    justify-content: flex-start;
    align-self: stretch;
    flex-shrink: 0;
    position: relative;
    
    svg {
      flex-shrink: 0;
      width: 24px;
      height: 24px;
      position: relative;
      overflow: visible;
    }
    
    div {
      color: var(--var-sds-color-text-default-default, #1e1e1e);
      text-align: left;
      font-family: var(--body-emphasis-font-family, "Inter-Italic", sans-serif);
      font-size: var(--body-emphasis-font-size, 16px);
      line-height: var(--body-emphasis-line-height, 140%);
      font-weight: var(--body-emphasis-font-weight, 400);
      font-style: var(--body-emphasis-font-style, italic);
      position: relative;
      align-self: stretch;
      flex: 1;
    }
  }
`;

const AgendamientoEmpresaForm = () => {
  const [step, setStep] = useState(1);
  const [sinCedula, setSinCedula] = useState(false);
  const [empresas, setEmpresas] = useState([]);
  const [empresaSeleccionada, setEmpresaSeleccionada] = useState('');

  const [datosRepresentante, setDatosRepresentante] = useState({
    cedula: '', nombre: '', apellido: '', numeroHijo: '', telefono: '', email: '', sexo: ''
  });

  const [datosPaciente, setDatosPaciente] = useState({
    nombre: '', apellido: '', fechaNacimiento: '', sexo: '', telefono: '', email: ''
  });

  const [tieneSeguro] = useState('');
  const [modoSeleccion] = useState(null);
  const [servicios, setServicios] = useState([]);
  const [profesionales, setProfesionales] = useState([]);
  const [profesionalServicioMap, setProfesionalServicioMap] = useState({});
  const [archivoAdjuntoId, setArchivoAdjuntoId] = useState(null);
  
  const [especialidadSeleccionada, setEspecialidadSeleccionada] = useState('');
  const [serviciosSeleccionados, setServiciosSeleccionados] = useState([]);
  const [profesionalSeleccionado, setProfesionalSeleccionado] = useState('');
  const [fechaSeleccionada, setFechaSeleccionada] = useState(null);
  const [categorias, setCategorias] = useState([]);
  const [tiposAtencion, setTiposAtencion] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        
        // Obtener categorías
        const categoriasRes = await axios.get('/api/categorias');
        setCategorias(categoriasRes.data);
        
        // Obtener tipos de atención
        const tiposAtencionRes = await axios.get('/api/tipo-atencion');
        setTiposAtencion(tiposAtencionRes.data);
        
        setIsLoading(false);
      } catch (error) {
        console.error('Error al cargar datos iniciales:', error);
        alert('Error al cargar datos necesarios. Por favor, recarga la página.');
        setIsLoading(false);
      }
    };
    
    fetchData();
  }, []);

  useEffect(() => {
    fetch('/api/empresas')
      .then(res => res.json())
      .then(data => setEmpresas(data.filter(e => e.is_active)))
      .catch(error => {
        console.error('Error al cargar empresas:', error);
        alert('Error al cargar las empresas disponibles. Por favor, recarga la página.');
      });
  }, []);

  useEffect(() => {
    if (step === 2) {
      axios.get('/api/servicios').then(res => setServicios(res.data)).catch(console.error);
      axios.get('/api/profesionales').then(res => setProfesionales(res.data)).catch(console.error);
      axios.get('/api/profesional-servicios')
        .then(res => {
          // Crear mapa de profesionales a servicios y viceversa
          const profToServ = {};
          const servToProf = {};
          
          res.data.forEach(relacion => {
            // Mapeo de profesional a servicios
            if (!profToServ[relacion.profesional_id]) {
              profToServ[relacion.profesional_id] = [];
            }
            profToServ[relacion.profesional_id].push(relacion.id_servicio);
            
            // Mapeo de servicio a profesionales
            if (!servToProf[relacion.id_servicio]) {
              servToProf[relacion.id_servicio] = [];
            }
            servToProf[relacion.id_servicio].push(relacion.profesional_id);
          });
          
          setProfesionalServicioMap({ profToServ, servToProf });
        })
        .catch(console.error);
    }
  }, [step]);

  // Función para obtener el ID de categoría por su nombre (slug)
  const getCategoriaId = (slug) => {
    const categoria = categorias.find(cat => 
      cat.nombre_categoria.toLowerCase() === slug.toLowerCase()
    );
    return categoria ? categoria.id_categoria : null;
  };

  // Función para obtener el ID de tipo de atención por su nombre (slug)
  const getTipoAtencionId = (slug) => {
    const tipoAtencion = tiposAtencion.find(tipoAtencion => 
      tipoAtencion.nombre.toLowerCase() === slug.toLowerCase()
    );
    return tipoAtencion ? tipoAtencion.tipo_atencion_id : null;
  };

  // Filtrar profesionales por categoría (consulta o estudio)
  const profesionalesPorCategoria = profesionales.filter(p =>
    modoSeleccion === 'consulta'
      ? p.categorias?.includes('Consulta')
      : modoSeleccion === 'estudio'
          ? p.categorias?.includes('Estudio')
          : false
  );

  // Filtrar profesionales por servicio seleccionado (si hay uno)
  const profesionalesFiltrados = serviciosSeleccionados
    ? profesionalesPorCategoria.filter(p => {
        // Si tenemos un ID de servicio y un mapa de servicio a profesionales
        const servicioObj = servicios.find(s => s.nombre_servicio === serviciosSeleccionados);
        if (servicioObj && profesionalServicioMap.servToProf) {
          const idServicio = servicioObj.id_servicio;
          return profesionalServicioMap.servToProf[idServicio]?.includes(p.profesional_id);
        }
        return true;
      })
    : profesionalesPorCategoria;

  // Filtrar servicios por profesional seleccionado (si hay uno)
  const serviciosFiltrados = profesionalSeleccionado
    ? servicios.filter(s => {
        // Si tenemos un ID de profesional y un mapa de profesional a servicios
        if (profesionalServicioMap.profToServ) {
          return profesionalServicioMap.profToServ[profesionalSeleccionado]?.includes(s.id_servicio);
        }
        return true;
      })
    : servicios;

  // Manejar cambio de servicio
  const handleServicioChange = (e) => {
    setServiciosSeleccionados(e.target.value);
    // Si el profesional actual no puede realizar este servicio, reseteamos la selección
    const servicioObj = servicios.find(s => s.nombre_servicio === e.target.value);
    if (servicioObj && profesionalSeleccionado) {
      const idServicio = servicioObj.id_servicio;
      const puedeRealizarlo = profesionalServicioMap.profToServ[profesionalSeleccionado]?.includes(idServicio);
      if (!puedeRealizarlo) {
        setProfesionalSeleccionado('');
      }
    }
  };

  // Manejar cambio de profesional
  const handleProfesionalChange = (e) => {
    setProfesionalSeleccionado(e.target.value);
    // Si el servicio actual no puede ser realizado por este profesional, reseteamos la selección
    const servicioObj = servicios.find(s => s.nombre_servicio === serviciosSeleccionados);
    if (servicioObj && e.target.value) {
      const idServicio = servicioObj.id_servicio;
      const puedeRealizarlo = profesionalServicioMap.profToServ[e.target.value]?.includes(idServicio);
      if (!puedeRealizarlo) {
        setServiciosSeleccionados('');
      }
    }
  };

  const fechaMostrada = () => {
    const fecha = fechaSeleccionada?.dateObj;
    if (!fecha || !(fecha instanceof Date)) return '';
    return fecha.toLocaleDateString('es-CL', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    }).replace(/,/g, '').replace(/^./, str => str.toUpperCase());
  };

  const horaMostrada = () => {
    if (!fechaSeleccionada || !fechaSeleccionada.hora_inicio || !fechaSeleccionada.hora_termino) return 'No disponible';
    const inicio = fechaSeleccionada.hora_inicio.slice(0, 5);
    const termino = fechaSeleccionada.hora_termino.slice(0, 5);
    return `Desde las ${inicio} hasta las ${termino} hrs`;
  };

  const handleCheckCedula = () => {
    const nuevaCondicion = !sinCedula;
    setSinCedula(nuevaCondicion);
    if (nuevaCondicion) {
      setDatosPaciente(prev => ({ ...prev, telefono: '', email: '' }));
    }
  };

  const enviarAgendamiento = async () => {
    if (isLoading) {
      alert("Aún se están cargando datos necesarios. Por favor espere.");
      return;
    }
    
    if (serviciosSeleccionados.length === 0) {
      alert("Debes seleccionar al menos un servicio");
      return;
    }
    
    const representanteCedula = sinCedula ? `${datosRepresentante.cedula}-${datosRepresentante.numeroHijo}` : null;
    
    // Obtener IDs de forma simplificada
    const categoriaId = getCategoriaId('Consulta');
    const tipoAtencionId = getTipoAtencionId('Presencial');
    
    if (!categoriaId) {
      alert(`No se encontró la categoría correspondiente.`);
      return;
    }
    
    if (!tipoAtencionId) {
      alert(`No se encontró el tipo de atención correspondiente.`);
      return;
    }
    
    const payload = {
      cedula: sinCedula ? `${datosRepresentante.cedula}-${datosRepresentante.numeroHijo}` : datosRepresentante.cedula,
      nombre: datosPaciente.nombre,
      apellido: datosPaciente.apellido,
      fecha_nacimiento: datosPaciente.fechaNacimiento,
      sexo: datosPaciente.sexo,
      telefono: sinCedula ? datosRepresentante.telefono : datosPaciente.telefono,
      email: sinCedula ? datosRepresentante.email : datosPaciente.email,
      seguro_medico: tieneSeguro === 'si',
      representante_cedula: representanteCedula,
      representante_nombre: sinCedula ? datosRepresentante.nombre : null,
      representante_apellido: sinCedula ? datosRepresentante.apellido : null,
      id_empresa: empresaSeleccionada,
      profesional_id: profesionalSeleccionado,
      fecha_agendada: fechaSeleccionada?.fecha || fechaSeleccionada,
      tipo_atencion_id: tipoAtencionId,
      observaciones: serviciosSeleccionados.join(", "), // Unimos todos los servicios con comas
      id_categoria: categoriaId,
      nro_consulta: fechaSeleccionada?.nro_consulta || null,
      archivo_adjunto_id: archivoAdjuntoId // Incluir el ID del archivo adjunto
    };
  
    try {
      await axios.post('/api/agendamiento', payload);
      alert('Agendamiento creado con éxito');
      setStep(4);
    } catch (error) {
      console.error('Error al crear agendamiento:', error.response?.data || error.message);
      alert(`Error al crear agendamiento: ${error.response?.data?.error || error.message}`);
    }
  };

  return (
    <SiteFrame>
      <HeroNewsletter>
        <FormContainer>
          {step === 1 && (
            <FormSection>
              <FormTitle>Completa los datos del paciente que asistirá a la cita</FormTitle>
              
              <FormGroup>
                <FormLabel>Empresa con la que tiene convenio</FormLabel>
                <FormSelect 
                  required 
                  value={empresaSeleccionada} 
                  onChange={e => setEmpresaSeleccionada(e.target.value)}
                >
                  <option value="">Selecciona una empresa</option>
                  {empresas.map(e => (
                    <option key={e.id_empresa} value={e.id_empresa}>{e.nombre_empresa}</option>
                  ))}
                </FormSelect>
              </FormGroup>

              <FormGroup>
                <FormLabel>Cédula</FormLabel>
                <FormInput
                  required
                  type="text"
                  value={datosRepresentante.cedula}
                  onChange={e => setDatosRepresentante({ ...datosRepresentante, cedula: e.target.value })}
                />
              </FormGroup>

              <CheckboxLabel>
                <input 
                  type="checkbox" 
                  checked={sinCedula} 
                  onChange={handleCheckCedula}
                  style={{ width: '20px', height: '20px' }}
                />
                <span>La persona que se atenderá no tiene cédula.</span>
              </CheckboxLabel>

              {/* Sección de representante */}
              {sinCedula && (
                <>
                  <SectionTitle>Datos del representante legal</SectionTitle>
                  
                  <FormGroup>
                    <FormLabel>Nombre</FormLabel>
                    <FormInput
                      type="text"
                      required
                      value={datosRepresentante.nombre}
                      onChange={e => setDatosRepresentante({ ...datosRepresentante, nombre: e.target.value })}
                    />
                  </FormGroup>

                  <FormGroup>
                    <FormLabel>Apellidos</FormLabel>
                    <FormInput
                      type="text"
                      required
                      value={datosRepresentante.apellido}
                      onChange={e => setDatosRepresentante({ ...datosRepresentante, apellido: e.target.value })}
                    />
                  </FormGroup>

                  <FormGroup>
                    <FormLabel>¿Qué número de hijo(a) es este menor?</FormLabel>
                    <FormInput
                      type="number"
                      required
                      value={datosRepresentante.numeroHijo}
                      onChange={e => setDatosRepresentante({ ...datosRepresentante, numeroHijo: e.target.value })}
                    />
                  </FormGroup>

                  <FormGroup>
                    <FormLabel>Teléfono</FormLabel>
                    <FormInput
                      type="text"
                      required
                      value={datosRepresentante.telefono}
                      onChange={e => setDatosRepresentante({ ...datosRepresentante, telefono: e.target.value })}
                    />
                  </FormGroup>

                  <FormGroup>
                    <FormLabel>Correo electrónico</FormLabel>
                    <FormInput
                      type="email"
                      required
                      value={datosRepresentante.email}
                      onChange={e => setDatosRepresentante({ ...datosRepresentante, email: e.target.value })}
                    />
                  </FormGroup>
                </>
              )}

              {/* Datos del paciente */}
              <SectionTitle>Datos del paciente</SectionTitle>
              
              <FormGroup>
                <FormLabel>Nombre</FormLabel>
                <FormInput
                  type="text"
                  required
                  value={datosPaciente.nombre}
                  onChange={e => setDatosPaciente({ ...datosPaciente, nombre: e.target.value })}
                />
              </FormGroup>

              <FormGroup>
                <FormLabel>Apellidos</FormLabel>
                <FormInput
                  type="text"
                  required
                  value={datosPaciente.apellido}
                  onChange={e => setDatosPaciente({ ...datosPaciente, apellido: e.target.value })}
                />
              </FormGroup>

              <FormGroup>
                <FormLabel>Fecha de nacimiento</FormLabel>
                <FormInput
                  type="date"
                  required
                  value={datosPaciente.fechaNacimiento}
                  onChange={e => setDatosPaciente({ ...datosPaciente, fechaNacimiento: e.target.value })}
                />
              </FormGroup>

              <FormGroup>
                <FormLabel>Sexo</FormLabel>
                <RadioGroup>
                  <RadioField
                    label="Femenino"
                    name="sexo-paciente"
                    checked={datosPaciente.sexo === 'femenino'}
                    onChange={() => setDatosPaciente({ ...datosPaciente, sexo: 'femenino' })}
                  />
                  <RadioField
                    label="Masculino"
                    name="sexo-paciente"
                    checked={datosPaciente.sexo === 'masculino'}
                    onChange={() => setDatosPaciente({ ...datosPaciente, sexo: 'masculino' })}
                  />
                </RadioGroup>
              </FormGroup>

              {!sinCedula && (
                <>
                  <FormGroup>
                    <FormLabel>Teléfono</FormLabel>
                    <FormInput
                      type="text"
                      required
                      value={datosPaciente.telefono}
                      onChange={e => setDatosPaciente({ ...datosPaciente, telefono: e.target.value })}
                    />
                  </FormGroup>

                  <FormGroup>
                    <FormLabel>Correo electrónico</FormLabel>
                    <FormInput
                      type="email"
                      required
                      value={datosPaciente.email}
                      onChange={e => setDatosPaciente({ ...datosPaciente, email: e.target.value })}
                    />
                  </FormGroup>
                </>
              )}

              {/* Orden médica */}
              <SectionTitle>Orden médica</SectionTitle>
              <FormSubtitle style={{ fontSize: '16px', textAlign: 'left' }}>
                Adjunta la orden de atención médica firmada y sellada por la empresa
              </FormSubtitle>
              
              <UploadFieldContainer>
                <ArchivoAdjuntoForm
                  onFileUploaded={(fileId) => {
                    console.log("Archivo subido, ID recibido:", fileId);
                    setArchivoAdjuntoId(fileId);
                  }}
                  requiereArchivo={true}
                  customStyles={{
                    uploadButton: {
                      background: 'var(--var-sds-color-background-neutral-tertiary, #e3e3e3)',
                      borderRadius: 'var(--var-sds-size-radius-200, 8px)',
                      borderStyle: 'solid',
                      borderColor: 'var(--var-sds-color-border-neutral-secondary, #767676)',
                      borderWidth: '1px',
                      padding: 'var(--var-sds-size-space-300, 12px)',
                      display: 'flex',
                      flexDirection: 'row',
                      gap: 'var(--var-sds-size-space-200, 8px)',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }
                  }}
                />
              </UploadFieldContainer>

              <ButtonContainer>
                <Button 
                  variant="primary"
                  onClick={(e) => {
                    e.preventDefault();
                    if (!archivoAdjuntoId) {
                      alert("Por favor adjunta la orden médica firmada y sellada antes de continuar.");
                      return;
                    }
                    setStep(2);
                  }}
                  style={{
                    background: 'var(--var-sds-color-background-brand-default, #20377a)',
                    borderRadius: 'var(--var-sds-size-radius-200, 8px)',
                    borderStyle: 'solid',
                    borderColor: 'var(--var-sds-color-border-brand-default, #20377a)',
                    borderWidth: '1px',
                    padding: 'var(--var-sds-size-space-300, 12px)',
                    color: 'var(--var-sds-color-text-brand-on-brand, #f0f3ff)'
                  }}
                >
                  Continuar
                </Button>
              </ButtonContainer>
            </FormSection>
          )}

          {step === 2 && (
            <FormSection>
              <div className="button-group">
                <BackButton onClick={() => setStep(1)}>
                  <img src={ArrowLeft} alt="Arrow Left" className="arrow-left" />
                  <ButtonText>Volver al paso anterior</ButtonText>
                </BackButton>
              </div>
              
              <div className="text-content-title">
                <FormTitle>Selecciona la especialidad, el médico y el día.</FormTitle>
              </div>

              {isLoading ? (
                <div style={{ textAlign: 'center', padding: '32px' }}>
                  <p>Cargando datos, por favor espere...</p>
                </div>
              ) : (
                <>
                  <div className="frame-39">
                    <div className="selecciona-el-tipo-de-atenci-n">
                      Selecciona el tipo de atención
                    </div>
                    <div className="frame-7">
                      <div className="choice-card">
                        <div className="radio-field">
                          <div className="checkbox-and-label">
                            <RadioField
                              label="Consulta médica"
                              name="tipoAtencion"
                              checked={modoSeleccion === 'consulta'}
                              onChange={() => setEspecialidadSeleccionada('consulta')}
                              customStyles={{
                                radioStyles: 'radio',
                                radioCheckedStyles: 'radio2',
                                labelStyles: 'label'
                              }}
                            />
                          </div>
                        </div>
                      </div>
                      <div className="choice-card">
                        <div className="radio-field">
                          <div className="checkbox-and-label">
                            <RadioField
                              label="Estudio"
                              name="tipoAtencion"
                              checked={modoSeleccion === 'estudio'}
                              onChange={() => setEspecialidadSeleccionada('estudio')}
                              customStyles={{
                                radioStyles: 'radio3',
                                labelStyles: 'label'
                              }}
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="frame-65">
                    <div className="select-field">
                      <FormLabel className="label2">Especialidad</FormLabel>
                      <FormSelect
                        className="select"
                        value={especialidadSeleccionada}
                        onChange={e => setEspecialidadSeleccionada(e.target.value)}
                      >
                        <option value="" className="value">Selecciona una opción</option>
                        {[...new Set(profesionales.map(p => p.nombre_especialidad))]
                          .filter(Boolean)
                          .map((item, i) => (
                            <option key={i} value={item}>{item}</option>
                          ))}
                      </FormSelect>
                    </div>

                    <div className="select-field">
                      <FormLabel className="label2">Profesional</FormLabel>
                      <FormSelect
                        className="select"
                        value={profesionalSeleccionado}
                        onChange={e => {
                          const id = e.target.value;
                          setProfesionalSeleccionado(id);
                          
                          // Actualizar especialidad basado en el profesional seleccionado
                          const profesional = profesionales.find(p => p.profesional_id === id);
                          if (profesional?.nombre_especialidad) {
                            setEspecialidadSeleccionada(profesional.nombre_especialidad);
                          }
                        }}
                      >
                        <option value="" className="value">Selecciona al profesional</option>
                        {profesionales
                          .filter(p => !especialidadSeleccionada || p.nombre_especialidad === especialidadSeleccionada)
                          .map(p => (
                            <option key={p.profesional_id} value={p.profesional_id}>
                              {p.nombre} {p.apellido}
                            </option>
                          ))}
                      </FormSelect>
                    </div>
                  </div>

                  <div className="frame-38">
                    <div className="title2">Selecciona el día de atención</div>
                    <div className="frame-21">
                      {profesionalSeleccionado && (
                        <>
                          <div className="frame-13">
                            <CalendarioFechasDisponiblesDayPicker
                              profesionalId={profesionalSeleccionado}
                              fechaSeleccionada={fechaSeleccionada}
                              setFechaSeleccionada={setFechaSeleccionada}
                            />
                          </div>
                          
                          <div className="card">
                            <div className="frame-212">
                              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="calendar">
                                <rect width="18" height="18" x="3" y="4" rx="2" ry="2" />
                                <line x1="16" x2="16" y1="2" y2="6" />
                                <line x1="8" x2="8" y1="2" y2="6" />
                                <line x1="3" x2="21" y1="10" y2="10" />
                              </svg>
                              <div className="div">{fechaSeleccionada ? fechaMostrada() : '--'}</div>
                            </div>
                            <div className="frame-22">
                              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="clock">
                                <circle cx="12" cy="12" r="10" />
                                <polyline points="12 6 12 12 16 14" />
                              </svg>
                              <div className="div">{fechaSeleccionada ? horaMostrada() : '--'}</div>
                            </div>
                          </div>
                        </>
                      )}
                      {!profesionalSeleccionado && (
                        <div style={{ textAlign: 'center', padding: '32px', width: '100%' }}>
                          <p>Por favor selecciona un profesional primero para ver las fechas disponibles.</p>
                        </div>
                      )}
                    </div>
                  </div>

                  {profesionalSeleccionado && servicios && (
                    <div className="frame-38">
                      <ServicesList>
                        {servicios
                          .filter(s => {
                            if (!profesionalSeleccionado) return false;
                            const profServicios = profesionalServicioMap.profToServ?.[profesionalSeleccionado] || [];
                            return profServicios.includes(s.id_servicio);
                          })
                          .map(s => (
                            <ServiceItem key={s.id_servicio}>
                              <input
                                type="checkbox"
                                id={`servicio-${s.id_servicio}`}
                                style={{ width: '20px', height: '20px' }}
                                checked={serviciosSeleccionados.includes(s.nombre_servicio)}
                                onChange={(e) => {
                                  if (e.target.checked) {
                                    setServiciosSeleccionados([...serviciosSeleccionados, s.nombre_servicio]);
                                  } else {
                                    setServiciosSeleccionados(
                                      serviciosSeleccionados.filter(servicio => servicio !== s.nombre_servicio)
                                    );
                                  }
                                }}
                              />
                              <label htmlFor={`servicio-${s.id_servicio}`}>
                                {s.nombre_servicio} — USD {Number(s.price_usd).toFixed(2)}
                              </label>
                            </ServiceItem>
                          ))}
                      </ServicesList>
                    </div>
                  )}

                  <div className="button-group2">
                    <Button
                      variant="primary"
                      onClick={() => setStep(3)}
                      disabled={
                        isLoading || 
                        !fechaSeleccionada ||
                        !profesionalSeleccionado ||
                        serviciosSeleccionados.length === 0
                      }
                      style={{
                        background: !isLoading && fechaSeleccionada && profesionalSeleccionado && serviciosSeleccionados.length > 0
                          ? 'var(--var-sds-color-background-brand-default, #20377a)'
                          : 'var(--var-sds-color-background-disabled-default, #dadada)',
                        borderRadius: 'var(--var-sds-size-radius-200, 8px)',
                        borderStyle: 'solid',
                        borderColor: !isLoading && fechaSeleccionada && profesionalSeleccionado && serviciosSeleccionados.length > 0
                          ? 'var(--var-sds-color-border-brand-default, #20377a)'
                          : 'var(--var-sds-color-border-disabled-default, #9d9d9d)',
                        borderWidth: '1px',
                        padding: 'var(--var-sds-size-space-300, 12px)',
                        color: !isLoading && fechaSeleccionada && profesionalSeleccionado && serviciosSeleccionados.length > 0
                          ? 'var(--var-sds-color-text-brand-on-brand, #f0f3ff)'
                          : 'var(--var-sds-color-text-disabled-on-disabled, #9d9d9d)'
                      }}
                    >
                      Continuar
                    </Button>
                  </div>
                </>
              )}
            </FormSection>
          )}

          {step === 3 && (
            <FormSection>
              <BackButton onClick={() => setStep(2)}>
                <img src={ArrowLeft} alt="Arrow Left" className="arrow-left" />
                <ButtonText>Volver al paso anterior</ButtonText>
              </BackButton>

              <FormTitle>Revisa y confirma tu solicitud</FormTitle>
              <FormSubtitle style={{ fontSize: '16px', textAlign: 'left' }}>
                Antes de enviar tu solicitud, revisa que toda la información esté correcta. Si necesitas corregir algo, puedes volver al paso anterior.
              </FormSubtitle>

              <AlertaInfo>
                <span>⚠️</span>
                <p>
                  Recuerda que el día de la consulta el paciente debe presentar su cédula de identidad vigente. 
                  Sin ella, no podrá ser atendido.
                </p>
              </AlertaInfo>

              <SectionTitle>Información de su cita</SectionTitle>
              <ResumenTarjeta>
                <p><strong>🩺 {especialidadSeleccionada}</strong></p>
                <p>
                  <strong>👤 {profesionales.find(p => p.profesional_id === profesionalSeleccionado)?.nombre} {profesionales.find(p => p.profesional_id === profesionalSeleccionado)?.apellido}</strong>
                </p>
                <p><strong>🔬 Servicios:</strong> {serviciosSeleccionados.join(", ")}</p>
                <p><strong>📅 {fechaMostrada()}</strong></p>
                <p><strong>🕐 {horaMostrada()}</strong></p>
                {fechaSeleccionada && fechaSeleccionada.nro_consulta && (
                  <p><strong>🔢 Consulta #{fechaSeleccionada.nro_consulta}</strong></p>
                )}
                <p style={{ fontStyle: 'italic', fontSize: '14px', color: '#666' }}>
                  La atención será por orden de llegada según el horario del profesional.
                </p>
              </ResumenTarjeta>

              <SectionTitle>Información personal</SectionTitle>
              <DatosPersonalesContainer>
                {sinCedula && (
                  <ColumnaDatos>
                    <h4>Datos del representante legal</h4>
                    <p>{datosRepresentante.cedula}-{datosRepresentante.numeroHijo}</p>
                    <p>{datosRepresentante.nombre} {datosRepresentante.apellido}</p>
                    <p>{datosRepresentante.sexo}</p>
                    <p>{datosRepresentante.telefono}</p>
                    <p>{datosRepresentante.email}</p>
                  </ColumnaDatos>
                )}

                <ColumnaDatos>
                  <h4>Datos del paciente</h4>
                  <p>{datosPaciente.nombre} {datosPaciente.apellido}</p>
                  <p>{new Date(datosPaciente.fechaNacimiento).toLocaleDateString('es-CL')}</p>
                  <p>{datosPaciente.sexo}</p>
                </ColumnaDatos>
              </DatosPersonalesContainer>

              <ButtonContainer>
                <Button 
                  variant="primary"
                  onClick={enviarAgendamiento}
                  style={{
                    background: 'var(--var-sds-color-background-brand-default, #20377a)',
                    borderRadius: 'var(--var-sds-size-radius-200, 8px)',
                    borderStyle: 'solid',
                    borderColor: 'var(--var-sds-color-border-brand-default, #20377a)',
                    borderWidth: '1px',
                    padding: 'var(--var-sds-size-space-300, 12px)',
                    color: 'var(--var-sds-color-text-brand-on-brand, #f0f3ff)'
                  }}
                >
                  Enviar solicitud
                </Button>
              </ButtonContainer>
            </FormSection>
          )}

          {step === 4 && (
            <ConfirmacionFinal>
              <FormTitle>Tu solicitud fue enviada correctamente.</FormTitle>
              <FormSubtitle>
                Te enviamos por correo la información de tu cita. Gracias por agendar con nosotros.
              </FormSubtitle>

              <FormAcciones>
                <Button
                  variant="subtle"
                  onClick={() => window.location.href = '/'}
                  style={{
                    borderRadius: 'var(--var-sds-size-radius-200, 8px)',
                    padding: 'var(--var-sds-size-space-300, 12px)',
                  }}
                >
                  Volver a la página principal
                </Button>
                <Button
                  variant="primary"
                  onClick={() => window.location.reload()}
                  style={{
                    background: 'var(--var-sds-color-background-brand-default, #20377a)',
                    borderRadius: 'var(--var-sds-size-radius-200, 8px)',
                    borderStyle: 'solid',
                    borderColor: 'var(--var-sds-color-border-brand-default, #20377a)',
                    borderWidth: '1px',
                    padding: 'var(--var-sds-size-space-300, 12px)',
                    color: 'var(--var-sds-color-text-brand-on-brand, #f0f3ff)'
                  }}
                >
                  Agendar otra cita
                </Button>
              </FormAcciones>
            </ConfirmacionFinal>
          )}
        </FormContainer>
      </HeroNewsletter>
    </SiteFrame>
  );
};

export default AgendamientoEmpresaForm;
