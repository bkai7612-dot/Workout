import React, { useState } from 'react';
import { View } from 'react-native';
import Svg, { Circle, Defs, Line, LinearGradient, Path, Stop, Text as SvgText } from 'react-native-svg';
import { useTheme } from '@/hooks/useTheme';
import { AppText } from './AppText';

export interface ChartPoint {
  x: number; // timestamp (ms)
  y: number;
}

interface Props {
  data: ChartPoint[];
  height?: number;
  formatY?: (v: number) => string;
  formatX?: (v: number) => string;
}

const PAD = { top: 12, right: 12, bottom: 24, left: 40 };

export function LineChart({ data, height = 200, formatY = (v) => v.toFixed(1), formatX }: Props) {
  const { colors } = useTheme();
  const [width, setWidth] = useState(0);

  if (data.length === 0) {
    return (
      <View style={{ height, alignItems: 'center', justifyContent: 'center' }}>
        <AppText variant="small" tone="muted">
          No entries in this range yet.
        </AppText>
      </View>
    );
  }

  const xs = data.map((d) => d.x);
  const ys = data.map((d) => d.y);
  let minX = Math.min(...xs);
  let maxX = Math.max(...xs);
  let minY = Math.min(...ys);
  let maxY = Math.max(...ys);
  if (minX === maxX) {
    minX -= 86400000;
    maxX += 86400000;
  }
  const yPad = Math.max((maxY - minY) * 0.15, 0.5);
  minY -= yPad;
  maxY += yPad;

  const innerW = Math.max(1, width - PAD.left - PAD.right);
  const innerH = height - PAD.top - PAD.bottom;
  const sx = (x: number) => PAD.left + ((x - minX) / (maxX - minX)) * innerW;
  const sy = (y: number) => PAD.top + (1 - (y - minY) / (maxY - minY)) * innerH;

  const path = data.map((d, i) => `${i === 0 ? 'M' : 'L'}${sx(d.x).toFixed(1)},${sy(d.y).toFixed(1)}`).join(' ');
  const area = `${path} L${sx(data[data.length - 1].x)},${PAD.top + innerH} L${sx(data[0].x)},${PAD.top + innerH} Z`;
  const ticks = [0, 0.5, 1].map((t) => minY + t * (maxY - minY));
  const fmtX =
    formatX ?? ((v: number) => new Date(v).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' }));

  return (
    <View onLayout={(e) => setWidth(e.nativeEvent.layout.width)} style={{ height }} accessibilityLabel="Weight chart">
      {width > 0 ? (
        <Svg width={width} height={height}>
          <Defs>
            <LinearGradient id="fill" x1="0" y1="0" x2="0" y2="1">
              <Stop offset="0" stopColor={colors.accent} stopOpacity={0.35} />
              <Stop offset="1" stopColor={colors.accent} stopOpacity={0} />
            </LinearGradient>
          </Defs>
          {ticks.map((t, i) => (
            <React.Fragment key={i}>
              <Line x1={PAD.left} x2={width - PAD.right} y1={sy(t)} y2={sy(t)} stroke={colors.border} strokeDasharray="4 4" />
              <SvgText x={PAD.left - 6} y={sy(t) + 4} fontSize={10} fill={colors.textMuted} textAnchor="end">
                {formatY(t)}
              </SvgText>
            </React.Fragment>
          ))}
          <Path d={area} fill="url(#fill)" />
          <Path d={path} stroke={colors.accentText} strokeWidth={2.5} fill="none" />
          {data.length <= 40 &&
            data.map((d, i) => (
              <Circle key={i} cx={sx(d.x)} cy={sy(d.y)} r={3.5} fill={colors.accent} stroke={colors.background} strokeWidth={1.5} />
            ))}
          <SvgText x={PAD.left} y={height - 6} fontSize={10} fill={colors.textMuted} textAnchor="start">
            {fmtX(minX)}
          </SvgText>
          <SvgText x={width - PAD.right} y={height - 6} fontSize={10} fill={colors.textMuted} textAnchor="end">
            {fmtX(maxX)}
          </SvgText>
        </Svg>
      ) : null}
    </View>
  );
}
