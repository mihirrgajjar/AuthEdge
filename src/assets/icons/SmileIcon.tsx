import React from 'react';
import Svg, {Path, Circle} from 'react-native-svg';
import {theme} from '../../theme';

interface IconProps {
  size?: number;
  color?: string;
}

export const SmileIcon: React.FC<IconProps> = ({
  size = 64,
  color = theme.colors.accentCyan,
}) => {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      {/* Smile path */}
      <Path
        d="M8 14c1.5 2.5 4.5 2.5 6 0"
        stroke={color}
        strokeWidth="2.5"
        strokeLinecap="round"
      />
      {/* Eyes */}
      <Circle cx="9" cy="9.5" r="1.5" fill={theme.colors.meshBlue} />
      <Circle cx="15" cy="9.5" r="1.5" fill={theme.colors.meshBlue} />
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
