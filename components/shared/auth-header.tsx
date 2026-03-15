import * as React from 'react';
import { Text, View } from 'react-native';
import Svg, { Circle, Ellipse, Line, Path, Polygon } from 'react-native-svg';

interface AuthHeaderProps {
  /** Icon component to show in the badge */
  icon: React.ReactNode;
  title: string;
  subtitle: string;
  /** Optional top-left slot — e.g. a back button */
  topLeft?: React.ReactNode;
}

/**
 * Fixed-colour auth header with energy vector overlay.
 * Uses brand.DEFAULT (#0C1A2E) directly — never flips in dark/light mode.
 * All colours below are hardcoded on purpose (physical scene rule).
 */
export function AuthHeader({ icon, title, subtitle, topLeft }: AuthHeaderProps) {
  return (
    <View
      style={{ backgroundColor: '#0D2C40' }}
      className="relative overflow-hidden px-6 pb-14 pt-14">

      {/* ── Energy SVG vectors overlay ─────────────────────── */}
      <View
        style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}
        pointerEvents="none">
        <Svg width="100%" height="100%" viewBox="0 0 390 220" preserveAspectRatio="xMidYMid slice">

          {/* ── Large faint circuit ring top-right ── */}
          <Circle cx="340" cy="30" r="90" fill="none" stroke="#2272A6" strokeWidth="0.5" opacity="0.25" />
          <Circle cx="340" cy="30" r="65" fill="none" stroke="#2272A6" strokeWidth="0.3" opacity="0.15" />

          {/* ── Circuit board trace lines ── */}
          <Line x1="0" y1="120" x2="160" y2="120" stroke="#2272A6" strokeWidth="0.6" opacity="0.3" />
          <Line x1="160" y1="120" x2="160" y2="80" stroke="#2272A6" strokeWidth="0.6" opacity="0.3" />
          <Line x1="160" y1="80" x2="220" y2="80" stroke="#2272A6" strokeWidth="0.6" opacity="0.3" />

          {/* Bottom-right trace branch */}
          <Line x1="260" y1="200" x2="260" y2="150" stroke="#2272A6" strokeWidth="0.6" opacity="0.25" />
          <Line x1="260" y1="150" x2="320" y2="150" stroke="#2272A6" strokeWidth="0.6" opacity="0.25" />
          <Line x1="320" y1="150" x2="320" y2="110" stroke="#2272A6" strokeWidth="0.6" opacity="0.25" />

          {/* ── Circuit nodes ── */}
          <Circle cx="160" cy="120" r="2.5" fill="#2E87C0" opacity="0.5" />
          <Circle cx="160" cy="80"  r="2.5" fill="#2E87C0" opacity="0.5" />
          <Circle cx="220" cy="80"  r="2"   fill="#2E87C0" opacity="0.35" />
          <Circle cx="260" cy="150" r="2.5" fill="#2E87C0" opacity="0.4" />
          <Circle cx="320" cy="150" r="2"   fill="#2E87C0" opacity="0.35" />

          {/* ── Lightning bolt — top left, large faint ── */}
          <Polygon
            points="28,10 14,42 26,42 16,72 36,32 22,32"
            fill="none"
            stroke="#2272A6"
            strokeWidth="1"
            opacity="0.18"
          />

          {/* ── Lightning bolt — small, top right area ── */}
          <Polygon
            points="295,18 288,34 295,34 287,52 300,28 293,28"
            fill="none"
            stroke="#2272A6"
            strokeWidth="0.8"
            opacity="0.25"
          />

          {/* ── Sine wave / energy wave — bottom band ── */}
          <Path
            d="M0 180 C20 168, 40 192, 60 180 C80 168, 100 192, 120 180 C140 168, 160 192, 180 180 C200 168, 220 192, 240 180 C260 168, 280 192, 300 180 C320 168, 340 192, 360 180 C375 170, 385 180, 390 176"
            fill="none"
            stroke="#2272A6"
            strokeWidth="1"
            opacity="0.22"
          />
          {/* Second wave, offset */}
          <Path
            d="M0 192 C20 180, 40 204, 60 192 C80 180, 100 204, 120 192 C140 180, 160 204, 180 192 C200 180, 220 204, 240 192 C260 180, 280 204, 300 192 C320 180, 340 204, 360 192 L390 188"
            fill="none"
            stroke="#1A5A88"
            strokeWidth="0.7"
            opacity="0.18"
          />

          {/* ── Power plug icon outline — bottom left ── */}
          <Path
            d="M38 170 L38 182 M44 170 L44 182 M35 182 L47 182 L47 188 Q41 196 35 188 L35 182 Z"
            fill="none"
            stroke="#2272A6"
            strokeWidth="1"
            strokeLinecap="round"
            strokeLinejoin="round"
            opacity="0.25"
          />

          {/* ── Small scatter dots ── */}
          <Circle cx="80"  cy="30"  r="1.2" fill="#2E87C0" opacity="0.35" />
          <Circle cx="190" cy="55"  r="1"   fill="#2E87C0" opacity="0.3" />
          <Circle cx="240" cy="130" r="1.5" fill="#2E87C0" opacity="0.25" />
          <Circle cx="360" cy="80"  r="1.2" fill="#2E87C0" opacity="0.3" />
          <Circle cx="100" cy="160" r="1"   fill="#2E87C0" opacity="0.25" />
          <Circle cx="350" cy="190" r="1.2" fill="#2E87C0" opacity="0.25" />

          {/* ── Ellipse ring — bottom right ── */}
          <Ellipse cx="370" cy="210" rx="60" ry="40" fill="none" stroke="#2272A6" strokeWidth="0.5" opacity="0.22" />

        </Svg>
      </View>

      {/* ── Content ─────────────────────────────────────────── */}
      {topLeft && <View className="mb-6">{topLeft}</View>}

      {/* Icon badge */}
      <View
        style={{ backgroundColor: '#2272A620', borderColor: '#2272A640', borderWidth: 1 }}
        className="mb-5 size-14 items-center justify-center rounded-2xl">
        {icon}
      </View>

      <Text style={{ color: '#F0F6FF', fontSize: 28, fontWeight: '700' }}>
        {title}
      </Text>
      <Text style={{ color: '#8BA8C4', fontSize: 15, marginTop: 4 }}>
        {subtitle}
      </Text>
    </View>
  );
}