import React from 'react';
import { StyleSheet, View } from 'react-native';
import Svg, { Circle, Ellipse, Rect } from 'react-native-svg';
import { useTheme } from '@/hooks/useTheme';
import type { MuscleGroup } from '@/types';
import { AppText } from './AppText';

interface Props {
  worked: Set<MuscleGroup>;
  height?: number;
}

type Shape =
  | { kind: 'rect'; x: number; y: number; w: number; h: number; rx: number }
  | { kind: 'ellipse'; cx: number; cy: number; rx: number; ry: number }
  | { kind: 'circle'; cx: number; cy: number; r: number };

interface Region {
  group: MuscleGroup | null; // null = neutral (head, hands, etc.)
  shapes: Shape[];
}

const mirror = (s: Shape): Shape => {
  if (s.kind === 'rect') return { ...s, x: 120 - s.x - s.w };
  return { ...s, cx: 120 - s.cx };
};
const pair = (s: Shape): Shape[] => [s, mirror(s)];

const COMMON_NEUTRAL: Region = {
  group: null,
  shapes: [
    { kind: 'circle', cx: 60, cy: 18, r: 12 },
    { kind: 'rect', x: 54, y: 29, w: 12, h: 9, rx: 3 },
    ...pair({ kind: 'ellipse', cx: 21, cy: 104, rx: 5, ry: 15 }), // forearms
    ...pair({ kind: 'circle', cx: 19, cy: 124, r: 5 }), // hands
    ...pair({ kind: 'rect', x: 43, y: 226, w: 14, h: 7, rx: 3 }), // feet
  ],
};

const FRONT: Region[] = [
  COMMON_NEUTRAL,
  { group: 'shoulders', shapes: pair({ kind: 'ellipse', cx: 35, cy: 48, rx: 11, ry: 9 }) },
  { group: 'chest', shapes: pair({ kind: 'rect', x: 41, y: 41, w: 18, h: 22, rx: 7 }) },
  { group: 'biceps', shapes: pair({ kind: 'ellipse', cx: 26, cy: 72, rx: 6, ry: 14 }) },
  { group: 'core', shapes: [{ kind: 'rect', x: 45, y: 66, w: 30, h: 44, rx: 9 }] },
  { group: null, shapes: [{ kind: 'rect', x: 43, y: 112, w: 34, h: 12, rx: 6 }] },
  { group: 'legs', shapes: [...pair({ kind: 'rect', x: 42, y: 126, w: 16, h: 52, rx: 8 }), ...pair({ kind: 'rect', x: 44, y: 182, w: 12, h: 42, rx: 6 })] },
];

const BACK: Region[] = [
  COMMON_NEUTRAL,
  { group: 'shoulders', shapes: pair({ kind: 'ellipse', cx: 35, cy: 48, rx: 11, ry: 9 }) },
  { group: 'back', shapes: [{ kind: 'rect', x: 42, y: 39, w: 36, h: 18, rx: 6 }, { kind: 'rect', x: 43, y: 59, w: 34, h: 32, rx: 9 }] },
  { group: 'triceps', shapes: pair({ kind: 'ellipse', cx: 26, cy: 72, rx: 6, ry: 14 }) },
  { group: 'core', shapes: [{ kind: 'rect', x: 47, y: 93, w: 26, h: 16, rx: 5 }] },
  { group: 'glutes', shapes: pair({ kind: 'ellipse', cx: 51, cy: 120, rx: 10, ry: 11 }) },
  { group: 'legs', shapes: [...pair({ kind: 'rect', x: 42, y: 133, w: 16, h: 45, rx: 8 }), ...pair({ kind: 'rect', x: 44, y: 182, w: 12, h: 42, rx: 6 })] },
];

function Figure({ regions, worked, height, label }: { regions: Region[]; worked: Set<MuscleGroup>; height: number; label: string }) {
  const { colors } = useTheme();
  const fullBody = worked.has('full body');
  return (
    <View style={styles.figure}>
      <Svg width={(height * 120) / 240} height={height} viewBox="0 0 120 240" accessibilityLabel={`${label} body map`}>
        {regions.map((region, ri) =>
          region.shapes.map((s, si) => {
            const active = region.group != null && (fullBody || worked.has(region.group));
            const fill = region.group == null ? colors.surfaceAlt : active ? colors.accent : colors.muted;
            const key = `${ri}-${si}`;
            const stroke = colors.background;
            if (s.kind === 'rect') return <Rect key={key} x={s.x} y={s.y} width={s.w} height={s.h} rx={s.rx} fill={fill} stroke={stroke} strokeWidth={1} />;
            if (s.kind === 'ellipse') return <Ellipse key={key} cx={s.cx} cy={s.cy} rx={s.rx} ry={s.ry} fill={fill} stroke={stroke} strokeWidth={1} />;
            return <Circle key={key} cx={s.cx} cy={s.cy} r={s.r} fill={fill} stroke={stroke} strokeWidth={1} />;
          }),
        )}
      </Svg>
      <AppText variant="caption" tone="muted" style={{ marginTop: 6 }}>
        {label}
      </AppText>
    </View>
  );
}

export function BodyMap({ worked, height = 240 }: Props) {
  return (
    <View style={styles.row}>
      <Figure regions={FRONT} worked={worked} height={height} label="Front" />
      <Figure regions={BACK} worked={worked} height={height} label="Back" />
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', justifyContent: 'space-evenly', paddingVertical: 8 },
  figure: { alignItems: 'center' },
});
