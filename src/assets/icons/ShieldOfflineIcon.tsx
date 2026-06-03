import React from 'react';
import Svg, {Path, Line} from 'react-native-svg';
import {theme} from '../../theme';

interface IconProps {
  size?: number;
  color?: string;
}

export const ShieldOfflineIcon: React.FC<IconProps> = ({
  size = 64,
  color = theme.colors.accentCyan,
}) => {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      {/* Shield Outline */}
      <Path
        d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Offline diagonal line representing disconnection */}
      <Line
        x1="4"
        y1="4"
        x2="20"
        y2="20"
        stroke={theme.colors.error}
        strokeWidth="2"
        strokeLinecap="round"
      />
    </Svg>
  );
};
