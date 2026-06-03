import React from 'react';
import Svg, {Path} from 'react-native-svg';
import {theme} from '../../theme';

interface IconProps {
  size?: number;
  color?: string;
}

export const BlinkIcon: React.FC<IconProps> = ({
  size = 64,
  color = theme.colors.accentCyan,
}) => {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      {/* Blinking eyes (closed curved lines) */}
      <Path
        d="M6 10c1.5 2 3.5 2 5 0M13 10c1.5 2 3.5 2 5 0"
        stroke={color}
        strokeWidth="2.5"
        strokeLinecap="round"
      />
      {/* Face contour */}
      <Path
        d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z"
        stroke={theme.colors.meshBlue}
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </Svg>
  );
};
