import React from 'react';
import Svg, {Path, Circle, Rect} from 'react-native-svg';
import {theme} from '../../theme';

interface IconProps {
  size?: number;
  color?: string;
}

export const SecureSyncIcon: React.FC<IconProps> = ({
  size = 64,
  color = theme.colors.accentCyan,
}) => {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      {/* Cloud Outline */}
      <Path
        d="M18 10h.01M9.5 16h5M12 7c-2.76 0-5 2.24-5 5 0 .34.04.67.11.99C4.84 13.56 3 15.58 3 18c0 2.76 2.24 5 5 5h10c2.76 0 5-2.24 5-5 0-2.64-2.05-4.78-4.65-4.96C17.75 10.45 15.11 7 12 7z"
        stroke={theme.colors.meshBlue}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Padlock inside cloud */}
      <Rect
        x="9.5"
        y="12"
        width="5"
        height="4"
        rx="1"
        fill={color}
        stroke={color}
        strokeWidth="1"
      />
      <Path
        d="M10.5 12V10.5a1.5 1.5 0 113 0V12"
        stroke={color}
        strokeWidth="1"
        strokeLinecap="round"
      />
    </Svg>
  );
};
