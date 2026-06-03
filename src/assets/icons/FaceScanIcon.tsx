import React from 'react';
import Svg, {Path, Circle, Line} from 'react-native-svg';
import {theme} from '../../theme';

interface IconProps {
  size?: number;
  color?: string;
}

export const FaceScanIcon: React.FC<IconProps> = ({
  size = 64,
  color = theme.colors.accentCyan,
}) => {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      {/* Corner Brackets */}
      <Path
        d="M3 8V5a2 2 0 012-2h3M16 3h3a2 2 0 012 2v3M21 16v3a2 2 0 01-2 2h-3M8 21H5a2 2 0 01-2-2v-3"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
      />
      {/* Face oval shape */}
      <Path
        d="M12 18c2.5 0 4.5-2.2 4.5-5s-2-5-4.5-5S7.5 10.2 7.5 13s2 5 4.5 5z"
        stroke={theme.colors.meshBlue}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Eyes & Mouth */}
      <Circle cx="10" cy="11.5" r="1" fill={theme.colors.meshBlue} />
      <Circle cx="14" cy="11.5" r="1" fill={theme.colors.meshBlue} />
      <Path
        d="M10.5 15c.5.5 1 .7 1.5.7s1-.2 1.5-.7"
        stroke={theme.colors.meshBlue}
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      {/* Laser Scan Line */}
      <Line
        x1="4"
        y1="13"
        x2="20"
        y2="13"
        stroke={color}
        strokeWidth="2"
        strokeDasharray="2 2"
      />
    </Svg>
  );
};
