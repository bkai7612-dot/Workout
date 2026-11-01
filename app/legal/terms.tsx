import React from 'react';
import { LegalDocument } from '@/components/LegalDocument';
import { TERMS } from '@/data/legal';

export default function Terms() {
  return <LegalDocument title="Terms & Conditions" sections={TERMS} />;
}
