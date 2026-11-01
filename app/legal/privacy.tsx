import React from 'react';
import { LegalDocument } from '@/components/LegalDocument';
import { PRIVACY_POLICY } from '@/data/legal';

export default function Privacy() {
  return <LegalDocument title="Privacy Policy" sections={PRIVACY_POLICY} />;
}
