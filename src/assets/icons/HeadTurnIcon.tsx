import React from 'react';
import Svg, {Path} from 'react-native-svg';
import {theme} from '../../theme';

interface IconProps {
  size?: number;
  color?: string;
}

export const HeadTurnIcon: React.FC<IconProps> = ({
  size = 64,
  color = theme.colors.accentCyan,
}) => {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      {/* Side Profile Face Shape */}
      <Path
        d="M12 4c-3.5 0-6 2.5-6 6 0 1.5.5 3 1.5 4L7 18h5l2.5-3.5c1.5-1 2.5-2.5 2.5-4.5 0-3.5-2.5-6-6-6z"
        stroke={theme.colors.meshBlue}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Curved directional turn arrow */}
      <Path
        d="M3 12h5m-2.5-2.5L8 12 5.5 14.5M21 12h-5m2.5-2.5l-2.5 2.5 2.5 2.5"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
};
