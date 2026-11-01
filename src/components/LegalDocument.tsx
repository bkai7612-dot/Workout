import React from 'react';
import { Screen } from './Screen';
import { AppText } from './AppText';
import { Banner } from './Banner';
import type { LegalSection } from '@/data/legal';
import { ICO_NOTICE, LEGAL_LAST_UPDATED } from '@/data/legal';

export function LegalDocument({ title, sections }: { title: string; sections: LegalSection[] }) {
  return (
    <Screen edges={[]}>
      <AppText variant="h1">{title}</AppText>
      <AppText variant="caption" tone="muted" style={{ marginTop: 4, marginBottom: 16 }}>
        Last updated: {LEGAL_LAST_UPDATED}
      </AppText>
      <Banner message="Placeholder document — to be reviewed by a solicitor and completed with business details before launch." />
      {sections.map((s) => (
        <React.Fragment key={s.heading}>
          <AppText variant="h3" style={{ marginTop: 16, marginBottom: 6 }}>
            {s.heading}
          </AppText>
          <AppText tone="secondary" style={{ lineHeight: 23 }}>
            {s.body}
          </AppText>
        </React.Fragment>
      ))}
      <AppText variant="caption" tone="muted" center style={{ marginTop: 24 }}>
        {ICO_NOTICE}
      </AppText>
    </Screen>
  );
}
